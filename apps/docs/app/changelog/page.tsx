import Link from 'next/link';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Badge, type BadgeVariant } from '@blocksai/ui/badge';
import { Nav } from '../components/nav';
import { Footer } from '../components/footer';

export const metadata = {
  title: 'Changelog',
  description: 'Latest updates and changes to Blocks packages',
};

interface Changeset {
  filename: string;
  packages: Record<string, string>;
  content: string;
  date?: string;
}

function parseChangeset(filename: string, changesetDir: string): Changeset | null {
  try {
    const content = readFileSync(
      join(changesetDir, filename),
      'utf-8'
    );

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) return null;

    const [, frontmatter, body] = frontmatterMatch;

    // Parse packages from frontmatter
    const packages: Record<string, string> = {};
    frontmatter.split('\n').forEach((line) => {
      const match = line.match(/"([^"]+)":\s*(\w+)/);
      if (match) {
        packages[match[1]] = match[2];
      }
    });

    return {
      filename,
      packages,
      content: body.trim(),
      date: undefined, // Would need git log to get actual date
    };
  } catch (error) {
    console.error(`Error parsing changeset ${filename}:`, error);
    return null;
  }
}

function getChangesets(): Changeset[] {
  try {
    // In monorepo: try multiple paths to find .changeset directory
    const possiblePaths = [
      join(process.cwd(), '.changeset'),              // repo root during build
      join(process.cwd(), '..', '..', '.changeset'),  // when cwd is apps/docs
      join(__dirname, '..', '..', '..', '..', '.changeset'), // relative to this file
    ];

    let changesetDir: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        changesetDir = path;
        console.log('[Changelog] Found .changeset at:', path);
        break;
      }
    }

    if (!changesetDir) {
      console.error('[Changelog] Could not find .changeset directory. Tried:', possiblePaths);
      console.error('[Changelog] process.cwd():', process.cwd());
      console.error('[Changelog] __dirname:', __dirname);
      return [];
    }

    const files = readdirSync(changesetDir);
    console.log('[Changelog] Found files in .changeset:', files);

    const changesets = files
      .filter((f) => f.endsWith('.md') && f !== 'README.md')
      .map((f) => parseChangeset(f, changesetDir!))
      .filter((c): c is Changeset => c !== null)
      .reverse(); // Most recent first

    console.log('[Changelog] Parsed changesets:', changesets.length);
    return changesets;
  } catch (error) {
    console.error('[Changelog] Error reading changesets:', error);
    return [];
  }
}

function getBadgeVariant(type: string): BadgeVariant {
  switch (type) {
    case 'major':
    case 'minor':
    case 'patch':
      return type as BadgeVariant;
    default:
      return 'default';
  }
}

