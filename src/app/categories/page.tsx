'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  ArrowUpRight,
  Heart,
  Stethoscope,
  Scissors,
  Pill,
  Syringe,
  Microscope,
  FlaskConical,
  Activity,
  BedDouble,
  Shield,
  Bandage,
  Dna,
  Baby,
  Brain,
  Eye,
  Ear,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { Category } from '@/types/api';
import { categoryService, invalidateCategoryCache } from '@/services/categoryService';
import { CategoryCardSkeleton } from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useI18n } from '@/lib/i18n';

/* ---------- Helpers ---------- */

// Map a category slug/name to a contextual lucide icon.
// Fallback is the generic Package icon.
function pickIcon(slug: string, name?: string): LucideIcon {
  const key = `${slug} ${name ?? ''}`.toLowerCase();

  const rules: Array<[RegExp, LucideIcon]> = [
    [/cardio|coeur|cœur|heart|sante|santé|health|bien.?etre/, Heart],
    [/diagnos|stethos|auscult|examen/, Stethoscope],
    [/chirurg|instrum|scalpel|ciseau|scissor/, Scissors],
    [/pharma|medicament|médicament|pill|comprim/, Pill],
    [/injec|seringu|syringe|vaccin/, Syringe],
    [/labor|microsc|analyse|biolog/, Microscope],
    [/chimie|reactif|réactif|flask|chemic/, FlaskConical],
    [/monit|ecg|tension|pulse|activity/, Activity],
    [/hospit|lit|bed|mobilier|chamber|chambre/, BedDouble],
    [/protec|epi|ppe|mask|masque|gant|safety|shield/, Shield],
    [/panse|bandage|compresse|sutur|wound|plaie/, Bandage],
    [/genet|adn|dna|molec/, Dna],
    [/pediatr|enfant|bebe|bébé|baby|mater/, Baby],
    [/neuro|cerv|brain|cranien/, Brain],
    [/ophtal|oeil|œil|eye|vision|optic/, Eye],
    [/orl|oreille|audi|ear/, Ear],
    [/esthet|beaut|skin|derma|cosm/, Sparkles],
  ];

  for (const [re, Icon] of rules) {
    if (re.test(key)) return Icon;
  }
  return Package;
}

// Two-digit ordinal for editorial feel
const pad = (n: number) => (n + 1).toString().padStart(2, '0');

/* ---------- Page ---------- */

