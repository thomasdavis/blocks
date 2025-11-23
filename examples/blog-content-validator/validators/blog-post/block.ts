/**
 * Blog Post Validator
 *
 * Validates blog post content for humor and conversational tone.
 * Domain compliance enforced at development time by Blocks validator.
 */

import { readFileSync } from 'fs';

export interface BlogPost {
  path: string;
  content?: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Validates blog post for humor and conversational tone.
 *
 * @param post - Blog post with path to markdown file
 * @returns Validation result
 */
export function validateBlogPost(post: BlogPost): ValidationResult {
  // Read markdown content from file if not provided
  const content = post.content || readFileSync(post.path, 'utf-8');

  // Input validation
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      message: 'Blog post content is empty',
    };
  }

  // Simple validation - domain validator will check semantic humor/tone
  // This just does basic checks
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < 100) {
    return {
      valid: false,
      message: `Blog post too short (${wordCount} words, need at least 100)`,
    };
  }

  return {
    valid: true,
    message: 'Blog post passes basic validation',
  };
}
