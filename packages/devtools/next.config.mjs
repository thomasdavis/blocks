/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@blocksai/ui"],
};

export default nextConfig;
