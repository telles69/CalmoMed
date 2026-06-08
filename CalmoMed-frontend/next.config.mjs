/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-leaflet'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
};

export default nextConfig;
