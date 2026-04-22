'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, X, SlidersHorizontal, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';

import { useProductStore } from '@/stores/productStore';
import { productService } from '@/services/productService';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useI18n } from '@/lib/i18n';

export default function ProductsPage() {
  const { tr } = useI18n();
  const {
    products,
    filters,
    loading,
    error,
    currentPage,
    totalPages,
    setProducts,
    setLoading,
    setError,
    setFilters,
    setPage,
    getFilteredProducts,
  } = useProductStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sur mobile, on force le mode liste (mobile first) — l'user peut toujours
  // basculer en grid/list sur desktop via les boutons.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const effectiveViewMode: 'grid' | 'list' = isMobile ? 'list' : viewMode;

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadProducts = async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const params = { page: currentPage, limit: 24, ...filters };
      const data = await productService.getProducts(params);
      setProducts(data.products);
      setPage(data.page);
    } catch (err: any) {
      if (!opts.silent) setError(err.message || tr.common.error);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  // Polling temps réel — refresh silencieux toutes les 30s + au focus.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') loadProducts({ silent: true });
    };
    const interval = window.setInterval(tick, 30000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadProducts({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setFilters({ search: query }), 300);
    setSearchTimeout(timeout);
  };

  const getErrorType = (errorMessage: string): 'api' | 'network' | 'timeout' | 'server' | 'generic' => {
    if (errorMessage.includes('réseau') || errorMessage.includes('connexion') || errorMessage.includes('ECONNREFUSED')) return 'network';
    if (errorMessage.includes('timeout') || errorMessage.includes('délai')) return 'timeout';
    if (errorMessage.includes('serveur') || errorMessage.includes('indisponible')) return 'server';
    if (errorMessage.includes('API')) return 'api';
    return 'generic';
  };

  const filteredProducts = getFilteredProducts();
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => {
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }, [filters]);

  /* ---------- Hero ---------- */
  const Hero = () => (
    <section
      aria-labelledby="products-heading"
      className="relative overflow-hidden border-b border-[var(--border)]"
      style={{
        background:
          'radial-gradient(1200px 500px at 85% -10%, rgba(0,168,181,0.18), transparent 60%), radial-gradient(900px 400px at 5% 110%, rgba(0,61,92,0.15), transparent 55%), #ffffff',
      }}
    >
      {/* Dots pattern — discret, corporate */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      >
        <defs>
          <pattern id="dots-prod" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00a8b5" />
          </pattern>
          <linearGradient id="dots-mask-prod" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="dots-fade-prod">
            <rect width="100%" height="100%" fill="url(#dots-mask-prod)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-prod)" mask="url(#dots-fade-prod)" />
      </svg>


      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secondary)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            {/* TODO i18n */} Catalogue Althea
          </div>

          <h1
            id="products-heading"
            className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] tracking-tight text-[var(--secondary)] sm:text-6xl lg:text-7xl"
          >
            {tr.products.catalogTitle}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {/* TODO i18n */}
            Explorez l&rsquo;intégralité de notre catalogue médical&nbsp;: dispositifs de diagnostic,
            instruments chirurgicaux, équipements hospitaliers et consommables certifiés.
          </p>

          {products.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)]">
                  {products.length}
                </span>
                <span>{/* TODO i18n */} produits référencés</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)]">
                  {totalPages}
                </span>
                <span>{/* TODO i18n */} {totalPages > 1 ? 'pages' : 'page'}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );

  /* ---------- Action Bar ---------- */
  const ActionBar = () => (
    <div className="relative">
      {/* Row 1 — Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-[var(--primary)]" strokeWidth={1.75} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={tr.common.searchPlaceholder}
            aria-label={tr.common.searchPlaceholder}
            className="block w-full rounded-full border border-[var(--border)] bg-white py-3 pl-11 pr-11 text-sm text-[var(--secondary)] placeholder:text-slate-400 shadow-sm transition-[border-color,box-shadow] duration-200 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-[var(--secondary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-expanded={showFilters}
          className={`relative inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
            showFilters
              ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_10px_24px_-10px_rgba(0,168,181,0.55)]'
              : 'border-[var(--border)] bg-white text-[var(--secondary)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary-light)]/40'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
          {tr.products.filters}
          {activeFilterCount > 0 && (
            <span
              className={`ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-5 ${
                showFilters ? 'bg-white text-[var(--primary)]' : 'bg-[var(--primary)] text-white'
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Row 2 — Count + Sort + ViewMode */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
                {tr.common.loading}
              </span>
            ) : (
              <>
                <span className="font-[family-name:var(--font-heading)] font-semibold text-[var(--secondary)]">
                  {filteredProducts.length}
                </span>{' '}
                <span>{tr.products.found(filteredProducts.length).replace(/^\d+\s*/, '')}</span>
              </>
            )}
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--secondary)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
            >
              <X className="h-3 w-3" />
              {tr.products.resetFilters}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ProductSort />
          <div className="hidden overflow-hidden rounded-full border border-[var(--border)] bg-white sm:inline-flex">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[var(--secondary)]'
              }`}
            >
              <Grid className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[var(--secondary)]'
              }`}
            >
              <List className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Hero />

      {/* Sticky-ish control bar */}
      <div className="relative border-b border-[var(--border)] bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <ActionBar />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-1 mb-6 lg:mb-0"
              >
                <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_4px_20px_-12px_rgba(0,61,92,0.15)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--secondary)]">
                      <Filter className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
                      {tr.products.filters}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      aria-label="Close filters"
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--secondary)] lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ProductFilters />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4"
                  >
                    <div className="mb-4 h-48 w-full animate-pulse rounded-xl bg-slate-100" />
                    <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <ErrorMessage type={getErrorType(error)} message={error} onRetry={loadProducts} className="mb-6" />
            )}

            {!loading && !error && (
              <>
                {filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--border-strong)] bg-white py-16 text-center"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-60"
                      style={{
                        background:
                          'radial-gradient(600px 220px at 50% 0%, rgba(0,168,181,0.08), transparent 60%)',
                      }}
                    />
                    <div className="relative">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-light)] ring-8 ring-[var(--primary-light)]/30">
                        <PackageSearch className="h-9 w-9 text-[var(--primary)]" strokeWidth={1.75} />
                      </div>
                      <h3 className="mt-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)]">
                        {tr.products.noneFound}
                      </h3>
                      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                        {tr.products.noneFoundDesc}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters({});
                          setSearchQuery('');
                        }}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-10px_rgba(0,168,181,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_16px_32px_-12px_rgba(0,168,181,0.65)]"
                      >
                        <X className="h-4 w-4" />
                        {tr.products.resetFilters}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className={
                      effectiveViewMode === 'grid'
                        ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'space-y-4'
                    }
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                    }}
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                          },
                        }}
                      >
                        <ProductCard product={product} viewMode={effectiveViewMode} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {totalPages > 1 && !error && (
              <div className="mt-14 flex justify-center">
                <nav
                  aria-label="Pagination"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white p-1.5 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const active = page === currentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setPage(page)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)]/20 ring-offset-2'
                            : 'text-[var(--secondary)] hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
