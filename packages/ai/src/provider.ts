import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";

export type ProviderName = "openai" | "anthropic" | "google";

export interface AIProviderConfig {
  /**
   * AI provider to use (default: "openai")
   * Supported: openai, anthropic, google
   */
  provider?: ProviderName;

  /**
   * Model name to use (default depends on provider)
   * OpenAI: "gpt-4o-mini", "gpt-4o", "gpt-4-turbo"
   * Anthropic: "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"
   * Google: "gemini-1.5-flash", "gemini-1.5-pro"
   */
  model?: string;

  /**
   * API key (optional - will use env vars if not provided)
   * Env vars: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY
   */
  apiKey?: string;
}

/**
 * AI Provider wrapper for semantic validation tasks
 * Uses Vercel AI SDK v6 with support for OpenAI, Anthropic, and Google
 *
 * @example
 * // Use OpenAI (default)
 * const ai = new AIProvider();
 *
 * @example
 * // Use Anthropic Claude
 * const ai = new AIProvider({
 *   provider: "anthropic",
 *   model: "claude-3-5-sonnet-20241022"
 * });
 *
 * @example
 * // Use Google Gemini
 * const ai = new AIProvider({
 *   provider: "google",
 *   model: "gemini-1.5-flash"
 * });
 */
export class AIProvider {
  private languageModel: LanguageModel;
  private provider: ProviderName;
  private modelName: string;

  constructor(config: AIProviderConfig = {}) {
    this.provider = config.provider ?? "openai";

    // Set default models per provider
    const defaultModels: Record<ProviderName, string> = {
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-sonnet-20241022",
      google: "gemini-1.5-flash",
    };

    this.modelName = config.model ?? defaultModels[this.provider];

    // Configure API key if provided
    if (config.apiKey) {
      const envVar = this.getApiKeyEnvVar(this.provider);
      process.env[envVar] = config.apiKey;
    }

    // Initialize language model based on provider
    this.languageModel = this.createLanguageModel(this.provider, this.modelName);
  }

  private getApiKeyEnvVar(provider: ProviderName): string {
    const envVars: Record<ProviderName, string> = {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      google: "GOOGLE_GENERATIVE_AI_API_KEY",
    };
    return envVars[provider];
  }

  private createLanguageModel(provider: ProviderName, model: string): LanguageModel {
    switch (provider) {
      case "openai":
        return openai(model);
      case "anthropic":
        return anthropic(model);
      case "google":
        return google(model);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate structured output using AI
   */
  async generateStructured<T extends z.ZodTypeAny>(params: {
    schema: T;
    prompt: string;
    system?: string;
  }): Promise<z.infer<T>> {
    const result = await generateText({
      model: this.languageModel,
      prompt: params.prompt,
      ...(params.system && { system: params.system }),
      experimental_output: Output.object({ schema: params.schema }),
    });

    return result.experimental_output;
  }

  /**
   * Generate text using AI
   */
  async generateText(params: { prompt: string; system?: string }): Promise<string> {
    const result = await generateText({
      model: this.languageModel,
      prompt: params.prompt,
      ...(params.system && { system: params.system }),
    });

    return result.text;
  }

  /**
   * Rich response from AI validation with full context
   */
  public getProviderInfo(): { provider: string; model: string } {
    return { provider: this.provider, model: this.modelName };
  }

  /**
   * Validate domain semantics using AI
   * Returns rich response with full prompt, response, and token usage
   */
  async validateDomainSemantics(params: {
    blockName: string;
    blockDefinition: string;
    files: Record<string, string>;
    domainRules?: string[];
    philosophy?: string[];
  }): Promise<{
    isValid: boolean;
    issues: Array<{ message: string; severity: "error" | "warning"; file?: string }>;
    summary?: string;
    _meta: {
      provider: string;
      model: string;
      prompt: string;
      systemPrompt: string;
      response: string;
      tokensUsed?: { input: number; output: number };
    };
  }> {
    const schema = z.object({
      isValid: z.boolean(),
      issues: z.array(
        z.object({
          message: z.string().describe("Description of the issue found"),
          severity: z.enum(["error", "warning"]).describe("Severity of the issue"),
          file: z.string().describe("File path where the issue was found, or empty string if not file-specific"),
        })
      ),
      summary: z.string().describe("Brief summary of why the block passed or failed validation"),
    });

    const domainRulesText = params.domainRules?.length
      ? `\n\nDOMAIN RULES:\n${params.domainRules.map((r) => `- ${r}`).join("\n")}`
      : "";

    const philosophyText = params.philosophy?.length
      ? `\n\nBLOCKS PHILOSOPHY:\n${params.philosophy.map((p) => `- ${p}`).join("\n")}`
      : "";

    const filesText = Object.entries(params.files)
      .map(
        ([path, content]) => `
--- ${path} ---
\`\`\`
${content}
\`\`\`
`
      )
      .join("\n");

    const systemPrompt = `You are validating a block in the Blocks framework - a domain-driven validation system for agentic coding.

Blocks is a development-time framework that guides AI agents to produce code that aligns with domain semantics. Your role is to analyze block source code (not runtime behavior) for domain compliance.

DOMAIN CONCEPTS:
- Entities: Core data types (e.g., resume, user, product)
- Signals: Domain concepts to extract (e.g., readability, professionalism)
- Measures: Constraints on outputs (e.g., valid_html, responsive_layout)

Your validation should focus on SOURCE CODE analysis:
- For templates: Check template source for semantic HTML, ARIA labels, CSS media queries, etc.
- For code: Check if logic expresses domain intent clearly
- Do NOT focus on runtime behavior or test execution
- Check if domain rules are reflected in the implementation`;

    const prompt = `Block Name: ${params.blockName}
${philosophyText}

Block Definition:
${params.blockDefinition}
${domainRulesText}

BLOCK FILES:
${filesText}

VALIDATION TASK:
Analyze ALL files together to determine if this block:
1. Expresses domain intent clearly in source code
2. Uses specified inputs/outputs correctly
3. Adheres to all domain rules
4. For templates: Check if template SOURCE contains semantic HTML, ARIA labels, media queries, heading hierarchy
5. Does NOT introduce undocumented concepts

Return validation issues with specific file references where possible.
Also provide a brief summary explaining why the block passed or failed validation.`;

    const result = await generateText({
      model: this.languageModel,
      prompt,
      system: systemPrompt,
      experimental_output: Output.object({ schema }),
    });

    const output = result.experimental_output;

    return {
      isValid: output.isValid,
      issues: output.issues,
      summary: output.summary,
      _meta: {
        provider: this.provider,
        model: this.modelName,
        prompt,
        systemPrompt,
        response: JSON.stringify(output, null, 2),
        tokensUsed: result.usage
          ? { input: result.usage.inputTokens ?? 0, output: result.usage.outputTokens ?? 0 }
          : undefined,
      },
    };
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    const schema = z.object({
      language: z.string(),
      confidence: z.number(),
    });

    const result = await this.generateStructured({
      schema,
      prompt: `Detect the language of this text: "${text}"`,
    });

    return result.language;
  }

  /**
   * Score quality on a 0-1 scale
   */
  async scoreQuality(params: {
    content: string;
    criteria: string[];
  }): Promise<{ score: number; reasoning: string }> {
    const schema = z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string(),
    });

    const result = await this.generateStructured({
      schema,
      prompt: `Score the following content based on these criteria:
${params.criteria.map((c) => `- ${c}`).join("\n")}

Content:
${params.content}

Provide a score between 0 and 1, and explain your reasoning.`,
    });

    return result;
  }
}