export default function ChangelogPage() {
  const changesets = getChangesets();

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-[#050805] text-[#1e281e] dark:text-[#a0b0a0] font-mono">
      {/* Scanline overlay effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.015]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />

      {/* Header */}
      <div className="border-b border-[#c8dcc8] dark:border-[#2a3a2a] bg-[#ebf5eb] dark:bg-[#080c08]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-[#5a7a5a] dark:border-[#5a8a5a] rotate-45" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#5a7a5a] dark:text-[#5a8a5a]">Version History</span>
              <div className="w-3 h-3 border border-[#5a7a5a] dark:border-[#5a8a5a] rotate-45" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#8cb43c] dark:text-[#cadd6a] mb-2 uppercase tracking-wide">
            Changelog
          </h1>
          <p className="text-[#506450] dark:text-[#6a8a6a]">
            Latest updates and changes to Blocks packages
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {changesets.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] border border-[#b0c8b0] dark:border-[#3a5a3a] mb-4">
              <svg
                className="w-8 h-8 text-[#5a7a5a] dark:text-[#5a8a5a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#3c783c] dark:text-[#8aca8a] mb-2">
              No changesets yet
            </h3>
            <p className="text-[#506450] dark:text-[#6a8a6a]">
              Changes will appear here when packages are updated.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {changesets.map((changeset, index) => (
              <div
                key={changeset.filename}
                className="relative"
              >
                {/* Timeline connector */}
                {index < changesets.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-[#b0c8b0] dark:from-[#3a5a3a] to-transparent" />
                )}

                <div className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 w-8 h-8 rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] border border-[#5a7a5a] dark:border-[#5a8a5a] flex items-center justify-center shadow-[0_0_10px_rgba(60,120,60,0.2)] dark:shadow-[0_0_10px_rgba(138,202,138,0.2)]">
                    <div className="w-2 h-2 rounded-sm bg-[#3c783c] dark:bg-[#8aca8a]" />
                  </div>

                  {/* Content */}
                  <div className="ml-16">
                    {/* Packages */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(changeset.packages).map(([pkg, type]) => (
                        <div key={pkg} className="flex items-center gap-2">
                          <code className="px-3 py-1 text-sm rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] text-[#3c783c] dark:text-[#8aca8a]">
                            {pkg}
                          </code>
                          <Badge variant={getBadgeVariant(type)} size="sm">
                            {type}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Changeset content */}
                    <div className="max-w-none">
                      <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm p-6 border border-[#c8dcc8] dark:border-[#2a3a2a]">
                        {changeset.content.split('\n\n').map((paragraph, i) => {
                          // Check if it's a code block
                          if (paragraph.startsWith('```')) {
                            const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)\n```/);
                            if (codeMatch) {
                              return (
                                <pre
                                  key={i}
                                  className="mt-4 first:mt-0 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-4 overflow-x-auto"
                                >
                                  <code className="text-sm text-[#4a6a4a] dark:text-[#8a9a8a]">
                                    {codeMatch[2]}
                                  </code>
                                </pre>
                              );
                            }
                          }

                          // Check if it's a list
                          if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                            const items = paragraph.split('\n').filter((line) => line.trim());
                            return (
                              <ul key={i} className="mt-4 first:mt-0 space-y-2 list-none">
                                {items.map((item, j) => (
                                  <li key={j} className="text-[#4a6a4a] dark:text-[#8a9a8a] flex items-start gap-2">
                                    <span className="text-[#5a7a5a] dark:text-[#5a8a5a]">-</span>
                                    {item.replace(/^[-*]\s+/, '')}
                                  </li>
                                ))}
                              </ul>
                            );
                          }

                          // Check if it's a heading
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <h3
                                key={i}
                                className="mt-6 first:mt-0 text-lg font-semibold text-[#8cb43c] dark:text-[#cadd6a] uppercase tracking-wide"
                              >
                                {paragraph.replace(/\*\*/g, '')}
                              </h3>
                            );
                          }

                          // Regular paragraph
                          return (
                            <p
                              key={i}
                              className="mt-4 first:mt-0 text-[#4a6a4a] dark:text-[#8a9a8a] leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 text-sm text-[#5a7a5a] dark:text-[#4a6a4a]">
                      Changeset: <code className="text-xs text-[#5a7a5a] dark:text-[#5a8a5a]">{changeset.filename}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#c8dcc8] dark:border-[#2a3a2a]">
          <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm p-6 border border-[#b0c8b0] dark:border-[#3a5a3a]">
            <h3 className="text-lg font-semibold text-[#8cb43c] dark:text-[#cadd6a] mb-2">
              About Changesets
            </h3>
            <p className="text-[#506450] dark:text-[#6a8a6a] mb-4">
              This project uses{' '}
              <a
                href="https://github.com/changesets/changesets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3c783c] dark:text-[#8aca8a] hover:text-[#8cb43c] dark:hover:text-[#cadd6a] transition-colors"
              >
                Changesets
              </a>{' '}
              for version management. Each changeset represents a set of changes ready to be
              released.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="https://github.com/thomasdavis/blocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#3c783c] dark:text-[#8aca8a] hover:text-[#8cb43c] dark:hover:text-[#cadd6a] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://www.npmjs.com/org/blocksai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#3c783c] dark:text-[#8aca8a] hover:text-[#8cb43c] dark:hover:text-[#cadd6a] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                </svg>
                NPM Packages
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
