'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, X, PackageSearch, SlidersHorizontal, Loader2 } from 'lucide-react';

import type { Product, Category } from '@/types/api';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import ProductCard from '@/components/products/ProductCard';
import { T } from '@/components/ui/TranslatedText';
import { useI18n } from '@/lib/i18n';

/* ─────────────────────────────────────────────────────────────
   Règles de correspondance du cahier des charges :
   1) Correspondance exacte
   2) Un caractère de différence (distance Levenshtein ≤ 1)
   3) Commence par
   4) Contient
   Les scores permettent de trier les résultats par pertinence.
───────────────────────────────────────────────────────────── */

const SCORE = {
  EXACT: 100,
  ONE_CHAR_DIFF: 80,
  STARTS_WITH: 70,
  CONTAINS_NAME: 55,
  CONTAINS_DESC: 35,
  CONTAINS_SPECS: 25,
  CONTAINS_BRAND: 40,
} as const;

/**
 * Retourne true si `a` et `b` diffèrent d'un seul caractère (insertion,
 * suppression ou substitution). Implémentation linéaire sans matrice.
 */
function isWithinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else if (la > lb) {
      i++;
    } else {
      j++;
    }
  }
  if (i < la || j < lb) edits++;
  return edits <= 1;
}

/** Score de pertinence d'un produit pour une requête donnée. 0 = non pertinent. */
function scoreProduct(p: Product, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1; // sans query, tout passe avec score neutre

  const name = (p.name ?? '').toLowerCase();
  if (!name) return 0;

  // 1) Exact
  if (name === q) return SCORE.EXACT;

  // 2) Un caractère de différence (uniquement sur des chaînes proches)
  if (isWithinOneEdit(name, q)) return SCORE.ONE_CHAR_DIFF;

  // 3) Commence par
  if (name.startsWith(q)) return SCORE.STARTS_WITH;

  // 4) Contient dans le nom
  if (name.includes(q)) return SCORE.CONTAINS_NAME;

  // 5) Contient dans la marque
  if ((p.brand ?? '').toLowerCase().includes(q)) return SCORE.CONTAINS_BRAND;

  // 6) Contient dans la description
  if (
    (p.description ?? '').toLowerCase().includes(q) ||
    (p.shortDescription ?? '').toLowerCase().includes(q)
  ) {
    return SCORE.CONTAINS_DESC;
  }

  // 7) Contient dans les caractéristiques techniques
  const specs = p.technicalSpecs ?? p.specifications;
  if (specs) {
    for (const v of Object.values(specs)) {
      if (String(v).toLowerCase().includes(q)) return SCORE.CONTAINS_SPECS;
    }
  }

  // 8) Features / applications
  if ((p.features ?? []).some((f) => f.toLowerCase().includes(q))) return SCORE.CONTAINS_SPECS;
  if ((p.applications ?? []).some((a) => a.toLowerCase().includes(q))) return SCORE.CONTAINS_SPECS;

  return 0;
}

type SortMode = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'availability';

