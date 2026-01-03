#!/usr/bin/env node
import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const client = new OpenAI();

async function generateImage(prompt, filename, size = '1024x1024') {
  console.log(`Generating ${filename}...`);

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
    });

    // Get the base64 image data
    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, 'base64');

    const filepath = path.join(assetsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Saved ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Failed to generate ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🎨 Generating Blocks branding assets...\n');

  // Logo prompt - modern developer tool aesthetic
  const logoPrompt = `Design a modern, minimal logo for "Blocks" - a developer tool for AI-powered code validation.
The logo should:
- Feature abstract geometric blocks/cubes in a clean arrangement
- Use a modern tech color palette (deep purple #7C3AED, electric blue #3B82F6, or teal #14B8A6)
- Be simple enough to work as an icon at small sizes
- Have a professional, developer-focused aesthetic
- NO text in the logo - just the icon/symbol
- Clean white or transparent background
- Flat design, no gradients or 3D effects
Style: Minimal, geometric, modern tech startup logo`;

  // Generate primary logo (square, good for npm/favicons)
  await generateImage(
    logoPrompt,
    'logo.png',
    '1024x1024'
  );

  // OG Image for social sharing (1200x630 aspect - we'll use 1536x1024 and note to crop)
  const ogPrompt = `Create a professional social media banner for "Blocks" - an AI-powered code validation framework.
Layout:
- Left side: Abstract geometric blocks/cubes logo in purple (#7C3AED) and blue (#3B82F6)
- Center/Right: The word "BLOCKS" in a clean, modern sans-serif font
- Subtitle below: "AI-Powered Semantic Validation"
- Dark background (#0F172A or similar dark tech aesthetic)
- Clean, professional developer tool marketing banner
- Subtle code/terminal aesthetic elements in the background
Style: Modern tech product banner, minimal, professional`;

  await generateImage(
    ogPrompt,
    'og-image.png',
    '1536x1024'
  );

  // GitHub social preview (1280x640 aspect - use 1536x1024)
  const githubPrompt = `Create a GitHub repository social preview image for "Blocks" - an open source AI validation framework.
Layout:
- Dark background (#0F172A)
- Large "BLOCKS" text in white/light color
- Geometric block logo elements
- Tagline: "Development-time validation with AI"
- Subtle terminal/code aesthetic
- Open source badge or indicator
- Professional, developer-focused
Style: GitHub repo preview, dark mode, developer aesthetic`;

  await generateImage(
    githubPrompt,
    'github-social.png',
    '1536x1024'
  );

  console.log('\n✨ All assets generated successfully!');
  console.log(`📁 Assets saved to: ${assetsDir}`);
}

main().catch(console.error);
