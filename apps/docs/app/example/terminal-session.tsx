'use client';

import { useState, useEffect, useRef } from 'react';

// Types for the session script
type LineType =
  | 'section-label' // Section label like "User", "Claude Code", "blocks run"
  | 'user-input' // User's message to Claude Code
  | 'claude-text' // Claude Code's response text
  | 'claude-action' // Claude Code's action (file write, thinking, etc.)
  | 'cli-command' // The command being run
  | 'cli-output' // CLI output line
  | 'cli-success' // Green success message
  | 'cli-error' // Red error message
  | 'cli-info' // Info/detail message
  | 'blank'; // Empty line

interface ScriptLine {
  type: LineType;
  content: string;
  delay?: number; // Delay before showing this line (ms)
  typeSpeed?: number; // Typing speed for this line (ms per char)
}

// The session script - a realistic Claude Code + Blocks interaction
const sessionScript: ScriptLine[] = [
  // === USER REQUEST ===
  { type: 'section-label', content: 'User', delay: 300 },
  { type: 'user-input', content: 'Add a new scorer module for the job recommendation engine that calculates location proximity score', delay: 400, typeSpeed: 25 },
  { type: 'blank', content: '', delay: 600 },

  // === CLAUDE CODE RESPONDS ===
  { type: 'section-label', content: 'Claude Code', delay: 300 },
  { type: 'claude-text', content: "I'll create a location scorer that calculates distance-based similarity.", delay: 400, typeSpeed: 15 },
  { type: 'blank', content: '', delay: 300 },
  { type: 'claude-action', content: 'Created: blocks/scorer-location/index.ts', delay: 300 },
  { type: 'claude-action', content: 'Created: blocks/scorer-location/scorer.ts', delay: 200 },
  { type: 'blank', content: '', delay: 600 },

  // === CLAUDE CODE RUNS VALIDATION ===
  { type: 'section-label', content: 'Claude Code runs validation', delay: 300 },
  { type: 'cli-command', content: '$ blocks run scorer.location', delay: 400 },
  { type: 'blank', content: '', delay: 500 },

  // === BLOCKS CLI OUTPUT (first run - with errors) ===
  { type: 'cli-success', content: '✓ schema.io passed', delay: 250 },
  { type: 'cli-error', content: '✗ domain.validation failed', delay: 350 },
  { type: 'cli-info', content: '  • Score output range is 0-100, should be normalized 0-1', delay: 150 },
  { type: 'cli-info', content: '  • Missing handling for remote jobs (should return 1.0)', delay: 150 },
  { type: 'cli-info', content: '  • Distance calculation doesn\'t account for "willing_to_relocate" flag', delay: 150 },
  { type: 'blank', content: '', delay: 700 },

  // === CLAUDE CODE ANALYZES AND FIXES ===
  { type: 'section-label', content: 'Claude Code', delay: 300 },
  { type: 'claude-text', content: 'The domain validator caught 3 issues with my scoring logic:', delay: 400, typeSpeed: 18 },
  { type: 'blank', content: '', delay: 250 },
  { type: 'claude-action', content: '1. Normalized score output to 0-1 range', delay: 250 },
  { type: 'claude-action', content: '2. Added remote job check → returns 1.0', delay: 200 },
  { type: 'claude-action', content: '3. Added relocation flag handling → boosts score by 0.3', delay: 200 },
  { type: 'blank', content: '', delay: 300 },
  { type: 'claude-action', content: 'Updated: blocks/scorer-location/scorer.ts', delay: 300 },
  { type: 'blank', content: '', delay: 600 },

  // === CLAUDE CODE RUNS VALIDATION AGAIN ===
  { type: 'section-label', content: 'Claude Code runs validation', delay: 300 },
  { type: 'cli-command', content: '$ blocks run scorer.location', delay: 400 },
  { type: 'blank', content: '', delay: 500 },

  // === BLOCKS CLI OUTPUT (second run - success) ===
  { type: 'cli-success', content: '✓ schema.io passed', delay: 200 },
  { type: 'cli-success', content: '✓ shape.exports.ts passed', delay: 150 },
  { type: 'cli-success', content: '✓ domain.validation passed', delay: 300 },
  { type: 'blank', content: '', delay: 200 },
  { type: 'cli-success', content: 'All validators passed', delay: 350 },
  { type: 'blank', content: '', delay: 700 },

  // === CLAUDE CODE CONFIRMS ===
  { type: 'section-label', content: 'Claude Code', delay: 300 },
  { type: 'claude-text', content: 'Done. The location scorer is ready and integrates with the other scoring modules.', delay: 400, typeSpeed: 16 },
  { type: 'blank', content: '', delay: 1000 },
];

