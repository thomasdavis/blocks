// This file has TypeScript code but NO exports
// The shape validator should warn about this

function internalHelper(x: number): number {
  return x * 2;
}

const PRIVATE_CONSTANT = 42;

class InternalProcessor {
  process(data: string): string {
    return data.toUpperCase();
  }
}

// Using the internal helper
const result = internalHelper(PRIVATE_CONSTANT);
