'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

import { Category } from '@/types/api';
import { categoryService } from '@/services/categoryService';
import { CategoryCardSkeleton } from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useI18n } from '@/lib/i18n';

export default function CategoriesPage() {
  const { tr } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(tr.common.error);
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">{tr.categories.title}</h1>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage title={tr.common.error} message={error} onRetry={loadCategories} retryLabel={tr.common.loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">{tr.categories.noneAvailable}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link href={`/categories/${category.slug}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/95 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-semibold border border-gray-200/50">
                          {category.productCount} produits
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-black group-hover:text-primary transition-colors">{category.name}</h3>
                        <ArrowRight className="w-5 h-5 text-black group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      {category.description && (
                        <p className="text-black text-sm leading-relaxed">{category.description}</p>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-primary font-medium text-sm group-hover:underline">
                          {tr.categories.seeProducts} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'linear-gradient(to bottom right, #00a8b5, #003d5c)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{tr.categories.needHelp}</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{tr.chat.escalateMsg}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: '#00a8b5' }}
            >
              {tr.nav.contact}
              <ArrowRight className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
