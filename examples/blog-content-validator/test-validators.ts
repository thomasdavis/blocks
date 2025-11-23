/**
 * Manual test script to run validators on test markdown files
 */

import { validateHumorTone } from './validators/humor-tone/block.js';
import { validateContentStructure } from './validators/content-structure/block.js';
import { validateSEOCompliance } from './validators/seo-compliance/block.js';
import { validateMarkdownQuality } from './validators/markdown-quality/block.js';
import { validateComprehensive } from './validators/comprehensive/block.js';

const testFiles = [
  {
    name: 'Good Post (should pass all)',
    path: 'test-data/good-post.md',
  },
  {
    name: 'No Humor (should fail humor check)',
    path: 'test-data/no-humor.md',
  },
  {
    name: 'Poor SEO (should fail SEO and markdown checks)',
    path: 'test-data/poor-seo.md',
  },
];

console.log('🧪 Testing Blog Content Validators\n');
console.log('=' .repeat(80));

testFiles.forEach(testFile => {
  console.log(`\n📄 Testing: ${testFile.name}`);
  console.log('-'.repeat(80));

  const post = { path: testFile.path };

  // Run comprehensive validator
  try {
    const result = validateComprehensive(post);

    console.log(`\n📊 Overall Score: ${(result.overall_score * 100).toFixed(0)}%`);
    console.log(`✓  Compliant: ${result.overall_compliant ? 'YES' : 'NO'}\n`);

    console.log('Individual Validator Results:');
    console.log(`  - Humor/Tone:        ${(result.validator_results.humor_tone.score! * 100).toFixed(0)}% ${result.validator_results.humor_tone.compliant ? '✓' : '✗'}`);
    console.log(`  - Content Structure: ${(result.validator_results.content_structure.score! * 100).toFixed(0)}% ${result.validator_results.content_structure.compliant ? '✓' : '✗'}`);
    console.log(`  - SEO Compliance:    ${(result.validator_results.seo_compliance.score! * 100).toFixed(0)}% ${result.validator_results.seo_compliance.compliant ? '✓' : '✗'}`);
    console.log(`  - Markdown Quality:  ${(result.validator_results.markdown_quality.score! * 100).toFixed(0)}% ${result.validator_results.markdown_quality.compliant ? '✓' : '✗'}`);

    console.log('\n' + result.summary);
  } catch (error) {
    console.error(`❌ Error validating ${testFile.name}:`, error);
  }

  console.log('='.repeat(80));
});

console.log('\n✅ Validator testing complete!\n');
