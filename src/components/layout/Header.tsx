'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, Package, Settings, FileText, Info, Phone, Scale } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import GlobalSearch from './GlobalSearch';
import CartBadge from '@/components/ui/CartBadge';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useI18n } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { tr } = useI18n();

  const NAV_ITEMS = [
    { label: tr.nav.home,       href: '/' },
    { label: tr.nav.categories, href: '/categories' },
    { label: tr.nav.products,   href: '/products' },
    { label: tr.nav.contact,    href: '/contact' },
  ];

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center gap-4 lg:gap-8">

          {/* ── Logo ── */}
          <Logo href="/" size="sm" />

          {/* ── Nav desktop ── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(href)
                    ? 'text-[#00a8b5] bg-[#e0f7f9]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00a8b5] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Search (tous écrans) ── */}
          <div className="flex-1 min-w-0 max-w-md">
            <GlobalSearch />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={tr.a11y.cartItems(cartCount)}
              className="relative p-2.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              <CartBadge />
            </Link>

            {/* User menu (authenticated) */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-expanded={userMenuOpen}
                  aria-label="Menu utilisateur"
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#003d5c] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {user.firstName?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden animate-slide-down">
                      {/* Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      {/* Links */}
                      <div className="py-1">
                        <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#00a8b5] transition-colors">
                          <Settings className="w-4 h-4 flex-shrink-0" />
                          {tr.nav.account}
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#00a8b5] transition-colors">
                          <Package className="w-4 h-4 flex-shrink-0" />
                          {tr.nav.orders}
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          {tr.nav.logout}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all duration-200"
                >
                  {tr.nav.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary btn-sm"
                >
                  {tr.nav.register}
                </Link>
              </div>
            )}

            {/* Language selector (desktop) */}
            <div className="hidden md:block">
              <LanguageSelector variant="compact" />
            </div>

            {/* Burger (mobile) */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className="md:hidden p-2.5 rounded-md text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-down">

          {/* Nav links */}
          <nav className="px-3 py-2 space-y-0.5">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(href)
                    ? 'text-[#00a8b5] bg-[#e0f7f9]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth / User section */}
          <div className="px-3 pb-4 pt-2 border-t border-slate-100 mt-2">
            {isAuthenticated && user ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#003d5c] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.firstName?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                  <Settings className="w-4 h-4" />
                  {tr.nav.account}
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                  <Package className="w-4 h-4" />
                  {tr.nav.orders}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  {tr.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" className="flex items-center justify-center px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                  {tr.nav.login}
                </Link>
                <Link href="/auth/register" className="btn btn-primary justify-center">
                  {tr.nav.createAccount}
                </Link>
              </div>
            )}

            {/* Language selector (mobile) */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="px-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Langue / Language</p>
              <LanguageSelector variant="expanded" />
            </div>

            {/* Liens légaux (always visible in mobile menu) */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-0.5">
              <Link href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400" />
                {tr.nav.contact}
              </Link>
              <Link href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <Info className="w-4 h-4 text-slate-400" />
                {tr.nav.about}
              </Link>
              <Link href="/legal/cgu" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <FileText className="w-4 h-4 text-slate-400" />
                {tr.nav.cgu}
              </Link>
              <Link href="/legal/mentions-legales" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <Scale className="w-4 h-4 text-slate-400" />
                {tr.nav.legalNotice}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