// Line component with appropriate styling
function TerminalLine({ line, isTyping, displayedContent }: {
  line: ScriptLine;
  isTyping: boolean;
  displayedContent: string;
}) {
  const content = isTyping ? displayedContent : line.content;

  if (line.type === 'blank') {
    return <div className="h-4" />;
  }

  // Section labels get special treatment - they look like the homepage terminal
  if (line.type === 'section-label') {
    return (
      <div className="text-[#506450] dark:text-[#5a8a5a] text-xs uppercase tracking-wider mb-2 mt-4 first:mt-0">
        {content}
      </div>
    );
  }

  // CLI command gets its own styled block
  if (line.type === 'cli-command') {
    return (
      <div className="bg-[#ebf5eb] dark:bg-[#080c08] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm px-3 py-2 font-mono text-sm text-[#708070] dark:text-[#6a8a6a]">
        {content}
      </div>
    );
  }

  const getLineClasses = () => {
    switch (line.type) {
      case 'user-input':
        return 'text-[#1e281e] dark:text-[#c0d0c0]';
      case 'claude-text':
        return 'text-[#1e281e] dark:text-[#a0b0a0]';
      case 'claude-action':
        return 'text-[#3c783c] dark:text-[#8aca8a] text-sm';
      case 'cli-success':
        return 'text-[#2a7a2a] dark:text-[#4aaa4a]';
      case 'cli-error':
        return 'text-[#a85a2a] dark:text-[#aa6a4a]';
      case 'cli-info':
        return 'text-[#506450] dark:text-[#8a9a8a]';
      case 'cli-output':
        return 'text-[#506450] dark:text-[#8a9a8a]';
      default:
        return 'text-[#506450] dark:text-[#8a9a8a]';
    }
  };

  const getPrefix = () => {
    switch (line.type) {
      case 'claude-action':
        if (content.startsWith('Created:') || content.startsWith('Updated:')) {
          return <span className="text-[#2a7a2a] dark:text-[#4aaa4a] mr-2">+</span>;
        }
        if (content.match(/^\d\./)) {
          return <span className="text-[#3c783c] dark:text-[#8aca8a] mr-2">~</span>;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={`font-mono text-sm leading-relaxed ${getLineClasses()}`}>
      {getPrefix()}
      <span>{content}</span>
      {isTyping && <span className="animate-pulse ml-0.5">▋</span>}
    </div>
  );
}

export function TerminalSession() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number>(0);
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines, displayedContent]);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying || visibleLines >= sessionScript.length) return;

    const currentLine = sessionScript[visibleLines];
    if (!currentLine) return;
    const delay = currentLine.delay || 100;

    // If this line needs typing animation
    if (currentLine.typeSpeed && currentLine.content.length > 0 && !isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setCurrentTypingIndex(0);
        setDisplayedContent('');
      }, delay);
      return () => clearTimeout(timer);
    }

    // If we're typing, handle character by character
    if (isTyping) {
      if (currentTypingIndex < currentLine.content.length) {
        const timer = setTimeout(() => {
          setDisplayedContent(prev => prev + currentLine.content[currentTypingIndex]);
          setCurrentTypingIndex(prev => prev + 1);
        }, currentLine.typeSpeed || 30);
        return () => clearTimeout(timer);
      } else {
        // Typing complete, move to next line
        setIsTyping(false);
        setVisibleLines(prev => prev + 1);
        return;
      }
    }

    // No typing animation, just show the line after delay
    const timer = setTimeout(() => {
      setVisibleLines(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, visibleLines, isTyping, currentTypingIndex]);

  const startSession = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setVisibleLines(0);
    setDisplayedContent('');
    setCurrentTypingIndex(0);
    setIsTyping(false);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setVisibleLines(0);
    setDisplayedContent('');
    setCurrentTypingIndex(0);
    setIsTyping(false);
    setHasStarted(false);
  };

  const isComplete = visibleLines >= sessionScript.length && !isTyping;

  return (
    <div className="relative">
      {/* Terminal window */}
      <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#a0c0a0] dark:border-[#3a5a3a]">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#ebf5eb] dark:bg-[#080c08] border-b border-[#c8dcc8] dark:border-[#2a3a2a]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#c44]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#c84]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#4a4]" />
          </div>
          <div className="text-[#506450] dark:text-[#5a8a5a] text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            AI Agent Session
          </div>
          <div className="w-16" /> {/* Spacer for symmetry */}
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#3a5a3a #0a120a',
          }}
        >
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="w-16 h-16 mx-auto rounded-sm bg-[#ebf5eb] dark:bg-[#080c08] border-2 border-[#a0c0a0] dark:border-[#3a5a3a] flex items-center justify-center mb-6">
                <div className="text-[#8cb43c] dark:text-[#cadd6a] text-2xl font-bold">B</div>
              </div>
              <h3 className="text-xl font-bold text-[#3c783c] dark:text-[#8aca8a] mb-3">AI Agent + Blocks Example</h3>
              <p className="text-[#506450] dark:text-[#6a8a6a] mb-8 max-w-md">
                Watch an AI agent use Blocks to validate code against domain rules,
                catch issues, and fix them automatically.
              </p>
              <button
                onClick={startSession}
                className="px-8 py-3 bg-[#3c783c] hover:bg-[#4a8a4a] dark:bg-[#3a5a3a] dark:hover:bg-[#4a6a4a] text-white font-semibold rounded-sm transition-all border border-[#2a5a2a] dark:border-[#5a8a5a]"
              >
                ▶ Start Example
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {sessionScript.slice(0, visibleLines).map((line, index) => (
                <TerminalLine
                  key={index}
                  line={line}
                  isTyping={false}
                  displayedContent={line.content}
                />
              ))}
              {isTyping && visibleLines < sessionScript.length && sessionScript[visibleLines] && (
                <TerminalLine
                  line={sessionScript[visibleLines]!}
                  isTyping={true}
                  displayedContent={displayedContent}
                />
              )}
              {isComplete && (
                <div className="mt-8 pt-6 border-t border-[#c8dcc8] dark:border-[#2a3a2a]">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={resetSession}
                      className="px-6 py-2 bg-[#ebf5eb] dark:bg-[#080c08] hover:bg-[#dceadc] dark:hover:bg-[#0a120a] text-[#506450] dark:text-[#8a9a8a] font-mono text-sm rounded-sm transition-colors border border-[#c8dcc8] dark:border-[#2a3a2a]"
                    >
                      ↺ Replay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
