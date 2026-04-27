'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { T } from '@/components/ui/TranslatedText';

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
  gradient: string;
  accentColor: string;
}

/* Visual / routing data that is NOT translated */
const SLIDE_CONFIG = [
  {
    id: 1,
    ctaHref: '/products',
    secondaryHref: '/contact',
    gradient: 'linear-gradient(135deg, #002740 0%, #003d5c 45%, #005580 100%)',
    accentColor: '#33bfc9',
  },
  {
    id: 2,
    ctaHref: '/categories/diagnostic',
    secondaryHref: '/about',
    gradient: 'linear-gradient(135deg, #003d5c 0%, #005580 50%, #007a85 100%)',
    accentColor: '#00a8b5',
  },
  {
    id: 3,
    ctaHref: '/categories/sterilisation',
    secondaryHref: '/contact',
    gradient: 'linear-gradient(135deg, #001a2e 0%, #002740 45%, #003d5c 100%)',
    accentColor: '#33bfc9',
  },
] as const;

const AUTO_PLAY_INTERVAL = 5000;

interface HeroCarouselProps {
  slides?: CarouselSlide[];
}

export default function HeroCarousel({ slides: slidesProp }: HeroCarouselProps) {
  const { tr } = useI18n();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Mode API : les textes viennent du backend (FR) — il faut les traduire dynamiquement.
  // Mode i18n : les textes viennent du dictionnaire local (déjà dans la bonne langue) — pas de traduction.
  const isFromApi = !!slidesProp;

  /* Build slides from i18n text + static config, unless caller passed explicit slides */
  const slides: CarouselSlide[] = slidesProp ?? SLIDE_CONFIG.map((cfg, i) => ({
    ...cfg,
    title:         tr.hero.slides[i].title,
    subtitle:      tr.hero.slides[i].subtitle,
    description:   tr.hero.slides[i].description,
    ctaLabel:      tr.hero.slides[i].ctaLabel,
    secondaryLabel: tr.hero.slides[i].secondaryLabel,
  }));

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 520 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={tr.hero.badge}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: slide.gradient }}
        >
          {/* Background image */}
          {slide.image && (
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-15"
            />
          )}
          {/* Decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${slide.accentColor} 0%, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-8"
              style={{ background: `radial-gradient(circle, ${slide.accentColor} 0%, transparent 70%)` }}
            />
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
              <defs>
                <pattern id={`grid-${slide.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${slide.id})`} />
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container-page relative py-24 md:py-32" style={{ minHeight: 520 }}>
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(0,168,181,.15)', color: slide.accentColor, border: '1px solid rgba(0,168,181,.25)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: slide.accentColor }} />
                {tr.hero.badge}
              </div>

              {/* Title */}
              <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-tight tracking-tight">
                {isFromApi ? <T>{slide.title}</T> : slide.title}
                <span className="block mt-1" style={{ color: slide.accentColor }}>
                  {isFromApi ? <T>{slide.subtitle}</T> : slide.subtitle}
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {isFromApi ? <T>{slide.description}</T> : slide.description}
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href={slide.ctaHref} className="btn btn-primary btn-lg">
                  {isFromApi ? <T>{slide.ctaLabel}</T> : slide.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {slide.secondaryLabel && (
                  <Link
                    href={slide.secondaryHref ?? '/contact'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all duration-200"
                    style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
                  >
                    {isFromApi ? <T>{slide.secondaryLabel}</T> : slide.secondaryLabel}
                  </Link>
                )}
              </div>

              {/* Certifications */}
              <div className="mt-12 flex flex-wrap items-center gap-3">
                {tr.hero.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: slide.accentColor }} />
                    {cert}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Nav controls */}
      <button
        onClick={prev}
        aria-label={tr.common.back}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        aria-label={tr.nav.products}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? '#00a8b5' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
