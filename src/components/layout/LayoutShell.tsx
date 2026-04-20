'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import ChatBot from '@/components/chat/ChatBot';
import { I18nProvider } from '@/lib/i18n';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';

  return (
    <I18nProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { iconTheme: { primary: '#00a8b5', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        {/* Skip to content — accessibility (WCAG 2.1 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#003d5c] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          {/* label injected via CSS content for i18n — fallback hardcoded */}
          Aller au contenu principal
        </a>
        {!isCheckoutPage && <Header />}
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        {!isCheckoutPage && <Footer />}
        <ChatBot />
      </AuthProvider>
    </I18nProvider>
  );
}
