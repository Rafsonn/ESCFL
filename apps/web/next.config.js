/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'utils'],
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    // Required for Solana wallet adapter
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = nextConfig;
