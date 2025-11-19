import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded" />
            <span className="font-bold">Blocks</span>
          </div>
        ),
      }}
      sidebar={{
        banner: (
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-white text-sm">
            <p className="font-medium">Blocks v1.0.0</p>
            <p className="text-blue-100 text-xs mt-1">
              Domain-driven validation framework
            </p>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
