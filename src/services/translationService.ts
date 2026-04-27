// ──────────────────────────────────────────────────────────────
// Translation service — traduit les contenus dynamiques venant de
// l'API (noms produits, descriptions, catégories, etc.) côté client.
//
// Stratégie :
// - API gratuite MyMemory (1000 req/jour, pas de clé)
// - Cache localStorage agressif (30 jours) pour minimiser les appels
// - Queue concurrente (max 3) pour ne pas spammer
// - Fallback silencieux au texte original si l'API plante
// - Skip total quand la locale cible = locale source ('fr')
//
// Limitations connues (cf. README) :
// - Pas de SEO multilingue (le HTML SSR contient toujours le FR)
// - Qualité de traduction variable, surtout sur jargon métier
// - Marques / noms propres parfois traduits à tort
// ──────────────────────────────────────────────────────────────

import type { Locale } from '@/lib/i18n/translations';

const SOURCE_LOCALE: Locale = 'fr';
const CACHE_PREFIX = 'althea_t_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const MAX_CONCURRENT = 3;
const ENDPOINT = 'https://api.mymemory.translated.net/get';

interface CachedEntry {
  v: string;   // texte traduit
  t: number;   // timestamp
}

// In-memory cache pour éviter les accès localStorage répétitifs sur le même render
const memoryCache = new Map<string, string>();

// Promesses en cours pour éviter de lancer plusieurs fois la même traduction
const inFlight = new Map<string, Promise<string>>();

// File d'attente avec limite de concurrence
let activeCount = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  activeCount--;
  const next = queue.shift();
  if (next) next();
}

/* ── Cache helpers ───────────────────────────────────────── */

function cacheKey(text: string, lang: Locale): string {
  // Pas de hash — on utilise la string brute encodée. localStorage gère ~5MB,
  // largement suffisant pour quelques centaines d'entrées.
  return `${CACHE_PREFIX}${lang}:${text}`;
}

function readCache(text: string, lang: Locale): string | null {
  const memoryHit = memoryCache.get(`${lang}:${text}`);
  if (memoryHit !== undefined) return memoryHit;

  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(text, lang));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedEntry;
    if (Date.now() - entry.t > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(text, lang));
      return null;
    }
    memoryCache.set(`${lang}:${text}`, entry.v);
    return entry.v;
  } catch {
    return null;
  }
}

function writeCache(text: string, lang: Locale, value: string): void {
  memoryCache.set(`${lang}:${text}`, value);
  if (typeof window === 'undefined') return;
  try {
    const entry: CachedEntry = { v: value, t: Date.now() };
    localStorage.setItem(cacheKey(text, lang), JSON.stringify(entry));
  } catch {
    // Quota dépassé : on purge les vieilles entrées et on retente
    purgeExpiredEntries();
  }
}

function purgeExpiredEntries(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const entry = JSON.parse(raw) as CachedEntry;
      if (now - entry.t > CACHE_TTL_MS) toRemove.push(key);
    } catch {
      toRemove.push(key); // entrée corrompue : on la dégage
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

/* ── API call ────────────────────────────────────────────── */

async function callMyMemory(text: string, lang: Locale): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${SOURCE_LOCALE}|${lang}`,
    de: 'althea@example.com', // recommandé par MyMemory pour bumper la limite
  });
  const url = `${ENDPOINT}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };

  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error('MyMemory: réponse vide');
  return translated;
}

/* ── Public API ──────────────────────────────────────────── */

/**
 * Traduit un texte. Retourne le texte original si :
 *   - la locale cible == 'fr' (source)
 *   - le texte est vide / null
 *   - l'API plante (fallback silencieux)
 */
export async function translateText(text: string, lang: Locale): Promise<string> {
  if (!text || lang === SOURCE_LOCALE) return text || '';

  const cached = readCache(text, lang);
  if (cached !== null) return cached;

  const inflightKey = `${lang}:${text}`;
  const existing = inFlight.get(inflightKey);
  if (existing) return existing;

  const promise = (async () => {
    await acquireSlot();
    try {
      const translated = await callMyMemory(text, lang);
      writeCache(text, lang, translated);
      return translated;
    } catch {
      return text; // fallback silencieux
    } finally {
      releaseSlot();
      inFlight.delete(inflightKey);
    }
  })();

  inFlight.set(inflightKey, promise);
  return promise;
}

/**
 * Traduit plusieurs textes en parallèle (avec respect de la limite de concurrence).
 */
export async function translateBatch(texts: string[], lang: Locale): Promise<string[]> {
  return Promise.all(texts.map((t) => translateText(t, lang)));
}

/**
 * Vide tout le cache de traduction (utile en debug ou si l'utilisateur
 * remarque des traductions de mauvaise qualité).
 */
export function clearTranslationCache(): void {
  memoryCache.clear();
  if (typeof window === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
