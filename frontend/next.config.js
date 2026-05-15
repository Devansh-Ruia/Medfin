const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['react-markdown', 'sonner'],
  },

  // Static export for Capacitor native shell
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // Note: headers() and redirects() removed -- not supported with output: 'export'
  // Security headers should be configured on the hosting server or in the native app

  // Webpack configuration for bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // ScrollTrigger is only consumed by the landing page via
            // `ensureScrollTrigger()` in lib/motion/gsap.ts. Without this
            // group, the broader `vendor` cacheGroup below would re-inline
            // it into the shared vendors chunk and the dashboard route
            // would pay for code it never executes.
            gsapScrollTrigger: {
              test: /[\\/]node_modules[\\/]gsap[\\/]ScrollTrigger/,
              name: 'gsap-scrolltrigger',
              chunks: 'async',
              priority: 30,
              enforce: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  poweredByHeader: false,
};

module.exports = withNextIntl(nextConfig);
