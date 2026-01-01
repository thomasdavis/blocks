/**
 * Skip logic for intelligent incremental validation
 * Determines which validators can be skipped based on file/config changes
 */

import type {
  BlockCacheEntry,
  ConfigFingerprint,
  ValidatorDecision,
  BlockValidationDecision,
  RevalidationReason,
  SkipReason,
  FileHash,
} from "./types.js";
import {
  hashBlockFiles,
  computeContentHash,
  computeConfigFingerprint,
  diffFileHashes,
} from "./hasher.js";
import { CacheManager } from "./cache-manager.js";
import type { BlocksConfig } from "@blocksai/schema";

/**
 * Validators that are always fast and should always run
 * These don't use AI and complete in < 10ms typically
 */
const ALWAYS_RUN_VALIDATORS = [
  "schema",
  "schema.io",
  "shape.ts",
  "shape.exports.ts",
];

/**
 * Validators that are slow (AI-powered) and benefit from caching
 * Custom validators are also treated as slow by default
 */
const SLOW_VALIDATORS = ["domain", "domain.validation", "output", "output.runtime"];

/**
 * Map short validator names to their full IDs for cache lookup
 */
const VALIDATOR_ID_MAP: Record<string, string[]> = {
  "schema": ["schema", "schema.io"],
  "schema.io": ["schema", "schema.io"],
  "shape.ts": ["shape.ts", "shape.exports.ts"],
  "shape.exports.ts": ["shape.ts", "shape.exports.ts"],
  "domain": ["domain", "domain.validation"],
  "domain.validation": ["domain", "domain.validation"],
  "output": ["output", "output.runtime"],
  "output.runtime": ["output", "output.runtime"],
};

/**
 * Find cached result for a validator, checking multiple possible IDs
 */
function findCachedResult(
  validatorId: string,
  cachedResults: Record<string, { passed: boolean; hash: string; issues?: Array<{ type: string; code: string; message: string }> }>
): { passed: boolean; hash: string; issues?: Array<{ type: string; code: string; message: string }> } | null {
  // Check direct match first
  if (cachedResults[validatorId]) {
    return cachedResults[validatorId];
  }

  // Check mapped IDs
  const mappedIds = VALIDATOR_ID_MAP[validatorId];
  if (mappedIds) {
    for (const id of mappedIds) {
      if (cachedResults[id]) {
        return cachedResults[id];
      }
    }
  }

  // Check if any cached result ID contains the validator ID (for custom validators)
  for (const [cachedId, result] of Object.entries(cachedResults)) {
    if (cachedId.includes(validatorId) || validatorId.includes(cachedId)) {
      return result;
    }
  }

  return null;
}

export class SkipLogic {
  private cacheManager: CacheManager;
  private config: BlocksConfig;
  private rawYaml: string;
  private oldFingerprint: ConfigFingerprint | null;
  private newFingerprint: ConfigFingerprint;
  private forceMode: boolean;
  private globalReasons: RevalidationReason[] | null = null;

  constructor(
    cacheManager: CacheManager,
    config: BlocksConfig,
    rawYaml: string,
    forceMode: boolean = false
  ) {
    this.cacheManager = cacheManager;
    this.config = config;
    this.rawYaml = rawYaml;
    this.forceMode = forceMode;
    this.oldFingerprint = cacheManager.getConfigFingerprint();
    this.newFingerprint = computeConfigFingerprint(config, rawYaml);
  }

  /**
   * Determine if global config changes require all blocks to revalidate
   * Cached after first call
   */
  private checkGlobalChanges(): RevalidationReason[] {
    if (this.globalReasons !== null) {
      return this.globalReasons;
    }

    const reasons: RevalidationReason[] = [];

    if (!this.oldFingerprint) {
      reasons.push({
        type: "first_run",
        message: "No cache found, running full validation",
      });
      this.globalReasons = reasons;
      return reasons;
    }

    if (
      this.oldFingerprint.philosophyHash !== this.newFingerprint.philosophyHash
    ) {
      reasons.push({
        type: "philosophy_changed",
        message: "Project philosophy changed",
      });
    }

    if (this.oldFingerprint.domainHash !== this.newFingerprint.domainHash) {
      reasons.push({
        type: "domain_changed",
        message: "Domain entities/signals/measures changed",
      });
    }

    if (this.oldFingerprint.aiConfigHash !== this.newFingerprint.aiConfigHash) {
      reasons.push({
        type: "ai_config_changed",
        message: "AI provider or model changed",
      });
    }

    if (
      this.oldFingerprint.validatorsHash !== this.newFingerprint.validatorsHash
    ) {
      reasons.push({
        type: "validators_changed",
        message: "Validator pipeline changed",
      });
    }

    this.globalReasons = reasons;
    return reasons;
  }

