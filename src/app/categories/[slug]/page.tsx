'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, ArrowLeft, Filter, Grid, List, SortAsc } from 'lucide-react';

import { Category, Product } from '@/types/api';
import { categoryService, invalidateCategoryCache } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import LoadingSpinner, { ProductCardSkeleton } from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useI18n } from '@/lib/i18n';

export default function CategoryPage() {
  const { tr } = useI18n();
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    products,
    filters,
    loading: productsLoading,
    currentPage,
    totalPages,
    setProducts,
    setLoading: setProductsLoading,
    setFilters,
    setPage,
    getFilteredProducts,
  } = useProductStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (slug) loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (category) loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, currentPage, filters]);

  const loadCategory = async (opts: { silent?: boolean } = {}) => {
    try {
      if (!opts.silent) {
        setLoading(true);
        setError(null);
      }
      if (opts.silent) invalidateCategoryCache();
      const data = await categoryService.getCategoryBySlug(slug);
      setCategory(data);
    } catch (err: any) {
      if (!opts.silent) {
        console.error('Erreur chargement catégorie:', err);
        setError('Cette catégorie est temporairement indisponible');
      }
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  const loadProducts = async (opts: { silent?: boolean } = {}) => {
    if (!category) return;

    if (!opts.silent) setProductsLoading(true);
    try {
      const data = await productService.getProducts({
        category: category.id,
        page: currentPage,
        limit: 24,
        ...filters,
      });
      setProducts(data.products);
    } catch (err: any) {
      if (!opts.silent) console.error('Erreur chargement produits:', err);
    } finally {
      if (!opts.silent) setProductsLoading(false);
    }
  };

  // Polling temps réel — refresh silencieux catégorie + produits toutes les
  // 30s + au focus. Ne re-affiche aucun skeleton pour ne pas casser l'UX.
  useEffect(() => {
    if (!slug) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      loadCategory({ silent: true });
      loadProducts({ silent: true });
    };
    const interval = window.setInterval(tick, 30000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, category, currentPage, filters]);

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return <LoadingSpinner fullScreen text={tr.common.loading} />;
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage
            title={tr.product.notFound}
            message={error || tr.product.notFoundDesc}
            variant="warning"
          />
          <div className="mt-6 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {tr.categories.backToCategories}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bannière catégorie pleine largeur */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: 260, background: 'linear-gradient(135deg, #002740 0%, #003d5c 50%, #005580 100%)' }}
      >
        {/* Déco */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00a8b5, transparent)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" className="hover:text-white transition-colors">{tr.nav.home}</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-white transition-colors">{tr.nav.categories}</Link>
            <span>/</span>
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg max-w-2xl mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {category.description}
            </p>
          )}
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(0,168,181,0.2)', color: '#33bfc9', border: '1px solid rgba(0,168,181,0.3)' }}
          >
            <Package className="w-4 h-4" />
            {category.productCount ?? 0} produit{(category.productCount ?? 0) !== 1 ? 's' : ''} disponible{(category.productCount ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 relative">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-40 lg:relative lg:z-auto' : 'hidden'} lg:block lg:w-80 lg:flex-shrink-0`}>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setShowFilters(false)} />
            
            {/* Sidebar content */}
            <div className={`${showFilters ? 'fixed top-0 right-0 h-full w-80 transform translate-x-0 lg:relative lg:transform-none' : 'lg:block'} bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:shadow-sm overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">{tr.products.filters}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-black hover:text-black text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <ProductFilters />
            </div>
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    {tr.products.filters}
                  </button>
                  
                  <span className="text-black">
                    {tr.products.found(filteredProducts.length)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <ProductSort />
                  
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-black hover:bg-gray-50'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-black hover:bg-gray-50'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <motion.div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </motion.div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                 <Package className="w-16 h-16 text-black mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  {tr.products.noneFound}
                </h3>
                <p className="text-black">
                  {tr.products.noneFoundDesc}
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                  layout
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-primary text-white'
                              : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}