export default function CategoriesPage() {
  const { tr } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async (opts: { silent?: boolean } = {}) => {
    try {
      if (!opts.silent) {
        setLoading(true);
        setError(null);
      }
      if (opts.silent) invalidateCategoryCache();
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      if (!opts.silent) setError(tr.common.error);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  // Polling temps réel — refresh silencieux toutes les 30s + au focus.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') loadCategories({ silent: true });
    };
    const interval = window.setInterval(tick, 30000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadCategories({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, []);

  // Memoize counts to avoid re-compute on re-renders
  const totalProducts = useMemo(
    () => categories.reduce((acc, c) => acc + (c.productCount ?? 0), 0),
    [categories]
  );

  /* ---------- Hero ---------- */
  const Hero = () => (
    <section
      aria-labelledby="categories-heading"
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
          <pattern id="dots-cat" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00a8b5" />
          </pattern>
          <linearGradient id="dots-mask-cat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="dots-fade-cat">
            <rect width="100%" height="100%" fill="url(#dots-mask-cat)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-cat)" mask="url(#dots-fade-cat)" />
      </svg>


      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secondary)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            Catalogue Althea
          </div>

          <h1
            id="categories-heading"
            className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] tracking-tight text-[var(--secondary)] sm:text-6xl lg:text-7xl"
          >
            {tr.categories.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {/* TODO i18n */}
            Parcourez l&rsquo;ensemble de nos gammes&nbsp;: du diagnostic à la chirurgie, en passant
            par l&rsquo;équipement hospitalier et la protection individuelle.
          </p>

          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)]">
                  {categories.length}
                </span>
                <span>{/* TODO i18n */} catégories</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)]">
                  {totalProducts}
                </span>
                <span>{/* TODO i18n */} produits référencés</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Hero />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Hero />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <ErrorMessage
            title={tr.common.error}
            message={error}
            onRetry={loadCategories}
            retryLabel={tr.common.loading}
          />
        </div>
      </div>
    );
  }

  /* ---------- Main ---------- */
  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-white py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)]">
              <Package className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h3 className="mt-6 font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--secondary)]">
              {tr.categories.noneAvailable}
            </h3>
          </div>
        ) : (
          <motion.ul
            role="list"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
            }}
          >
            {categories.map((category, index) => {
              const Icon = pickIcon(category.slug, category.name);
              // Every 7th card (index 0, 7, 14...) spans 2 columns on lg for rhythm
              const isFeatured = index % 7 === 0 && categories.length > 3;

              return (
                <motion.li
                  key={category.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className={isFeatured ? 'lg:col-span-2' : ''}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group relative block h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-[0_24px_48px_-16px_rgba(0,61,92,0.18)] focus-visible:-translate-y-1 focus-visible:border-[var(--primary)]/40"
                  >
                    {/* Decorative reactive gradient layer */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(600px 220px at 80% 0%, rgba(0,168,181,0.18), transparent 60%), radial-gradient(500px 200px at 0% 100%, rgba(0,61,92,0.12), transparent 60%)',
                      }}
                    />

                    {/* Ordinal number — decorative, watermark style */}
                    <span
                      aria-hidden="true"
                      className="absolute right-5 top-4 font-[family-name:var(--font-heading)] text-5xl font-bold leading-none text-[var(--primary)]/8 transition-colors duration-300 group-hover:text-[var(--primary)]/20 sm:text-6xl"
                    >
                      {pad(index)}
                    </span>

                    <div
                      className={`relative flex h-full flex-col p-6 sm:p-7 ${
                        isFeatured ? 'lg:min-h-[260px]' : 'min-h-[240px]'
                      }`}
                    >
                      {/* Icon tile */}
                      <div className="relative">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-xl ring-1 ring-[var(--primary)]/15 transition-all duration-300 group-hover:scale-105 group-hover:ring-[var(--primary)]/40"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(0,168,181,0.14) 0%, rgba(0,61,92,0.08) 100%)',
                          }}
                        >
                          <Icon
                            className="h-7 w-7 text-[var(--primary)] transition-colors duration-300 group-hover:text-[var(--secondary)]"
                            strokeWidth={1.75}
                          />
                        </div>
                      </div>

                      {/* Title + arrow */}
                      <div className="mt-6 flex items-start justify-between gap-4">
                        <h3
                          className={`font-[family-name:var(--font-heading)] font-semibold leading-tight text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)] ${
                            isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                          }`}
                        >
                          {category.name}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--secondary)] transition-all duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
                        >
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            strokeWidth={2}
                          />
                        </span>
                      </div>

                      {category.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                          {category.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
                        <span className="inline-flex items-baseline gap-1.5 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary-dark)]">
                          <span className="font-[family-name:var(--font-heading)] text-sm font-bold">
                            {category.productCount ?? 0}
                          </span>
                          {/* TODO i18n */}
                          {(category.productCount ?? 0) > 1 ? 'produits' : 'produit'}
                        </span>
                        <span className="text-sm font-semibold text-[var(--primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {tr.categories.seeProducts}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>

      {/* ---------- CTA Bottom ---------- */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#003d5c 0%,#004d74 45%,#00a8b5 100%)',
        }}
      >
        {/* Decorative grid pattern */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>

        {/* Glow orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, #00a8b5, transparent)' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                {/* TODO i18n */} Support expert
              </span>
              <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-white sm:text-5xl">
                {tr.categories.needHelp}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {tr.chat.escalateMsg}
              </p>
            </div>

            <div className="flex justify-start lg:justify-end">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--secondary)] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]"
              >
                {tr.nav.contact}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
