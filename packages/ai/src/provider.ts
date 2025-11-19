import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
}

/**
 * AI Provider wrapper for semantic validation tasks
 * Uses Vercel AI SDK v6 with OpenAI
 */
export class AIProvider {
  private model: string;

  constructor(config: AIProviderConfig = {}) {
    this.model = config.model ?? "gpt-4o-mini";

    // Configure OpenAI API key from config or environment
    if (config.apiKey) {
      process.env.OPENAI_API_KEY = config.apiKey;
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
    const result = await generateObject({
      model: openai(this.model),
      schema: params.schema,
      prompt: params.prompt,
      ...(params.system && { system: params.system }),
    });

    return result.object;
  }

  /**
   * Generate text using AI
   */
  async generateText(params: { prompt: string; system?: string }): Promise<string> {
    const result = await generateText({
      model: openai(this.model),
      prompt: params.prompt,
      ...(params.system && { system: params.system }),
    });

    return result.text;
  }

  /**
   * Validate domain semantics using AI
   */
  async validateDomainSemantics(params: {
    blockName: string;
    blockDefinition: string;
    code: string;
    domainRules?: string[];
  }): Promise<{
    isValid: boolean;
    issues: Array<{ message: string; severity: "error" | "warning" }>;
  }> {
    const schema = z.object({
      isValid: z.boolean(),
      issues: z.array(
        z.object({
          message: z.string(),
          severity: z.enum(["error", "warning"]),
        })
      ),
    });

    const domainRulesText = params.domainRules?.length
      ? `\n\nDomain Rules:\n${params.domainRules.map((r) => `- ${r}`).join("\n")}`
      : "";

    const result = await this.generateStructured({
      schema,
      system: `You are a domain-driven design expert validating code against semantic intent.
Your job is to check if the implementation aligns with the domain specification.`,
      prompt: `Block Name: ${params.blockName}

Block Definition:
${params.blockDefinition}
${domainRulesText}

Implementation Code:
\`\`\`typescript
${params.code}
\`\`\`

Analyze if the code:
1. Expresses the domain intent clearly
2. Uses the specified inputs/outputs correctly
3. Adheres to domain rules (if any)
4. Introduces any undocumented concepts

Return validation result with issues found.`,
    });

    return result;
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
