#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = join(__dirname, "..");

// Find the node_modules directory (could be in appDir or parent for npx)
const findNodeModules = () => {
  // Check in the app directory first
  const localModules = join(appDir, "node_modules");
  if (existsSync(localModules)) return localModules;

  // Check parent directories (for npx structure)
  let dir = appDir;
  for (let i = 0; i < 5; i++) {
    const parentModules = join(dir, "..", "node_modules");
    if (existsSync(parentModules)) return resolve(parentModules);
    dir = join(dir, "..");
  }
  return null;
};

const nodeModulesDir = findNodeModules();
const nextBin = nodeModulesDir ? join(nodeModulesDir, ".bin", "next") : "next";

const PORT = process.env.PORT || 4200;

// Check if we have a production build (.next folder with BUILD_ID)
const hasProductionBuild = existsSync(join(appDir, ".next", "BUILD_ID"));

console.log("🧱 Starting Blocks Devtools...");
console.log(`   Working directory: ${process.cwd()}`);
console.log(`   Looking for runs in: .blocks/runs/`);
console.log();

// Always use production mode when we have a build (npx installs the built version)
const nextCommand = hasProductionBuild ? "start" : "dev";
const server = spawn(nextBin, [nextCommand, "-p", String(PORT)], {
  cwd: appDir,
  stdio: "inherit",
  env: {
    ...process.env,
    // Pass the user's working directory so we can find .blocks/runs/
    BLOCKS_PROJECT_DIR: process.cwd(),
    // Ensure node can find modules in the npx cache
    NODE_PATH: nodeModulesDir || "",
  },
});

server.on("error", (err) => {
  console.error("Failed to start devtools:", err);
  process.exit(1);
});

// Handle shutdown
process.on("SIGINT", () => {
  server.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.kill("SIGTERM");
  process.exit(0);
});

// Open browser after a short delay
setTimeout(() => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🌐 Blocks Devtools running at ${url}\n`);

  // Try to open browser
  const openCommand =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  spawn(openCommand, [url], {
    shell: true,
    detached: true,
    stdio: "ignore",
  }).unref();
}, 2000);
