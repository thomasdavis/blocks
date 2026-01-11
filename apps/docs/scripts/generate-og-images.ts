import OpenAI from 'openai';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { buildPrompt } from '../src/lib/og/prompt-builder';
import type { PageContent, PageType } from '../src/lib/og/types';

const PAGES: PageContent[] = [
  {
    pageType: 'home',
    title: 'Blocks',
    description: 'Guardrails for agentic code generation. Spec → Validate → Ship.',
  },
  {
    pageType: 'getting-started',
    title: 'Get Started',
    description: 'Set up Blocks validation in minutes.',
  },
  {
    pageType: 'architecture',
    title: 'Architecture',
    description: 'How Blocks validates your code at development time.',
  },
  {
    pageType: 'docs',
    title: 'Documentation',
    description: 'Complete guide to configuring and using Blocks.',
  },
  {
    pageType: 'changelog',
    title: 'Changelog',
    description: 'Latest updates and releases.',
  },
  {
    pageType: 'devtools',
    title: 'Devtools',
    description: 'Browser devtools for debugging Blocks validation.',
  },
  {
    pageType: 'examples',
    title: 'Examples',
    description: 'Real-world Blocks configurations in action.',
  },
];

const OUTPUT_DIR = join(process.cwd(), 'public', 'og');
const CACHE_DAYS = 30;

async function shouldRegenerate(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays > CACHE_DAYS;
  } catch {
    return true; // File doesn't exist
  }
}

async function generateImage(
  openai: OpenAI,
  page: PageContent
): Promise<Buffer | null> {
  const prompt = buildPrompt(page);

  console.log(`  Generating image for: ${page.pageType}`);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      console.error(`  No image URL returned for ${page.pageType}`);
      return null;
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`  Failed to fetch image for ${page.pageType}`);
      return null;
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`  Error generating ${page.pageType}:`, error);
    return null;
  }
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('Generating OG images for Blocks...\n');

  for (const page of PAGES) {
    const outputPath = join(OUTPUT_DIR, `${page.pageType}.png`);

    // Check if regeneration is needed
    const needsRegeneration = await shouldRegenerate(outputPath);
    if (!needsRegeneration) {
      console.log(`  Skipping ${page.pageType} (cached)`);
      continue;
    }

    const imageBuffer = await generateImage(openai, page);
    if (imageBuffer) {
      await writeFile(outputPath, imageBuffer);
      console.log(`  Saved: ${outputPath}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\nDone!');
}

main().catch(console.error);
