'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useI18n } from '@/lib/i18n';
import { LOCALE_META, type Locale } from '@/lib/i18n/translations';

interface LanguageSelectorProps {
  /** compact = badge code (desktop nav), expanded = grille 2×2 (mobile menu) */
  variant?: 'compact' | 'expanded';
}

export default function LanguageSelector({ variant = 'compact' }: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LOCALE_META[locale];

  /* ── Mobile expanded grid ── */
  if (variant === 'expanded') {
    return (
      <div className="grid grid-cols-2 gap-1.5 px-1">
        {(Object.keys(LOCALE_META) as Locale[]).map((code) => {
          const meta = LOCALE_META[code];
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-start ${
                active ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={active ? { background: '#00a8b5' } : {}}
              aria-pressed={active}
            >
              <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: active ? 'rgba(255,255,255,.2)' : '#e2e8f0', color: active ? '#fff' : '#475569' }}>
                {meta.code}
              </span>
              <span>{meta.nativeLabel}</span>
              {active && <Check className="w-3.5 h-3.5 ms-auto" />}
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Desktop compact dropdown ── */
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Sélecteur de langue"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-all duration-200 text-sm font-medium"
      >
        <span className="w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center bg-slate-200 text-slate-600">
          {current.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-full mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden py-1"
          >
            {(Object.keys(LOCALE_META) as Locale[]).map((code) => {
              const meta = LOCALE_META[code];
              const active = locale === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setLocale(code); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                    active ? 'font-semibold bg-[#e0f7f9]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  style={active ? { color: '#00a8b5' } : {}}
                >
                  <span className="w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{ background: active ? '#00a8b5' : '#e2e8f0', color: active ? '#fff' : '#475569' }}>
                    {meta.code}
                  </span>
                  <span className="flex-1 text-start">{meta.nativeLabel}</span>
                  {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
