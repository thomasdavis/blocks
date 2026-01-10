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
            <div className="w-6 h-6 bg-[#0a120a] border border-[#5a8a5a] rounded-sm flex items-center justify-center shadow-[0_0_8px_rgba(138,202,138,0.2)]">
              <span className="text-[#cadd6a] text-xs font-bold">B</span>
            </div>
            <span className="font-mono font-bold text-[#8aca8a]">Blocks</span>
          </div>
        ),
        links: [
          {
            text: 'Changelog',
            url: '/changelog',
          },
          {
            text: 'GitHub',
            url: 'https://github.com/anthropics/blocks',
            external: true,
          },
        ],
      }}
      sidebar={{
        banner: (
          <div className="rounded-sm bg-[#0a120a] border border-[#3a5a3a] p-3 text-[#8aca8a] text-sm font-mono">
            <p className="font-medium text-[#cadd6a]">Blocks v1.0.0</p>
            <p className="text-[#5a8a5a] text-xs mt-1">
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
