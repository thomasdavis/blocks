/**
 * Visual validation types for Blocks framework
 */

export interface Viewport {
  width: number;
  height: number;
  name: string;
}

export interface Screenshot {
  buffer: Buffer;
  viewport: Viewport;
}

export interface VisualIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
  viewport?: string;
}

export interface VisualValidationResult {
  valid: boolean;
  issues: VisualIssue[];
}

export interface VisualValidationConfig {
  viewports?: Viewport[];
  rules?: string[];
  enabled?: boolean;
}

export const DEFAULT_VIEWPORTS: Viewport[] = [
  { width: 320, height: 568, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1024, height: 768, name: 'desktop' },
];
