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
    this.model = config.model ?? "gpt-5.1-mini";

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
    files: Record<string, string>;
    domainRules?: string[];
    philosophy?: string[];
  }): Promise<{
    isValid: boolean;
    issues: Array<{ message: string; severity: "error" | "warning"; file?: string }>;
  }> {
    const schema = z.object({
      isValid: z.boolean(),
      issues: z.array(
        z.object({
          message: z.string(),
          severity: z.enum(["error", "warning"]),
          file: z.string().optional(),
        })
      ),
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

    const result = await this.generateStructured({
      schema,
      system: `You are validating a block in the Blocks framework - a domain-driven validation system for agentic coding.

Blocks is a development-time framework that guides AI agents to produce code that aligns with domain semantics. Your role is to analyze block source code (not runtime behavior) for domain compliance.

DOMAIN CONCEPTS:
- Entities: Core data types (e.g., resume, user, product)
- Signals: Domain concepts to extract (e.g., readability, professionalism)
- Measures: Constraints on outputs (e.g., valid_html, responsive_layout)

Your validation should focus on SOURCE CODE analysis:
- For templates: Check template source for semantic HTML, ARIA labels, CSS media queries, etc.
- For code: Check if logic expresses domain intent clearly
- Do NOT focus on runtime behavior or test execution
- Check if domain rules are reflected in the implementation`,
      prompt: `Block Name: ${params.blockName}
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

Return validation issues with specific file references where possible.`,
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
