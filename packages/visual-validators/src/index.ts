/**
 * @blocksai/visual-validators
 *
 * Visual validation for Blocks framework using screenshots and AI vision analysis.
 *
 * Provides two validation approaches:
 * 1. Deterministic (AxeValidator) - Fast, precise WCAG compliance with axe-core
 * 2. AI-powered (VisionValidator) - Holistic readability using GPT-4o vision
 *
 * @example
 * ```typescript
 * import { AxeValidator, VisionValidator } from '@blocksai/visual-validators';
 * import { AIProvider } from '@blocksai/ai';
 *
 * const html = `<html>...</html>`;
 *
 * // Deterministic WCAG validation
 * const axe = new AxeValidator();
 * const axeResult = await axe.validate(html);
 *
 * // AI-powered visual validation
 * const ai = new AIProvider({ provider: 'openai', model: 'gpt-4o-mini' });
 * const vision = new VisionValidator(ai);
 * const visionResult = await vision.validate({
 *   html,
 *   blockName: 'theme.modern_professional',
 *   visualRules: ['WCAG AA contrast', 'Clear visual hierarchy'],
 * });
 * ```
 */

export { ScreenshotCapture } from './screenshot/capture.js';
export { AxeValidator } from './axe/axe-validator.js';
export { VisionValidator } from './vision/vision-validator.js';

export type {
  Viewport,
  Screenshot,
  VisualIssue,
  VisualValidationResult,
  VisualValidationConfig,
} from './types.js';

export { DEFAULT_VIEWPORTS } from './types.js';
