import { chromium, Browser, Page } from 'playwright';
import type { Viewport, Screenshot } from '../types.js';

/**
 * Screenshot capture service using Playwright
 *
 * Optimized for performance by reusing browser instances across multiple captures.
 */
export class ScreenshotCapture {
  private browser: Browser | null = null;
  private isInitialized = false;

  /**
   * Initialize the browser instance
   * Call this once before capturing screenshots
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Avoid shared memory issues in Docker/CI
      ],
    });

    this.isInitialized = true;
  }

  /**
   * Capture screenshots at multiple viewports in parallel
   */
  async captureMultiple(html: string, viewports: Viewport[]): Promise<Screenshot[]> {
    if (!this.browser || !this.isInitialized) {
      throw new Error('ScreenshotCapture not initialized. Call initialize() first.');
    }

    // Parallelize screenshot capture across viewports
    const screenshots = await Promise.all(
      viewports.map((viewport) => this.captureAtViewport(html, viewport))
    );

    return screenshots;
  }

  /**
   * Capture a single screenshot at a specific viewport
   */
  async capture(html: string, viewport: Viewport): Promise<Screenshot> {
    if (!this.browser || !this.isInitialized) {
      throw new Error('ScreenshotCapture not initialized. Call initialize() first.');
    }

    return this.captureAtViewport(html, viewport);
  }

  /**
   * Internal: Capture screenshot at specific viewport
   */
  private async captureAtViewport(html: string, viewport: Viewport): Promise<Screenshot> {
    const page = await this.browser!.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });

    try {
      // Set content and wait for resources to load
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Wait for fonts and images to fully load
      // This ensures the screenshot captures the final rendered state
      await page.waitForTimeout(500);

      // Capture full page screenshot
      const buffer = await page.screenshot({
        fullPage: true,
        type: 'png',
      });

      return { buffer, viewport };
    } finally {
      await page.close();
    }
  }

  /**
   * Close the browser instance
   * Call this after all screenshots are captured
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if browser is initialized and ready
   */
  get ready(): boolean {
    return this.isInitialized && this.browser !== null;
  }
}
