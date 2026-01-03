import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Blocks',
    default: 'Blocks - AI-Powered Semantic Validation',
  },
  description:
    'Teach AI coding assistants your domain rules. Define entities, semantics, and philosophy in YAML. Get AI-powered validation at development time.',
  metadataBase: new URL('https://blocks.dev'),
  openGraph: {
    title: 'Blocks - AI-Powered Semantic Validation',
    description: 'Teach AI coding assistants your domain rules. Development-time validation with AI guardrails.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blocks - AI-Powered Semantic Validation',
    description: 'Teach AI coding assistants your domain rules. Development-time validation with AI guardrails.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
