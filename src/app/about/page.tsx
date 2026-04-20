'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award, Users, Target, Heart, Shield, Globe, Clock,
  TrendingUp, Building2, CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

/* Static data that never changes with locale */
const STAT_ICONS  = [Clock, Users, TrendingUp, Award];
const STAT_VALUES = ['15+', '2500+', '8000+', '25+'];
const VALUE_ICONS = [Heart, Shield, Users, Globe];
const TEAM_META   = [
  { name: 'Dr. Marie Dubois', initials: 'MD' },
  { name: 'Pierre Martin',    initials: 'PM' },
  { name: 'Sophie Leblanc',   initials: 'SL' },
];
const CERT_NAMES  = ['ISO 13485:2016', 'Marquage CE', 'FDA Approved', 'ANSM', 'COFRAC'];
const MVE_ICONS   = [Target, Globe, Heart];
const MVE_COLORS  = ['#00a8b5', '#003d5c', '#dc2626'];

export default function AboutPage() {
  const { tr } = useI18n();

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002740 0%, #003d5c 45%, #005580 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00a8b5 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #33bfc9 0%, transparent 70%)' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container-page relative py-24 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,168,181,.15)', color: '#33bfc9', border: '1px solid rgba(0,168,181,.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a8b5]" />
            {tr.about.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-heading font-bold text-4xl sm:text-5xl text-white leading-tight tracking-tight max-w-2xl"
          >
            {tr.about.heroTitle}
            <span className="block mt-1" style={{ color: '#33bfc9' }}>{tr.about.heroSince}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl"
          >
            {tr.about.heroDesc}
          </motion.p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {tr.about.stats.map(({ label, sub }, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-center p-6 rounded-2xl border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#e0f7f9' }}>
                    <Icon className="w-6 h-6" style={{ color: '#00a8b5' }} />
                  </div>
                  <p className="font-heading font-bold text-3xl text-slate-900">{STAT_VALUES[i]}</p>
                  <p className="font-semibold text-slate-700 text-sm mt-1">{label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── History ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
                {tr.about.historyLabel}
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-800 leading-tight mb-6">
                {tr.about.historyTitle}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>{tr.about.historyP1}</p>
                <p>{tr.about.historyP2}</p>
                <p>{tr.about.historyP3}</p>
              </div>

              <div
                className="flex items-center gap-4 mt-8 p-5 rounded-2xl"
                style={{ background: '#e0f7f9', border: '1px solid rgba(0,168,181,.2)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#00a8b5' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{tr.about.missionBadge}</p>
                  <p className="text-slate-600 text-sm">{tr.about.missionDesc}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="relative"
            >
              <div
                className="rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e0f7f9 0%, #e8f2f8 100%)', height: 380 }}
              >
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #00a8b5, #003d5c)' }}
                  >
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-800 mb-1">{tr.about.hqTitle}</h3>
                  <p className="text-slate-500 text-sm">{tr.about.hqCity}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                    {['CE', 'ISO 13485', 'FDA'].map(cert => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: 'rgba(0,168,181,.12)', color: '#007a85' }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl opacity-50"
                style={{ background: 'linear-gradient(135deg, #003d5c, #005580)' }} />
              <div className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full opacity-50"
                style={{ background: '#00a8b5' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Engagement ── */}
      <section className="section bg-white">
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
              {tr.about.whoLabel}
            </p>
            <h2 className="font-heading font-bold text-3xl text-slate-800">{tr.about.mveTitle}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tr.about.mve.map(({ title, desc }, i) => {
              const Icon  = MVE_ICONS[i];
              const color = MVE_COLORS[i];
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${color}1a` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
              {tr.about.valuesLabel}
            </p>
            <h2 className="font-heading font-bold text-3xl text-slate-800">{tr.about.valuesTitle}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tr.about.values.map(({ title, desc }, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex gap-5 p-7 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#e0f7f9' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#00a8b5' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section bg-white">
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
              {tr.about.teamLabel}
            </p>
            <h2 className="font-heading font-bold text-3xl text-slate-800">{tr.about.teamTitle}</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto text-sm">{tr.about.teamDesc}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tr.about.team.map(({ role, bio, specialties }, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div
                  className="h-48 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e0f7f9 0%, #e8f2f8 100%)' }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #00a8b5, #003d5c)' }}
                  >
                    {TEAM_META[i].initials}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-heading font-bold text-slate-800 text-lg">{TEAM_META[i].name}</h3>
                  <p className="text-sm font-semibold mt-0.5 mb-3" style={{ color: '#00a8b5' }}>{role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map((s, si) => (
                      <span
                        key={si}
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: '#e0f7f9', color: '#007a85' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#00a8b5' }}>
              {tr.about.certsLabel}
            </p>
            <h2 className="font-heading font-bold text-3xl text-slate-800">{tr.about.certsTitle}</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">{tr.about.certsDesc}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-3">
              {tr.about.certs.map(({ desc, tag }, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-100 hover:border-[#00a8b5] transition-colors duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#e0f7f9' }}
                  >
                    <Award className="w-5 h-5" style={{ color: '#00a8b5' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm">{CERT_NAMES[i]}</h4>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{desc}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: '#e0f7f9', color: '#007a85' }}
                  >
                    {tag}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <div
                  className="w-64 h-64 rounded-full flex flex-col items-center justify-center text-white shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #00a8b5 0%, #007a85 50%, #003d5c 100%)' }}
                >
                  <Shield className="w-16 h-16 mb-3 opacity-90" />
                  <p className="font-heading font-bold text-xl leading-tight text-center px-8">{tr.about.qualityCertified}</p>
                  <p className="text-xs opacity-75 mt-1">{tr.about.intlStandards}</p>
                </div>
                <motion.div
                  className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Award className="w-6 h-6" style={{ color: '#00a8b5' }} />
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: 'rgba(0,61,92,.15)', backdropFilter: 'blur(4px)' }}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <Shield className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
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
              {tr.about.ctaTitle}
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              {tr.about.ctaDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="btn btn-lg font-bold"
                style={{ background: '#ffffff', color: '#003d5c' }}
              >
                {tr.about.ctaProducts}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all duration-200"
                style={{ border: '1.5px solid rgba(255,255,255,.3)' }}
              >
                {tr.about.ctaContact}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
