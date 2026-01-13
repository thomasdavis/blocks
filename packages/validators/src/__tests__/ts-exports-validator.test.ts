import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TsExportsShapeValidator } from "../shape/ts-exports-validator.js";
import type { ValidatorContext } from "../types.js";
import * as fs from "fs";
import * as path from "path";
import os from "os";

describe("TsExportsShapeValidator", () => {
  const validator = new TsExportsShapeValidator();
  let tempDir: string;

  beforeEach(() => {
    // Create temp directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "blocks-test-"));
  });

  afterEach(() => {
    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  function createContext(blockPath: string): ValidatorContext {
    return {
      blockName: "test.block",
      blockPath,
      config: {
        blocks: {
          "test.block": {
            path: blockPath,
          },
        },
      },
    };
  }

  describe("validate()", () => {
    it("should have correct id", () => {
      expect(validator.id).toBe("shape.exports.ts");
    });

    it("should fail when block path does not exist", async () => {
      const nonExistentPath = path.join(tempDir, "nonexistent");
      const context = createContext(nonExistentPath);

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "INVALID_PATH",
          message: expect.stringContaining("does not exist"),
        })
      );
    });

    it("should validate single file block with exports", async () => {
      const blockFile = path.join(tempDir, "block.ts");
      fs.writeFileSync(
        blockFile,
        `export function myBlock() { return "hello"; }\nexport const CONFIG = {};`
      );
      const context = createContext(blockFile);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.context?.summary).toContain("Single file block validated");
    });

    it("should warn when single file has no exports", async () => {
      const blockFile = path.join(tempDir, "block.ts");
      fs.writeFileSync(blockFile, `const internalFn = () => {};`);
      const context = createContext(blockFile);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true); // warning doesn't fail
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "warning",
          code: "NO_EXPORTS",
        })
      );
    });

    it("should validate directory with TypeScript files", async () => {
      const blockDir = path.join(tempDir, "my-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "index.ts"),
        `export { myBlock } from "./block.js";`
      );
      fs.writeFileSync(
        path.join(blockDir, "block.ts"),
        `export function myBlock() { return "hello"; }`
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.context?.summary).toContain("Shape validation passed");
    });

    it("should fail when directory has no TypeScript files", async () => {
      const blockDir = path.join(tempDir, "empty-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(path.join(blockDir, "readme.md"), "# My Block");
      fs.writeFileSync(path.join(blockDir, "config.json"), "{}");
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "NO_TS_FILES",
        })
      );
    });

    it("should detect exports in TypeScript files", async () => {
      const blockDir = path.join(tempDir, "exports-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "index.ts"),
        `export const VALUE = 1;\nexport function fn() {}\nexport class MyClass {}`
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.context?.summary).toContain("3 total export(s)");
    });

    it("should warn when no exports in any TypeScript file", async () => {
      const blockDir = path.join(tempDir, "no-exports-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "internal.ts"),
        `const internal = 1;\nfunction helper() {}`
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true); // warning doesn't fail
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "warning",
          code: "NO_EXPORTS",
        })
      );
    });

    it("should count exports correctly", async () => {
      const blockDir = path.join(tempDir, "multi-export-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "exports.ts"),
        `
export const A = 1;
export const B = 2;
export function fnA() {}
export function fnB() {}
export class ClassA {}
export type TypeA = string;
export interface InterfaceA {}
export default function main() {}
        `
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      // Should find multiple exports
      expect(result.context?.summary).toContain("total export(s)");
    });

    it("should ignore .d.ts files", async () => {
      const blockDir = path.join(tempDir, "dts-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "types.d.ts"),
        `export interface MyType {}`
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: "NO_TS_FILES",
        })
      );
    });

    it("should handle mixed .ts and .d.ts files", async () => {
      const blockDir = path.join(tempDir, "mixed-block");
      fs.mkdirSync(blockDir);
      fs.writeFileSync(
        path.join(blockDir, "index.ts"),
        `export function main() {}`
      );
      fs.writeFileSync(
        path.join(blockDir, "types.d.ts"),
        `export interface MyType {}`
      );
      const context = createContext(blockDir);

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      // Should only analyze index.ts, not types.d.ts
    });
  });
});
