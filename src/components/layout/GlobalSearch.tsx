'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Package, ArrowRight } from 'lucide-react';

import { Product } from '@/types/api';
import { productService } from '@/services/productService';
import { formatPrice } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function GlobalSearch() {
  const { tr } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        searchProducts(query);
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search: searchQuery,
        limit: 5
      });
      setResults(data.products);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleProductClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={tr.common.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 sm:pl-10 sm:pr-4 sm:py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 placeholder-gray-400"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          {loading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length > 0 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden backdrop-blur-sm"
          >
            {query.length > 0 && query.length <= 2 && (
              <div className="p-4 text-center text-black text-sm">
                {tr.common.searchMinChars}
              </div>
            )}

            {query.length > 2 && loading && (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
                <span className="text-black text-sm">{tr.common.loading}</span>
              </div>
            )}

            {query.length > 2 && !loading && results.length === 0 && (
              <div className="p-4 text-center text-black">
                 <Package className="w-8 h-8 text-black mx-auto mb-2" />
                <p className="text-sm">{tr.common.searchNoResults(query)}</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {results.map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleProductClick}
                      className="block"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                               <Package className="w-6 h-6 text-black" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-black truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-black truncate">
                            {product.brand} • {product.category?.name}
                          </p>
                          {(product.shortDescription || product.description) && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {(product.shortDescription || product.description).slice(0, 80)}
                              {(product.shortDescription || product.description).length > 80 ? '…' : ''}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                               <span className="text-xs text-black line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                         <ArrowRight className="w-4 h-4 text-black flex-shrink-0" />
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* See all results */}
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    {tr.common.searchSeeAll(query)}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}