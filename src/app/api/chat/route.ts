import { NextRequest } from 'next/server';

const OLLAMA_URL   = process.env.OLLAMA_URL   ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2';
const API_BASE     = 'https://api-pslt.matheovieilleville.fr/api/v1';

/* ── Types minimaux pour le contexte ── */
interface ApiProduct {
  name: string;
  slug: string;
  priceHt?: string;
  priceTtc?: string;
  price?: number;
  shortDescription?: string;
  description?: string;
  status?: string;
  stock?: number;
  category?: { name?: string };
  certifications?: string[];
}

interface ApiCategory {
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  isActive?: boolean;
  status?: string;
}

/* ── Fetch helpers (server-side, pas de token requis pour lecture publique) ── */
async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 120 }, // cache 2 min
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data: ApiCategory[] = json?.data ?? json ?? [];
    return Array.isArray(data)
      ? data.filter(c => c.isActive !== false && c.status !== 'inactive')
      : [];
  } catch {
    return [];
  }
}

async function searchProducts(query: string, limit = 6): Promise<ApiProduct[]> {
  try {
    const params = new URLSearchParams({ search: query, limit: String(limit) });
    const res = await fetch(`${API_BASE}/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Support both {data:{data:[...]}} and {data:[...]}
    const list = json?.data?.data ?? json?.data ?? json ?? [];
    return Array.isArray(list)
      ? list.filter((p: ApiProduct) => p.status !== 'archived' && p.status !== 'draft')
      : [];
  } catch {
    return [];
  }
}

/* ── Format context block injected before the user message ── */
function buildContext(categories: ApiCategory[], products: ApiProduct[]): string {
  const lines: string[] = ['## Données réelles du catalogue Althea Systems\n'];

  if (categories.length) {
    lines.push('### Catégories disponibles');
    for (const c of categories) {
      const count = c.productCount ? ` (${c.productCount} produits)` : '';
      lines.push(`- **${c.name}**${count}${c.description ? ' — ' + c.description : ''}`);
    }
    lines.push('');
  }

  if (products.length) {
    lines.push('### Produits correspondants');
    for (const p of products) {
      const price = p.priceTtc
        ? `${parseFloat(p.priceTtc).toFixed(2)} € TTC`
        : p.priceHt
        ? `${parseFloat(p.priceHt).toFixed(2)} € HT`
        : p.price
        ? `${p.price.toFixed(2)} €`
        : 'prix sur demande';

      const stock = p.stock != null
        ? p.stock > 0 ? `En stock (${p.stock})` : 'Rupture de stock'
        : '';

      const cat = p.category?.name ? ` | Catégorie: ${p.category.name}` : '';
      const desc = p.shortDescription ?? (p.description ? p.description.slice(0, 120) + '…' : '');

      lines.push(`- **${p.name}** — ${price}${cat}${stock ? ' | ' + stock : ''}`);
      if (desc) lines.push(`  ${desc}`);
      lines.push(`  Fiche produit: /products/${p.slug}`);
    }
    lines.push('');
  }

  if (!categories.length && !products.length) {
    lines.push('_(Aucune donnée récupérée depuis l\'API pour cette requête)_');
  }

  return lines.join('\n');
}

/* ── System prompt base ── */
const LANG_NAMES: Record<string, string> = {
  fr: 'français',
  en: 'English',
  ar: 'العربية (Arabic)',
  he: 'עברית (Hebrew)',
};

function buildSystemPrompt(locale: string): string {
  const langName = LANG_NAMES[locale] || 'français';
  return `Tu es l'assistant virtuel d'Althea Systems, fournisseur d'équipements médicaux professionnels.

Le bloc "CATALOGUE" ci-dessus contient les données en temps réel de notre base. Utilise UNIQUEMENT ces données pour répondre aux questions.

LANGUE DE RÉPONSE : ${langName} — TOUTES tes réponses doivent être rédigées en ${langName}, quelle que soit la langue de la question. Si le nom d'un produit est en français dans le catalogue, garde-le en français (c'est un nom propre) mais le reste de ta phrase doit être en ${langName}.

Règles ABSOLUES :
- N'affiche JAMAIS le bloc CATALOGUE dans ta réponse — c'est un contexte interne uniquement
- Réponds TOUJOURS en 1 à 3 phrases maximum — jamais plus
- Jamais de listes à puces sauf si on te demande explicitement plusieurs produits
- Cite le nom exact du produit et son prix TTC
- Ajoute le lien /products/<slug> en fin de réponse si pertinent
- Si le produit n'est pas dans le contexte : message d'invite à contacter contact@altheasystems.fr (dans la langue de réponse)
- Zéro conseil médical, uniquement du matériel
- Ton direct, professionnel, sans introduction ni conclusion`;
}

/* ── Route handler ── */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.messages || !Array.isArray(body.messages)) {
    return Response.json({ error: 'messages requis' }, { status: 400 });
  }

  const userMessages: { role: string; content: string }[] = body.messages;
  const locale: string = typeof body.locale === 'string' ? body.locale : 'fr';
  const lastUserMsg = [...userMessages].reverse().find(m => m.role === 'user')?.content ?? '';

  // Fetch context in parallel
  const [categories, products] = await Promise.all([
    fetchCategories(),
    lastUserMsg.trim() ? searchProducts(lastUserMsg) : Promise.resolve([]),
  ]);

  const contextBlock = buildContext(categories, products);

  // Inject context into system prompt so the model treats it as instructions, not as text to echo
  const systemPrompt = `## CATALOGUE\n${contextBlock}\n\n${buildSystemPrompt(locale)}`;

  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...userMessages,
  ];

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages: ollamaMessages, stream: true }),
    });
  } catch {
    return Response.json(
      { error: 'Ollama est inaccessible. Vérifiez qu\'il est lancé sur le port 11434.' },
      { status: 502 }
    );
  }

  if (!ollamaRes.ok) {
    const text = await ollamaRes.text();
    return Response.json({ error: `Ollama error: ${text}` }, { status: ollamaRes.status });
  }

  return new Response(ollamaRes.body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
