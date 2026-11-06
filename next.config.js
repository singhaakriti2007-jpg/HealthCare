/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'mednexus-production-grade-encryption-key-healthcare-2026',
  },
};

module.exports = nextConfig;
