interface TestInput {
  id: string;
  data: string;
}

interface TestOutput {
  result: string;
  metadata: Record<string, unknown>;
}

/**
 * Processes input data and returns a result with metadata.
 * This block does NOT produce HTML output, so semantic HTML rules don't apply.
 * The output is a structured data object, not a rendered template.
 */
export function processInput(input: TestInput): { output: TestOutput } {
  return {
    output: {
      result: `Processed: ${input.data}`,
      metadata: {
        inputId: input.id,
        processedAt: new Date().toISOString(),
      },
    },
  };
}
