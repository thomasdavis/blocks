import Link from 'next/link';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

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

function getBadgeColor(type: string): string {
  switch (type) {
    case 'major':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'minor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'patch':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export default function ChangelogPage() {
  const changesets = getChangesets();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Changelog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Latest updates and changes to Blocks packages
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {changesets.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No changesets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
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
                  <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent dark:from-slate-700" />
                )}

                <div className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-950" />
                  </div>

                  {/* Content */}
                  <div className="ml-16">
                    {/* Packages */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(changeset.packages).map(([pkg, type]) => (
                        <div key={pkg} className="flex items-center gap-2">
                          <code className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-mono">
                            {pkg}
                          </code>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeColor(type)}`}
                          >
                            {type}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Changeset content */}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
                        {changeset.content.split('\n\n').map((paragraph, i) => {
                          // Check if it's a code block
                          if (paragraph.startsWith('```')) {
                            const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)\n```/);
                            if (codeMatch) {
                              return (
                                <pre
                                  key={i}
                                  className="mt-4 first:mt-0 bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto"
                                >
                                  <code className="text-sm text-gray-100">
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
                              <ul key={i} className="mt-4 first:mt-0 space-y-2 list-disc list-inside">
                                {items.map((item, j) => (
                                  <li key={j} className="text-gray-700 dark:text-gray-300">
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
                                className="mt-6 first:mt-0 text-lg font-semibold text-gray-900 dark:text-white"
                              >
                                {paragraph.replace(/\*\*/g, '')}
                              </h3>
                            );
                          }

                          // Regular paragraph
                          return (
                            <p
                              key={i}
                              className="mt-4 first:mt-0 text-gray-700 dark:text-gray-300 leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                      Changeset: <code className="text-xs">{changeset.filename}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-800">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              About Changesets
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This project uses{' '}
              <a
                href="https://github.com/changesets/changesets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Changesets
              </a>{' '}
              for version management. Each changeset represents a set of changes ready to be
              released.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="https://github.com/anthropics/blocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
    </div>
  );
}
