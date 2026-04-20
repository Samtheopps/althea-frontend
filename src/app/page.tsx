'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, HeadphonesIcon, Award } from 'lucide-react';

import type { Category, Product } from '@/types/api';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/LoadingSpinner';
import HeroCarousel from '@/components/home/HeroCarousel';
import { useI18n } from '@/lib/i18n';

/* ── Animation variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

const TRUST_ICONS = [ShieldCheck, Truck, HeadphonesIcon];

export default function HomePage() {
  const { tr } = useI18n();

  const TRUST_ITEMS = tr.home.trust.map((t, i) => ({ ...t, icon: TRUST_ICONS[i] }));
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cats, prods] = await Promise.allSettled([
          categoryService.getMainCategories(),
          productService.getProducts({ limit: 8, sortBy: 'newest' }),
        ]);
        setCategories(cats.status === 'fulfilled' ? (cats.value ?? []).slice(0, 6) : []);
        setFeaturedProducts(prods.status === 'fulfilled' ? prods.value?.products ?? [] : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════
          HERO CAROUSEL
      ═══════════════════════════════════════ */}
      <HeroCarousel />

      {/* ═══════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-4 px-6 py-8"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e0f7f9' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#00a8b5' }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container-page">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
                {tr.home.categoriesLabel}
              </p>
              <h2 className="font-heading font-bold text-3xl text-slate-800">
                {tr.home.categoriesHeading}
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#00a8b5] transition-colors flex-shrink-0"
            >
              {tr.common.seeAllCategories}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-[#00a8b5] hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                      style={{ background: '#e0f7f9' }}
                    >
                      <Award className="w-6 h-6" style={{ color: '#00a8b5' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 group-hover:text-[#00a8b5] transition-colors truncate text-sm">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tr.products.found(cat.productCount ?? 0)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00a8b5] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-400 py-12">{tr.home.categoriesSoon}</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-page">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
                {tr.home.selectionLabel}
              </p>
              <h2 className="font-heading font-bold text-3xl text-slate-800">
                {tr.home.topProductsHeading}
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#00a8b5] transition-colors flex-shrink-0"
            >
              {tr.common.seeCatalog}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-400 py-12">{tr.home.productsSoon}</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003d5c 0%, #005580 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/3 translate-x-1/3"
            style={{ background: 'radial-gradient(circle, #00a8b5, transparent)' }}
          />
        </div>
        <div className="container-page relative py-16 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
              {tr.home.ctaTitle}
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              {tr.home.ctaDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn btn-lg text-[#003d5c] font-bold"
                style={{ background: '#ffffff' }}
              >
                {tr.home.ctaQuote}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all duration-200"
                style={{ border: '1.5px solid rgba(255,255,255,.3)' }}
              >
                {tr.home.ctaBrowse}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
