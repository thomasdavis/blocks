import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry | Blocks",
  description:
    "Official Blocks registry — shared domain specs, entities, semantics, and example blocks hosted on Turso",
  openGraph: {
    title: "Registry | Blocks",
    description: "Browse the official Blocks registry of shared domain specifications",
    images: [{ url: "/api/og/registry", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Registry | Blocks",
    images: ["/api/og/registry"],
  },
};

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
