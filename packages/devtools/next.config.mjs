import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@blocksai/ui"],
  // Tell Next.js where the project root is (fixes npx workspace detection issues)
  outputFileTracingRoot: __dirname,
  typescript: {
    // Ensure TypeScript is recognized even when run via npx
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
