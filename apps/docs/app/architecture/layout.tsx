import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'How Blocks validates your code at development time. Spec → Validate → Ship.',
  openGraph: {
    title: 'Architecture | Blocks',
    description: 'How Blocks validates your code at development time. Spec → Validate → Ship.',
    images: [
      {
        url: '/api/og/architecture',
        width: 1200,
        height: 630,
        alt: 'Blocks Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architecture | Blocks',
    description: 'How Blocks validates your code at development time.',
    images: ['/api/og/architecture'],
  },
};

export default function ArchitectureLayout({ children }: { children: ReactNode }) {
  return children;
}
