import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@libsql/client', '@libsql/kysely-libsql', 'libsql', 'better-auth'],
};

export default withMDX(config);