function SearchInner() {
  const { tr } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Charge une fois tous les produits + catégories (scan côté client rapide).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [prodRes, cats] = await Promise.all([
          productService.getProducts({ limit: 500 }),
          categoryService.getCategories().catch(() => [] as Category[]),
        ]);
        if (cancelled) return;
        setProducts(prodRes.products);
        setCategories(cats);
      } catch (err) {
        console.error('[search] load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Synchronise `?q=` → input et input → URL (replace, pas de nouvelle history entry)
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (current !== query) {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      if (query.trim()) sp.set('q', query.trim());
      else sp.delete('q');
      router.replace(`/search${sp.toString() ? `?${sp.toString()}` : ''}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Pipeline de recherche : scoring → filtres → tri
  const results = useMemo(() => {
    const minNum = priceMin ? parseFloat(priceMin) : undefined;
    const maxNum = priceMax ? parseFloat(priceMax) : undefined;

    const scored = products
      .map((p) => ({ p, score: scoreProduct(p, query) }))
      .filter(({ score }) => score > 0)
      .filter(({ p }) => {
        if (inStockOnly) {
          const avail = p.stock === undefined || p.stock === null || p.stock > 0;
          if (!avail) return false;
        }
        if (selectedCategories.size > 0) {
          const cid = p.categoryId ?? p.category?.id;
          if (!cid || !selectedCategories.has(cid)) return false;
        }
        if (minNum !== undefined && p.price < minNum) return false;
        if (maxNum !== undefined && p.price > maxNum) return false;
        return true;
      });

    switch (sortMode) {
      case 'price_asc':
        scored.sort((a, b) => a.p.price - b.p.price);
        break;
      case 'price_desc':
        scored.sort((a, b) => b.p.price - a.p.price);
        break;
      case 'newest':
        scored.sort(
          (a, b) =>
            new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime(),
        );
        break;
      case 'availability': {
        const isAvail = (p: Product) =>
          p.stock === undefined || p.stock === null || p.stock > 0;
        scored.sort((a, b) => {
          const aA = isAvail(a.p) ? 1 : 0;
          const bA = isAvail(b.p) ? 1 : 0;
          if (aA !== bA) return bA - aA;
          return b.score - a.score;
        });
        break;
      }
      case 'relevance':
      default:
        scored.sort((a, b) => b.score - a.score);
        break;
    }

    return scored.map((s) => s.p);
  }, [products, query, priceMin, priceMax, selectedCategories, inStockOnly, sortMode]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedCategories(new Set());
    setInStockOnly(false);
    setSortMode('relevance');
  };

  const hasFilters =
    priceMin !== '' ||
    priceMax !== '' ||
    selectedCategories.size > 0 ||
    inStockOnly ||
    sortMode !== 'relevance';

  const inputCls =
    'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-slate-200"
        style={{
          background:
            'radial-gradient(1200px 500px at 85% -10%, rgba(0,168,181,0.18), transparent 60%), radial-gradient(900px 400px at 5% 110%, rgba(0,61,92,0.15), transparent 55%), #ffffff',
        }}
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#003d5c] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00a8b5]" />
            <T>Moteur de recherche</T>
          </div>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#003d5c]">
            <T>Trouvez votre équipement</T>
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl">
            <T>{"Recherchez par nom, description, caractéristiques techniques ou marque — les résultats sont classés par pertinence."}</T>
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Stéthoscope, gants nitrile, tension artérielle…"
              className="w-full pl-12 pr-12 py-4 text-base text-slate-800 border-2 border-slate-200 rounded-2xl bg-white focus:border-primary focus:outline-none shadow-sm transition-all"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Effacer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Sidebar filtres */}
          <aside
            className={`${
              showFilters
                ? 'fixed inset-0 z-40 lg:relative lg:z-auto lg:inset-auto'
                : 'hidden lg:block'
            } lg:w-72 lg:flex-shrink-0`}
          >
            {showFilters && (
              <div
                className="lg:hidden absolute inset-0 bg-black/40"
                onClick={() => setShowFilters(false)}
              />
            )}
            <div
              className={`${
                showFilters
                  ? 'absolute right-0 top-0 bottom-0 w-80 overflow-y-auto'
                  : ''
              } bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres
                </h3>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-primary hover:underline"
                    >
                      Réinitialiser
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Tri
                </label>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className={inputCls}
                >
                  <option value="relevance">Pertinence</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="newest">Nouveautés</option>
                  <option value="availability">Disponibilité</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Prix (€)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Stock */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-slate-700">Uniquement disponibles</span>
              </label>

              {/* Catégories */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Catégories
                  </label>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {categories.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 cursor-pointer py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(c.id)}
                          onChange={() => toggleCategory(c.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-slate-700 truncate flex-1">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {c.productCount ?? 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Résultats */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </button>
              <p className="text-sm text-slate-600">
                {loading
                  ? 'Recherche…'
                  : `${results.length} résultat${results.length > 1 ? 's' : ''}`}
                {query && !loading && (
                  <span className="ml-1 text-slate-400">
                    pour <span className="font-medium text-slate-700">« {query} »</span>
                  </span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-1">
                  {query ? tr.common.search + ' — ' : ''}Aucun résultat
                </h3>
                <p className="text-sm text-slate-500">
                  Essayez un autre mot-clé ou ajustez les filtres.
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {results.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.03 }}
                    layout
                  >
                    <ProductCard product={p} viewMode="grid" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
