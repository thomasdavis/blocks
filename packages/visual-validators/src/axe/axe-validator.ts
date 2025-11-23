import { chromium } from 'playwright';
import { injectAxe, getViolations } from 'axe-playwright';
import type { VisualIssue, VisualValidationResult } from '../types.js';

/**
 * Axe-core accessibility validator
 *
 * Uses axe-core for deterministic WCAG compliance checking:
 * - Color contrast ratios (WCAG AA: 4.5:1, AAA: 7:1)
 * - ARIA attributes
 * - Semantic HTML
 * - Heading hierarchy
 * - Landmark regions
 *
 * Fast, precise, no AI costs.
 */
export class AxeValidator {
  /**
   * Validate HTML for WCAG accessibility compliance
   */
  async validate(html: string): Promise<VisualValidationResult> {
    const issues: VisualIssue[] = [];

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // Load HTML content
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Inject axe-core library
      await injectAxe(page);

      // Run accessibility checks with specific rules
      const violations = await getViolations(page, null, {
        rules: {
          // Color contrast
          'color-contrast': { enabled: true },

          // ARIA
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },

          // Semantic HTML
          'heading-order': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true },

          // Forms
          'label': { enabled: true },
          'button-name': { enabled: true },

          // Images
          'image-alt': { enabled: true },
        },
      });

      // Convert axe violations to visual issues
      for (const violation of violations) {
        // Determine severity based on impact
        const severity = this.mapImpactToSeverity(violation.impact);

        for (const node of violation.nodes) {
          issues.push({
            type: severity,
            code: violation.id.toUpperCase().replace(/-/g, '_'),
            message: `${violation.description}`,
            suggestion: `${violation.help}\n${node.failureSummary}`,
          });
        }
      }
    } finally {
      await browser.close();
    }

    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      issues,
    };
  }

  /**
   * Map axe-core impact levels to error/warning severity
   */
  private mapImpactToSeverity(
    impact: 'minor' | 'moderate' | 'serious' | 'critical' | undefined | null
  ): 'error' | 'warning' {
    if (impact === 'critical' || impact === 'serious') {
      return 'error';
    }
    return 'warning';
  }

  /**
   * Get supported rule IDs
   */
  static getSupportedRules(): string[] {
    return [
      'color-contrast',
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-valid-attr',
      'aria-valid-attr-value',
      'heading-order',
      'landmark-one-main',
      'page-has-heading-one',
      'label',
      'button-name',
      'image-alt',
    ];
  }
}