  /**
   * Check if global domain_rules changed (affects blocks using defaults)
   */
  private checkGlobalRulesChanged(): boolean {
    if (!this.oldFingerprint) return true;
    return (
      this.oldFingerprint.globalDomainRulesHash !==
      this.newFingerprint.globalDomainRulesHash
    );
  }

  /**
   * Check if a block uses its own domain_rules or inherits global ones
   */
  private blockUsesGlobalRules(blockName: string): boolean {
    const blockConfig = this.newFingerprint.blockConfigs[blockName];
    return blockConfig?.domainRulesHash === null;
  }

  /**
   * Check if a specific block needs revalidation based on file/config changes
   */
  private checkBlockChanges(
    blockName: string,
    blockPath: string,
    cachedEntry: BlockCacheEntry | null
  ): {
    reasons: RevalidationReason[];
    currentFiles: FileHash[];
    currentHash: string;
  } {
    const reasons: RevalidationReason[] = [];
    const currentFiles = hashBlockFiles(blockPath);
    const currentHash = computeContentHash(currentFiles);

    if (!cachedEntry) {
      reasons.push({
        type: "first_run",
        message: `Block "${blockName}" not in cache`,
      });
      return { reasons, currentFiles, currentHash };
    }

    // Check if files changed
    if (cachedEntry.contentHash !== currentHash) {
      const diff = diffFileHashes(cachedEntry.files, currentFiles);
      const changedFiles: string[] = [
        ...diff.added.map((f) => `+ ${f}`),
        ...diff.removed.map((f) => `- ${f}`),
        ...diff.modified.map((f) => `~ ${f}`),
      ];

      reasons.push({
        type: "files_changed",
        changedFiles,
        message: `${changedFiles.length} file(s) changed`,
      });
    }

    // Check block-specific config changes
    const oldBlockConfig = this.oldFingerprint?.blockConfigs[blockName];
    const newBlockConfig = this.newFingerprint.blockConfigs[blockName];

    if (
      !oldBlockConfig ||
      oldBlockConfig.definitionHash !== newBlockConfig?.definitionHash
    ) {
      reasons.push({
        type: "block_definition_changed",
        message: `Block definition changed in blocks.yml`,
      });
    }

    // Check if block-specific domain_rules changed
    if (oldBlockConfig?.domainRulesHash !== newBlockConfig?.domainRulesHash) {
      if (newBlockConfig?.domainRulesHash !== null) {
        reasons.push({
          type: "block_rules_changed",
          message: `Block domain_rules changed`,
        });
      }
    }

    return { reasons, currentFiles, currentHash };
  }

