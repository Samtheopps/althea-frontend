'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

import dynamic from 'next/dynamic';
import type { AxiosError } from 'axios';
import { contactSchema, type ContactInput } from '@/lib/validations';
import { useI18n } from '@/lib/i18n';
import apiService from '@/services/api';

const ContactMap = dynamic(() => import('@/components/contact/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full animate-pulse items-center justify-center rounded-2xl bg-slate-100">
      <MapPin className="h-8 w-8 text-slate-400" />
    </div>
  ),
});

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--secondary)] placeholder:text-slate-400 shadow-sm transition-[border-color,box-shadow] duration-200 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/15';

const labelClass =
  'mb-1.5 block font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--secondary)]';

export default function ContactPage() {
  const { tr } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setIsLoading(true);
    try {
      // Le backend attend { name, email, phone?, subject, message }
      // On concatène firstName + lastName en un seul champ "name".
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      };
      await apiService.post('/contact/submit', payload);
      setIsSubmitted(true);
      toast.success(tr.contact.successToast);
      reset();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: { message?: string } }>;
      const backendMsg =
        axiosErr.response?.data?.error?.message ||
        axiosErr.response?.data?.message;
      console.error('[contact] submit failed:', {
        status: axiosErr.response?.status,
        body: axiosErr.response?.data,
      });
      toast.error(backendMsg || tr.contact.errorToast);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: tr.contact.phoneTitle,
      content: '+33 1 23 45 67 89',
      description: tr.contact.phoneHours,
      mono: true,
    },
    {
      icon: Mail,
      title: tr.contact.emailTitle,
      content: 'contact@althea-systems.fr',
      description: tr.contact.emailResponse,
      mono: true,
    },
    {
      icon: MapPin,
      title: tr.contact.addressTitle,
      content: '123 Avenue de la Santé',
      description: tr.contact.addressCity,
      mono: false,
    },
    {
      icon: Clock,
      title: tr.contact.hoursTitle,
      content: tr.contact.hoursContent,
      description: tr.contact.hoursDesc,
      mono: false,
    },
  ];

  /* ---------- Hero (shared) ---------- */
  const Hero = ({ label }: { label: string }) => (
    <section
      aria-labelledby="contact-heading"
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
          <pattern id="dots-contact" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00a8b5" />
          </pattern>
          <linearGradient id="dots-mask-contact" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="dots-fade-contact">
            <rect width="100%" height="100%" fill="url(#dots-mask-contact)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-contact)" mask="url(#dots-fade-contact)" />
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
            {label}
          </div>

          <h1
            id="contact-heading"
            className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] tracking-tight text-[var(--secondary)] sm:text-6xl lg:text-7xl"
          >
            {tr.contact.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {tr.contact.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Hero label="Message envoyé" /> {/* TODO i18n */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,61,92,0.25)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(500px 200px at 50% 0%, rgba(16,185,129,0.10), transparent 60%)',
              }}
            />
            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/40">
                <CheckCircle className="h-12 w-12 text-emerald-500" strokeWidth={1.75} />
              </div>
              <h2 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-[var(--secondary)]">
                {tr.contact.successTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-600">
                {tr.contact.successDesc}
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3.5 font-[family-name:var(--font-heading)] text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(0,168,181,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_18px_38px_-12px_rgba(0,168,181,0.7)]"
              >
                {tr.contact.sendAnother}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Hero label="Contactez-nous" /> {/* TODO i18n */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Contact info */}
          <div className="lg:col-span-5 mb-12 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                {tr.contact.coordinates}
              </h2>

              <motion.ul
                role="list"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                }}
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.li
                      key={index}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-[0_18px_36px_-18px_rgba(0,61,92,0.18)]"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background:
                            'radial-gradient(400px 160px at 100% 0%, rgba(0,168,181,0.10), transparent 60%)',
                        }}
                      />
                      <div className="relative flex flex-col gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-[var(--primary)]/15 transition-all duration-300 group-hover:scale-105 group-hover:ring-[var(--primary)]/40"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(0,168,181,0.14) 0%, rgba(0,61,92,0.08) 100%)',
                          }}
                        >
                          <Icon
                            className="h-5 w-5 text-[var(--primary)] transition-colors duration-300 group-hover:text-[var(--secondary)]"
                            strokeWidth={1.75}
                          />
                        </div>
                        <div>
                          <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--secondary)]">
                            {info.title}
                          </h3>
                          <p
                            className={`mt-1 text-sm font-semibold text-[var(--secondary)] ${
                              info.mono ? 'font-mono tracking-tight' : ''
                            }`}
                          >
                            {info.content}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{info.description}</p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>

              {/* Interactive map */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
              >
                <ContactMap />
              </motion.div>
            </motion.div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,61,92,0.20)] sm:p-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 opacity-50"
                style={{
                  background: 'radial-gradient(closest-side, rgba(0,168,181,0.18), transparent)',
                }}
              />
              <div className="relative">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                  {tr.contact.sendUsMessage}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {/* TODO i18n */}
                  Renseignez vos coordonnées, notre équipe vous répond sous 24&nbsp;h ouvrées.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                  {/* First + Last name */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>{tr.auth.firstName} *</label>
                      <input {...register('firstName')} type="text" className={inputClass} />
                      {errors.firstName && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>{tr.auth.lastName} *</label>
                      <input {...register('lastName')} type="text" className={inputClass} />
                      {errors.lastName && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>{tr.auth.email} *</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={inputClass}
                      placeholder="votre.email@exemple.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone + Company */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>{tr.account.phone}</label>
                      <input {...register('phone')} type="tel" className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>{tr.checkout.company}</label>
                      <input {...register('company')} type="text" className={inputClass} />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className={labelClass}>{tr.contact.subject} *</label>
                    <input {...register('subject')} type="text" className={inputClass} />
                    {errors.subject && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelClass}>{tr.contact.message} *</label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className={`${inputClass} resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* RGPD */}
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-5 items-center">
                        <input
                          id="rgpd"
                          type="checkbox"
                          required
                          className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </div>
                      <label htmlFor="rgpd" className="text-xs leading-relaxed text-slate-600">
                        {tr.contact.rgpdText}{' '}
                        <a
                          href="/legal/privacy"
                          className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
                        >
                          {tr.contact.rgpdLink}
                        </a>{' '}
                        {tr.contact.rgpdSuffix}
                      </label>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl font-[family-name:var(--font-heading)] text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,168,181,0.55)] transition-[box-shadow,transform] duration-200 hover:shadow-[0_20px_44px_-14px_rgba(0,61,92,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg,#00a8b5 0%,#003d5c 100%)',
                      backgroundSize: '200% 200%',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#003d5c_0%,#00a8b5_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <Send className="h-5 w-5" strokeWidth={2} />
                      )}
                      {isLoading ? tr.common.loading : tr.contact.send}
                    </span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FAQ section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 sm:mt-24"
        >
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              FAQ {/* TODO i18n */}
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              {tr.contact.faqTitle}
              <span
                className="ml-1 inline-block align-baseline"
                style={{
                  background: 'linear-gradient(135deg,#00a8b5 0%,#003d5c 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                .
              </span>
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 lg:grid-cols-3">
            {tr.contact.faqItems.map((item, i) => (
              <div
                key={i}
                className="group relative bg-white p-6 transition-colors duration-300 hover:bg-[var(--primary-light)]/30 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--primary)]">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold leading-snug text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
