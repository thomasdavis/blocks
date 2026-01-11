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
    default: 'Blocks - Guardrails for Agentic Code Generation',
  },
  description:
    'Create a feedback loop between your domain spec and AI agents. Define rules, validate semantically, ship with confidence.',
  metadataBase: new URL('https://blocksai.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blocksai.dev',
    siteName: 'Blocks',
    title: 'Blocks - Guardrails for Agentic Code Generation',
    description: 'Create a feedback loop between your domain spec and AI agents. Spec → Validate → Ship.',
    images: [
      {
        url: '/api/og/home',
        width: 1200,
        height: 630,
        alt: 'Blocks - Guardrails for Agentic Code Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blocks - Guardrails for Agentic Code Generation',
    description: 'Create a feedback loop between your domain spec and AI agents. Spec → Validate → Ship.',
    images: ['/api/og/home'],
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
