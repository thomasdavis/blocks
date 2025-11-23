import { AIProvider } from '@blocksai/ai';
import { ScreenshotCapture } from '../screenshot/capture.js';
import type { VisualIssue, VisualValidationResult, Viewport, DEFAULT_VIEWPORTS } from '../types.js';

/**
 * AI-powered visual validator using GPT-4o vision
 *
 * Analyzes screenshots for:
 * - Color contrast and readability (holistic, not just mathematical)
 * - Visual hierarchy and flow
 * - Layout integrity across viewports
 * - Element visibility and spacing
 *
 * Complements AxeValidator by catching UX issues that deterministic tools miss.
 */
export class VisionValidator {
  private ai: AIProvider;
  private screenshotCapture: ScreenshotCapture;

  constructor(ai: AIProvider) {
    this.ai = ai;
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Validate HTML across multiple viewports using AI vision
   */
  async validate(params: {
    html: string;
    blockName: string;
    viewports?: Viewport[];
    visualRules?: string[];
    philosophy?: string[];
  }): Promise<VisualValidationResult> {
    const issues: VisualIssue[] = [];

    await this.screenshotCapture.initialize();

    try {
      const viewports = params.viewports || [
        { width: 320, height: 568, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'desktop' },
      ];

      // Capture screenshots at all viewports
      const screenshots = await this.screenshotCapture.captureMultiple(
        params.html,
        viewports
      );

      // Analyze each screenshot with AI vision
      for (const { buffer, viewport } of screenshots) {
        const result = await this.ai.validateVisualSemantics({
          screenshot: buffer,
          blockName: params.blockName,
          visualRules: params.visualRules,
          philosophy: params.philosophy,
          viewport: viewport.name,
        });

        // Add viewport context to issues
        for (const issue of result.issues) {
          issues.push({
            type: issue.severity,
            code: 'VISUAL_ISSUE',
            message: issue.message,
            viewport: viewport.name,
          });
        }
      }
    } finally {
      await this.screenshotCapture.close();
    }

    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      issues,
    };
  }

  /**
   * Validate a single viewport (faster for testing)
   */
  async validateSingleViewport(params: {
    html: string;
    blockName: string;
    viewport: Viewport;
    visualRules?: string[];
    philosophy?: string[];
  }): Promise<VisualValidationResult> {
    await this.screenshotCapture.initialize();

    try {
      const screenshot = await this.screenshotCapture.capture(params.html, params.viewport);

      const result = await this.ai.validateVisualSemantics({
        screenshot: screenshot.buffer,
        blockName: params.blockName,
        visualRules: params.visualRules,
        philosophy: params.philosophy,
        viewport: params.viewport.name,
      });

      return {
        valid: result.isValid,
        issues: result.issues.map((issue) => ({
          type: issue.severity,
          code: 'VISUAL_ISSUE',
          message: issue.message,
          viewport: params.viewport.name,
        })),
      };
    } finally {
      await this.screenshotCapture.close();
    }
  }
}
