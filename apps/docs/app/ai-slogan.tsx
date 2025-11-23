'use client';

import { useEffect, useState, useCallback } from 'react';

export function AISlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSlogan = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-slogan', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate slogan');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          // Parse streaming chunks (Vercel AI SDK format)
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const data = JSON.parse(line.slice(2));
                if (data && typeof data === 'string') {
                  fullText += data;
                }
              } catch (e) {
                // Skip parsing errors
              }
            }
          }
        }
      }

      setCurrentSlogan(fullText.trim());
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating slogan:', error);
      setCurrentSlogan('A negotiation layer for human-AI collaboration with semantic guardrails.');
      setIsGenerating(false);
    }
  }, []);

  // Type out the current slogan character by character
  useEffect(() => {
    if (!currentSlogan || isTyping) return;

    setIsTyping(true);
    setDisplayedText('');

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < currentSlogan.length) {
        setDisplayedText((prev) => prev + currentSlogan[index]);
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 40); // 40ms per character for smooth typing

    return () => clearInterval(typeInterval);
  }, [currentSlogan, isTyping]);

  // Generate new slogan after current one finishes typing + pause
  useEffect(() => {
    if (!isTyping && currentSlogan && !isGenerating) {
      // Wait 8 seconds after typing completes, then generate next
      const timer = setTimeout(() => {
        generateSlogan();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isTyping, currentSlogan, isGenerating, generateSlogan]);

  // Generate first slogan on mount
  useEffect(() => {
    generateSlogan();
  }, [generateSlogan]);

  return (
    <div className="relative min-h-[80px] flex items-center justify-center">
      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto text-center">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-6 ml-1 bg-blue-600 dark:bg-blue-400 animate-pulse" />
        )}
      </p>
      {isGenerating && !isTyping && (
        <div className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-slate-400">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Generating next pitch...</span>
        </div>
      )}
    </div>
  );
}
