/**
 * Cache manager for validation state persistence
 * Stores cache in .blocks/cache.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import type {
  ValidationCache,
  BlockCacheEntry,
  ConfigFingerprint,
} from "./types.js";
import { computeConfigFingerprint } from "./hasher.js";
import type { BlocksConfig } from "@blocksai/schema";

const CACHE_DIR = ".blocks";
const CACHE_FILE = "cache.json";
const CACHE_VERSION = "1.0";

export class CacheManager {
  private cache: ValidationCache | null = null;
  private cwd: string;
  private disabled: boolean;
  private dirty: boolean = false;

  constructor(cwd: string = process.cwd(), disabled: boolean = false) {
    this.cwd = cwd;
    this.disabled = disabled;
    if (!disabled) {
      this.load();
    }
  }

  /**
   * Get path to cache file
   */
  private getCachePath(): string {
    return join(this.cwd, CACHE_DIR, CACHE_FILE);
  }

  /**
   * Load cache from disk
   */
  private load(): void {
    const cachePath = this.getCachePath();
    if (existsSync(cachePath)) {
      try {
        const content = readFileSync(cachePath, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed.version === CACHE_VERSION) {
          this.cache = parsed;
        } else {
          // Version mismatch - invalidate cache
          this.cache = null;
        }
      } catch {
        // Invalid cache, will be regenerated
        this.cache = null;
      }
    }
  }

  /**
   * Save cache to disk
   */
  save(): void {
    if (this.disabled || !this.cache || !this.dirty) return;

    const cachePath = this.getCachePath();
    const dir = join(this.cwd, CACHE_DIR);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.cache.updatedAt = new Date().toISOString();
    writeFileSync(cachePath, JSON.stringify(this.cache, null, 2));
    this.dirty = false;
  }

  /**
   * Initialize or update cache with new config fingerprint
   */
  initializeCache(config: BlocksConfig, rawYaml: string): void {
    if (this.disabled) return;

    const fingerprint = computeConfigFingerprint(config, rawYaml);

    if (!this.cache) {
      this.cache = {
        version: CACHE_VERSION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        configFingerprint: fingerprint,
        blocks: {},
      };
      this.dirty = true;
    }
  }

  /**
   * Update config fingerprint after validation
   */
  updateConfigFingerprint(fingerprint: ConfigFingerprint): void {
    if (this.disabled || !this.cache) return;
    this.cache.configFingerprint = fingerprint;
    this.dirty = true;
  }

  /**
   * Get cached entry for a block
   */
  getBlockEntry(blockName: string): BlockCacheEntry | null {
    if (this.disabled || !this.cache) return null;
    return this.cache.blocks[blockName] || null;
  }

  /**
   * Update block cache entry after validation
   */
  updateBlockEntry(entry: BlockCacheEntry): void {
    if (this.disabled || !this.cache) return;
    this.cache.blocks[entry.blockName] = entry;
    this.dirty = true;
  }

  /**
   * Remove a block from cache (e.g., if block was deleted)
   */
  removeBlockEntry(blockName: string): void {
    if (this.disabled || !this.cache) return;
    if (this.cache.blocks[blockName]) {
      delete this.cache.blocks[blockName];
      this.dirty = true;
    }
  }

  /**
   * Get current config fingerprint
   */
  getConfigFingerprint(): ConfigFingerprint | null {
    return this.cache?.configFingerprint || null;
  }

  /**
   * Check if cache exists and is valid
   */
  isValid(): boolean {
    return !this.disabled && this.cache !== null;
  }

  /**
   * Check if cache is disabled
   */
  isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache = null;
    this.dirty = false;

    // Delete cache file if it exists
    const cachePath = this.getCachePath();
    if (existsSync(cachePath)) {
      try {
        unlinkSync(cachePath);
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Get all cached block names
   */
  getCachedBlockNames(): string[] {
    if (!this.cache) return [];
    return Object.keys(this.cache.blocks);
  }

  /**
   * Clean up cache entries for blocks that no longer exist in config
   */
  pruneDeletedBlocks(currentBlockNames: string[]): void {
    if (this.disabled || !this.cache) return;

    const currentSet = new Set(currentBlockNames);
    const cachedNames = Object.keys(this.cache.blocks);

    for (const cachedName of cachedNames) {
      if (!currentSet.has(cachedName)) {
        delete this.cache.blocks[cachedName];
        this.dirty = true;
      }
    }
  }
}
