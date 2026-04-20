'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, X } from 'lucide-react';

import { useProductStore } from '@/stores/productStore';
import { productService } from '@/services/productService';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import ErrorMessage, { ApiErrorMessage, NetworkErrorMessage } from '@/components/ui/ErrorMessage';
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

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: 24, ...filters };
      const data = await productService.getProducts(params);
      setProducts(data.products);
      setPage(data.page);
    } catch (err: any) {
      setError(err.message || tr.common.error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-black">{tr.products.catalogTitle}</h1>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-black" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={tr.common.searchPlaceholder}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
              {searchQuery && (
                <button onClick={() => handleSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="h-5 w-5 text-black hover:text-black" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                  showFilters ? 'border-primary text-primary bg-primary/5' : 'border-gray-300 text-black bg-white hover:bg-gray-50'
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                {tr.products.filters}
              </button>
              <ProductSort />
              <div className="flex rounded-lg border border-gray-300 bg-white">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-black hover:text-black'}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-black hover:text-black'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <ProductFilters />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-black">
                {loading ? tr.common.loading : tr.products.found(filteredProducts.length)}
              </p>
              {Object.keys(filters).length > 0 && (
                <button onClick={() => setFilters({})} className="text-sm text-primary hover:text-primary-hover transition-colors">
                  {tr.products.resetFilters}
                </button>
              )}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="h-12 w-12 text-black" />
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">{tr.products.noneFound}</h3>
                    <p className="text-black mb-6">{tr.products.noneFoundDesc}</p>
                    <button
                      onClick={() => setFilters({})}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
                    >
                      {tr.products.resetFilters}
                    </button>
                  </div>
                ) : (
                  <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                    {filteredProducts.map((product, index) => (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <ProductCard product={product} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {totalPages > 1 && !error && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === currentPage ? 'bg-primary text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
