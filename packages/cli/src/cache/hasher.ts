/**
 * Hashing utilities for incremental validation
 * Uses SHA-256 for content hashing
 */

import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import type { FileHash, ConfigFingerprint } from "./types.js";
import type { BlocksConfig } from "@blocksai/schema";

/**
 * Directories to exclude when hashing block files
 * Mirrors domain-validator.ts readAllBlockFiles logic
 */
const EXCLUDE_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  ".turbo",
  "coverage",
];

/**
 * Files to exclude when hashing
 */
const EXCLUDE_FILES = [
  ".DS_Store",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
];

/**
 * Compute SHA-256 hash of a string
 */
export function hashString(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

/**
 * Compute hash of a file and return FileHash object
 */
export function hashFile(filePath: string, relativePath: string): FileHash {
  const content = readFileSync(filePath, "utf-8");
  const stat = statSync(filePath);
  return {
    path: relativePath,
    hash: hashString(content),
    size: stat.size,
    mtime: stat.mtimeMs,
  };
}

/**
 * Read all files from a block directory and compute hashes
 * Mirrors the logic in domain-validator.ts readAllBlockFiles()
 */
export function hashBlockFiles(blockPath: string): FileHash[] {
  const fileHashes: FileHash[] = [];

  function readDir(dir: string, relativePath: string = ""): void {
    if (!existsSync(dir)) return;

    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          readDir(fullPath, relPath);
        }
      } else {
        if (!EXCLUDE_FILES.includes(entry.name)) {
          try {
            const content = readFileSync(fullPath, "utf-8");
            const stat = statSync(fullPath);
            fileHashes.push({
              path: relPath,
              hash: hashString(content),
              size: stat.size,
              mtime: stat.mtimeMs,
            });
          } catch {
            // Skip files that can't be read (binary, permissions, etc.)
          }
        }
      }
    }
  }

  // Handle single file vs directory
  if (existsSync(blockPath)) {
    try {
      const stat = statSync(blockPath);
      if (stat.isFile()) {
        const content = readFileSync(blockPath, "utf-8");
        const fileName = blockPath.split("/").pop() || "block";
        fileHashes.push({
          path: fileName,
          hash: hashString(content),
          size: stat.size,
          mtime: stat.mtimeMs,
        });
      } else {
        readDir(blockPath);
      }
    } catch {
      // Skip if can't read
    }
  }

  return fileHashes;
}

/**
 * Compute combined content hash from file hashes
 * Sorted by path for deterministic ordering
 */
export function computeContentHash(fileHashes: FileHash[]): string {
  const sorted = [...fileHashes].sort((a, b) => a.path.localeCompare(b.path));
  const combined = sorted.map((f) => `${f.path}:${f.hash}`).join("\n");
  return hashString(combined);
}

/**
 * Compute fingerprint of blocks.yml configuration
 * This tracks which parts of config affect which validations
 */
export function computeConfigFingerprint(
  config: BlocksConfig,
  rawYaml: string
): ConfigFingerprint {
  const blockConfigs: ConfigFingerprint["blockConfigs"] = {};

  for (const [blockName, blockDef] of Object.entries(config.blocks)) {
    // Skip the domain_rules key - it's not a block
    if (blockName === "domain_rules") continue;
    // Skip if it's an array (domain_rules)
    if (Array.isArray(blockDef)) continue;

    const typedBlockDef = blockDef as {
      description?: string;
      path?: string;
      inputs?: unknown[];
      outputs?: unknown[];
      domain_rules?: unknown[];
      test_data?: unknown;
    };

    blockConfigs[blockName] = {
      definitionHash: hashString(JSON.stringify(typedBlockDef)),
      domainRulesHash: typedBlockDef.domain_rules
        ? hashString(JSON.stringify(typedBlockDef.domain_rules))
        : null,
      inputsOutputsHash: hashString(
        JSON.stringify({
          inputs: typedBlockDef.inputs,
          outputs: typedBlockDef.outputs,
        })
      ),
    };
  }

  // Get global domain_rules from blocks.domain_rules
  const globalDomainRules = config.blocks.domain_rules;

  return {
    fullHash: hashString(rawYaml),
    philosophyHash: hashString(JSON.stringify(config.philosophy || [])),
    domainHash: hashString(JSON.stringify(config.domain || {})),
    aiConfigHash: hashString(JSON.stringify(config.ai || {})),
    validatorsHash: hashString(JSON.stringify(config.validators || ["domain"])),
    globalDomainRulesHash: hashString(JSON.stringify(globalDomainRules || [])),
    blockConfigs,
  };
}

/**
 * Compare two sets of file hashes and return what changed
 */
export function diffFileHashes(
  oldFiles: FileHash[],
  newFiles: FileHash[]
): { added: string[]; removed: string[]; modified: string[] } {
  const oldPaths = new Map(oldFiles.map((f) => [f.path, f.hash]));
  const newPaths = new Map(newFiles.map((f) => [f.path, f.hash]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  // Find added and modified files
  for (const [path, hash] of newPaths) {
    if (!oldPaths.has(path)) {
      added.push(path);
    } else if (oldPaths.get(path) !== hash) {
      modified.push(path);
    }
  }

  // Find removed files
  for (const path of oldPaths.keys()) {
    if (!newPaths.has(path)) {
      removed.push(path);
    }
  }

  return { added, removed, modified };
}
