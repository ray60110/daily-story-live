/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false  // 關閉 App Router，用 Pages Router
  }
};

module.exports = nextConfig;
