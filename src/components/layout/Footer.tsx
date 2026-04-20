'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';

const SOCIAL = [
  {
    label: 'Facebook',
    href: '#',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { tr } = useI18n();

  const LINKS = {
    company: [
      { label: tr.footer.aboutLink,    href: '/about' },
      { label: tr.footer.servicesLink, href: '/services' },
      { label: tr.nav.contact,         href: '/contact' },
    ],
    catalog: [
      { label: tr.footer.allProducts,  href: '/products' },
      { label: tr.footer.diagnostic,   href: '/categories/diagnostic' },
      { label: tr.footer.instruments,  href: '/categories/instruments' },
      { label: tr.footer.furniture,    href: '/categories/mobilier' },
      { label: tr.footer.sterilisation, href: '/categories/sterilisation' },
    ],
    legal: [
      { label: tr.nav.legalNotice,            href: '/legal/mentions-legales' },
      { label: tr.nav.cgu,                    href: '/legal/cgu' },
      { label: tr.checkout.privacyPolicyLink, href: '/legal/privacy' },
    ],
  };

  const COLUMNS = [
    { title: tr.footer.company, links: LINKS.company },
    { title: tr.footer.catalog, links: LINKS.catalog },
    { title: tr.footer.legal,   links: LINKS.legal },
  ];

  return (
    <footer style={{ backgroundColor: '#003d5c' }} className="text-white hidden md:block">

      {/* ── Main grid ── */}
      <div className="container-page py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Logo href="/" size="md" />

            <p className="text-slate-300 leading-relaxed text-sm max-w-xs">
              {tr.footer.description}
            </p>

            {/* Contact */}
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-[#00a8b5] flex-shrink-0" aria-hidden="true" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-[#00a8b5] flex-shrink-0" aria-hidden="true" />
                contact@althea-systems.fr
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-[#00a8b5] flex-shrink-0" aria-hidden="true" />
                123 Avenue de la Santé, 75000 Paris
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-white/10 hover:bg-[#00a8b5] transition-colors duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={icon} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-widest">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-[#33bfc9] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-page py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {year} Althea Systems. {tr.footer.rights}.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a8b5]" />
                {tr.footer.certifiedCE}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a8b5]" />
                ISO 13485
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a8b5]" />
                FDA
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
