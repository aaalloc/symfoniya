/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  output: 'export',
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
