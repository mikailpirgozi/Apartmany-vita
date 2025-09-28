import type { NextConfig } from "next";
// import createNextIntlPlugin from 'next-intl/plugin';

// Temporarily disabled next-intl plugin to fix notFound() error
// const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// 🚨 CRITICAL: Port 3000 enforcement
const REQUIRED_PORT = 3000;
const currentPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;

if (currentPort && currentPort !== REQUIRED_PORT) {
  console.error(`🚨 ERROR: Application MUST run on port ${REQUIRED_PORT}, not ${currentPort}!`);
  console.error(`🚨 Please set PORT=${REQUIRED_PORT} in your environment variables.`);
  process.exit(1);
}

// Ensure PORT is set to 3000
process.env.PORT = REQUIRED_PORT.toString();

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  
  serverExternalPackages: ['prisma', '@prisma/client'],
  
  compress: true,
  poweredByHeader: false,
  
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
      if (Array.isArray(config.plugins)) {
        config.plugins.push(new BundleAnalyzerPlugin())
      }
      return config
    }
  }),
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      },
      {
        source: '/robots.txt',
        destination: '/api/robots'
      }
    ]
  }
};

export default nextConfig;