  /**
   * Decide whether each validator should run for a block
   */
  decideBlock(
    blockName: string,
    blockPath: string,
    validators: string[]
  ): BlockValidationDecision {
    const decisions: ValidatorDecision[] = [];

    // Get current file state
    const currentFiles = hashBlockFiles(blockPath);
    const currentContentHash = computeContentHash(currentFiles);

    // Check for force mode first
    if (this.forceMode) {
      for (const validatorId of validators) {
        decisions.push({
          validatorId,
          shouldRun: true,
          reason: { type: "force_flag", message: "--force flag specified" },
        });
      }
      return {
        blockName,
        blockPath,
        validators: decisions,
        allSkipped: false,
        summary: "Force mode: running all validators",
        currentFiles,
        currentContentHash,
      };
    }

    // Check for disabled cache
    if (this.cacheManager.isDisabled()) {
      for (const validatorId of validators) {
        decisions.push({
          validatorId,
          shouldRun: true,
          reason: { type: "first_run", message: "Cache disabled" },
        });
      }
      return {
        blockName,
        blockPath,
        validators: decisions,
        allSkipped: false,
        summary: "Cache disabled: running all validators",
        currentFiles,
        currentContentHash,
      };
    }

    // Check global changes
    const globalReasons = this.checkGlobalChanges();

    // Check block-specific changes
    const cachedEntry = this.cacheManager.getBlockEntry(blockName);
    const { reasons: blockReasons } = this.checkBlockChanges(
      blockName,
      blockPath,
      cachedEntry
    );

    // Check if global rules changed and this block uses them
    const globalRulesChanged = this.checkGlobalRulesChanged();
    const usesGlobalRules = this.blockUsesGlobalRules(blockName);

    // Combine reasons that affect this block
    const applicableGlobalReasons = globalReasons.filter((r) => {
      // These always apply to all blocks
      if (
        r.type === "first_run" ||
        r.type === "philosophy_changed" ||
        r.type === "domain_changed" ||
        r.type === "ai_config_changed" ||
        r.type === "validators_changed"
      ) {
        return true;
      }
      return false;
    });

    // Add global rules reason if applicable
    if (globalRulesChanged && usesGlobalRules) {
      applicableGlobalReasons.push({
        type: "global_rules_changed",
        message: "Global domain_rules changed",
      });
    }

    const allReasons = [...applicableGlobalReasons, ...blockReasons];
    const needsRevalidation = allReasons.length > 0;

    for (const validatorId of validators) {
      const isAlwaysRun = ALWAYS_RUN_VALIDATORS.some(
        (v) => validatorId === v || validatorId.includes(v)
      );
      // Treat as slow if: matches slow validators OR is a custom validator (not in always-run list)
      const isSlowValidator = SLOW_VALIDATORS.some(
        (v) => validatorId === v || validatorId.includes(v)
      ) || !isAlwaysRun;

      // Fast validators always run - they're cheap
      if (isAlwaysRun) {
        decisions.push({
          validatorId,
          shouldRun: true,
          reason: { type: "always_run", message: "Fast validator" },
        });
        continue;
      }

      // For slow validators, apply skip logic
      if (isSlowValidator && !needsRevalidation && cachedEntry) {
        // Check if we have a cached result for this validator
        const cachedResult = findCachedResult(validatorId, cachedEntry.validatorResults);

        if (cachedResult && cachedEntry.contentHash === currentContentHash) {
          // Can skip!
          const skipReason: SkipReason = {
            type: "cached",
            message: `No changes since ${cachedEntry.lastValidated}`,
            lastValidated: cachedEntry.lastValidated,
          };

          decisions.push({
            validatorId,
            shouldRun: false,
            reason: skipReason,
            cachedResult,
          });
          continue;
        }
      }

      // Need to run - determine why
      const primaryReason: RevalidationReason = allReasons[0] || {
        type: "first_run",
        message: "No cached result",
      };

      decisions.push({
        validatorId,
        shouldRun: true,
        reason: primaryReason,
      });
    }

    const skippedCount = decisions.filter((d) => !d.shouldRun).length;
    const allSkipped = skippedCount === decisions.length;

    let summary: string;
    if (allSkipped) {
      summary = "All validators cached";
    } else if (skippedCount > 0) {
      summary = `${skippedCount}/${decisions.length} cached`;
    } else if (needsRevalidation && allReasons.length > 0) {
      // Show first reason
      summary = allReasons[0].message;
    } else {
      summary = "Running validation";
    }

    return {
      blockName,
      blockPath,
      validators: decisions,
      allSkipped,
      summary,
      currentFiles,
      currentContentHash,
    };
  }

  /**
   * Get the new config fingerprint for saving
   */
  getNewFingerprint(): ConfigFingerprint {
    return this.newFingerprint;
  }

  /**
   * Check if any global changes require full revalidation
   */
  hasGlobalChanges(): boolean {
    const reasons = this.checkGlobalChanges();
    return reasons.length > 0;
  }

  /**
   * Get summary of global changes for display
   */
  getGlobalChangesSummary(): string | null {
    const reasons = this.checkGlobalChanges();
    if (reasons.length === 0) return null;
    return reasons.map((r) => r.message).join(", ");
  }
}
