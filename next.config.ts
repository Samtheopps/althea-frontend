import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-pslt.matheovieilleville.fr',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api-pslt.matheovieilleville.fr',
        port: '',
        pathname: '/api/v1/media/**',
      },
    ],
    // Configuration pour une meilleure gestion des erreurs
    minimumCacheTTL: 60, // 1 minute
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Amélioration de la gestion des erreurs
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 secondes
    pagesBufferLength: 2,
  },
  // Configuration pour production
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
