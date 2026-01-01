/**
 * Types for intelligent incremental validation caching
 */

/**
 * Hash of a single file
 */
export interface FileHash {
  path: string; // Relative path from block directory
  hash: string; // SHA-256 hash of file content
  size: number; // File size in bytes
  mtime: number; // Last modified time (ms since epoch)
}

/**
 * Cached validation result for a single validator
 */
export interface CachedValidatorResult {
  passed: boolean;
  hash: string; // Content hash when this result was produced
  rulesApplied?: string[]; // Domain rules that were checked
  issues?: Array<{
    type: string;
    code: string;
    message: string;
  }>;
}

/**
 * Cached state for a single block
 */
export interface BlockCacheEntry {
  blockName: string;
  blockPath: string;
  files: FileHash[]; // All files in block directory
  contentHash: string; // Combined hash of all file hashes
  configHash: string; // Hash of block definition in blocks.yml
  lastValidated: string; // ISO 8601 timestamp
  lastRunId: string; // Reference to validation run
  validatorResults: Record<string, CachedValidatorResult>;
}

/**
 * Configuration fingerprint - tracks what parts of blocks.yml affect validation
 */
export interface ConfigFingerprint {
  /** Hash of the entire blocks.yml file */
  fullHash: string;

  /** Hash of philosophy array */
  philosophyHash: string;

  /** Hash of domain section (entities, signals, measures) */
  domainHash: string;

  /** Hash of AI config (provider, model) */
  aiConfigHash: string;

  /** Hash of validators array */
  validatorsHash: string;

  /** Hash of global domain_rules (blocks.domain_rules) */
  globalDomainRulesHash: string;

  /** Per-block configuration hashes */
  blockConfigs: Record<
    string,
    {
      definitionHash: string; // Hash of full block definition
      domainRulesHash: string | null; // Hash of block-specific domain_rules (null if using defaults)
      inputsOutputsHash: string; // Hash of inputs/outputs schema
    }
  >;
}

/**
 * Reason why validation was skipped
 */
export interface SkipReason {
  type: "cached";
  message: string;
  lastValidated?: string;
}

/**
 * Reason why re-validation is required
 */
export type RevalidationReason =
  | { type: "first_run"; message: string }
  | { type: "files_changed"; changedFiles: string[]; message: string }
  | { type: "philosophy_changed"; message: string }
  | { type: "domain_changed"; message: string }
  | { type: "ai_config_changed"; message: string }
  | { type: "validators_changed"; message: string }
  | { type: "global_rules_changed"; message: string }
  | { type: "block_rules_changed"; message: string }
  | { type: "block_definition_changed"; message: string }
  | { type: "force_flag"; message: string }
  | { type: "cache_corrupted"; message: string }
  | { type: "always_run"; message: string };

/**
 * Full cache state stored in .blocks/cache.json
 */
export interface ValidationCache {
  version: "1.0";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  configFingerprint: ConfigFingerprint;
  blocks: Record<string, BlockCacheEntry>;
}

/**
 * Decision for a single validator
 */
export interface ValidatorDecision {
  validatorId: string;
  shouldRun: boolean;
  reason: SkipReason | RevalidationReason;
  cachedResult?: CachedValidatorResult;
}

/**
 * Decision for a block's validation
 */
export interface BlockValidationDecision {
  blockName: string;
  blockPath: string;
  validators: ValidatorDecision[];
  allSkipped: boolean;
  summary: string;
  currentFiles: FileHash[];
  currentContentHash: string;
}
