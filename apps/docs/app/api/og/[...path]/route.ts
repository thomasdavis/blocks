import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');

  // Convert path to filename
  // e.g., "home" -> "home.png"
  // e.g., "getting-started" -> "getting-started.png"
  const filename = `${imagePath}.png`;
  const filePath = join(process.cwd(), 'public', 'og', filename);

  try {
    const imageBuffer = await readFile(filePath);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Try fallback image
    try {
      const fallbackPath = join(process.cwd(), 'public', 'og', 'home.png');
      const fallbackBuffer = await readFile(fallbackPath);

      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
        },
      });
    } catch {
      return new NextResponse('Image not found', { status: 404 });
    }
  }
}
