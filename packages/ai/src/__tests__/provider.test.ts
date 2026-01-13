import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AIProvider } from "../provider.js";

describe("AIProvider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should default to OpenAI provider", () => {
      // Set a dummy API key to avoid initialization errors
      process.env.OPENAI_API_KEY = "test-key";
      const ai = new AIProvider();
      const info = ai.getProviderInfo();

      expect(info.provider).toBe("openai");
    });

    it("should use specified provider", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const ai = new AIProvider({ provider: "anthropic" });
      const info = ai.getProviderInfo();

      expect(info.provider).toBe("anthropic");
    });

    it("should use default model for provider", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const ai = new AIProvider();
      const info = ai.getProviderInfo();

      expect(info.model).toBe("gpt-4o-mini");
    });

    it("should use specified model", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const ai = new AIProvider({ model: "gpt-4o" });
      const info = ai.getProviderInfo();

      expect(info.model).toBe("gpt-4o");
    });

    it("should configure API key from config", () => {
      const _ai = new AIProvider({ apiKey: "custom-key" });

      expect(process.env.OPENAI_API_KEY).toBe("custom-key");
    });

    it("should set correct env var for Anthropic", () => {
      const _ai = new AIProvider({ provider: "anthropic", apiKey: "anthropic-key" });

      expect(process.env.ANTHROPIC_API_KEY).toBe("anthropic-key");
    });

    it("should set correct env var for Google", () => {
      const _ai = new AIProvider({ provider: "google", apiKey: "google-key" });

      expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).toBe("google-key");
    });
  });

  describe("getProviderInfo()", () => {
    it("should return provider and model info", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const ai = new AIProvider({
        provider: "openai",
        model: "gpt-4o-mini",
      });

      const info = ai.getProviderInfo();

      expect(info).toEqual({
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    it("should return correct info for Anthropic", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const ai = new AIProvider({
        provider: "anthropic",
        model: "claude-3-5-haiku-20241022",
      });

      const info = ai.getProviderInfo();

      expect(info).toEqual({
        provider: "anthropic",
        model: "claude-3-5-haiku-20241022",
      });
    });

    it("should return correct info for Google", () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
      const ai = new AIProvider({
        provider: "google",
        model: "gemini-1.5-pro",
      });

      const info = ai.getProviderInfo();

      expect(info).toEqual({
        provider: "google",
        model: "gemini-1.5-pro",
      });
    });
  });
});
