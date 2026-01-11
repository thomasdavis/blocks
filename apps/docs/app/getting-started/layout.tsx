import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Set up Blocks validation in minutes. Create a feedback loop between your domain spec and AI agents.',
  openGraph: {
    title: 'Get Started | Blocks',
    description: 'Set up Blocks validation in minutes. Create a feedback loop between your domain spec and AI agents.',
    images: [
      {
        url: '/api/og/getting-started',
        width: 1200,
        height: 630,
        alt: 'Get Started with Blocks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started | Blocks',
    description: 'Set up Blocks validation in minutes.',
    images: ['/api/og/getting-started'],
  },
};

export default function GettingStartedLayout({ children }: { children: ReactNode }) {
  return children;
}
