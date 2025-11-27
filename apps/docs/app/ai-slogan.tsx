'use client';

import { useEffect, useState, useRef } from 'react';

const STORAGE_KEY = 'blocks-ai-slogans';
const MAX_SLOGANS = 3;

export function AISlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlogans, setGeneratedSlogans] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasInitialized = useRef(false);

  // Load slogans from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('[AI Slogan] Loaded', parsed.length, 'slogans from storage');
          setGeneratedSlogans(parsed);
        }
      } catch (e) {
        console.error('[AI Slogan] Failed to parse stored slogans:', e);
      }
    }
  }, []);

  // Save slogans to localStorage when they change
  useEffect(() => {
    if (generatedSlogans.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedSlogans));
    }
  }, [generatedSlogans]);

  const generateSlogan = async () => {
    console.log('[AI Slogan] Generating new slogan...');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-slogan', {
        method: 'POST',
      });

      console.log('[AI Slogan] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AI Slogan] API error:', errorData);
        throw new Error(errorData.details || 'Failed to generate slogan');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;
        }
      }

      console.log('[AI Slogan] Generated text:', fullText.substring(0, 100) + '...');

      if (fullText.trim()) {
        // Remove surrounding quotes if present
        let cleanText = fullText.trim();
        if ((cleanText.startsWith('"') && cleanText.endsWith('"')) ||
            (cleanText.startsWith("'") && cleanText.endsWith("'"))) {
          cleanText = cleanText.slice(1, -1);
        }
        console.log('[AI Slogan] Clean text:', cleanText.substring(0, 100) + '...');

        // Add to generated slogans if we haven't reached max
        setGeneratedSlogans(prev => {
          if (prev.length < MAX_SLOGANS) {
            console.log('[AI Slogan] Adding to collection. Now have:', prev.length + 1, 'of', MAX_SLOGANS);
            return [...prev, cleanText];
          }
          return prev;
        });

        setCurrentSlogan(cleanText);
      } else {
        // Fallback if no text generated
        const fallback = 'A negotiation layer for human-AI collaboration with semantic guardrails.';
        setCurrentSlogan(fallback);
        setGeneratedSlogans(prev => prev.length < MAX_SLOGANS ? [...prev, fallback] : prev);
      }
      setIsGenerating(false);
    } catch (error) {
      console.error('[AI Slogan] Error:', error);
      // Use a nice fallback
      const fallbacks = [
        'A negotiation layer for human-AI collaboration with semantic guardrails.',
        'Multi-layer validation catches everything from type errors to missing ARIA labels.',
        'Both humans and AI write code freely—Blocks validates the result and reports drift.',
        'Your spec evolves with your code through drift detection and multi-layer validation.',
      ];
      const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setCurrentSlogan(fallback);
      setGeneratedSlogans(prev => prev.length < MAX_SLOGANS ? [...prev, fallback] : prev);
      setIsGenerating(false);
    }
  };

  const rotateToNextSlogan = () => {
    console.log('[AI Slogan] Rotating to next slogan. Current index:', currentIndex);
    const nextIndex = (currentIndex + 1) % generatedSlogans.length;
    setCurrentIndex(nextIndex);
    setCurrentSlogan(generatedSlogans[nextIndex]);
  };

  // Type out the current slogan character by character
  useEffect(() => {
    if (!currentSlogan) return;

    console.log('[AI Slogan] Starting to type out slogan:', currentSlogan.substring(0, 50) + '...');
    setIsTyping(true);

    let index = 0;

    // Start with empty string
    setDisplayedText('');

    if (currentSlogan.length === 1) {
      // Edge case: single character slogan
      setDisplayedText(currentSlogan);
      setIsTyping(false);
      return;
    }

    // Use a slight delay to ensure state updates properly
    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        setDisplayedText((prev) => {
          const nextIndex = prev.length;
          if (nextIndex < currentSlogan.length) {
            return currentSlogan.substring(0, nextIndex + 1);
          } else {
            console.log('[AI Slogan] Finished typing');
            clearInterval(typeInterval);
            setIsTyping(false);
            return prev;
          }
        });
      }, 40); // 40ms per character for smooth typing
    }, 10);

    return () => {
      console.log('[AI Slogan] Cleaning up typing interval');
      clearTimeout(startTimeout);
    };
  }, [currentSlogan]);

  // Generate new slogan or rotate after current one finishes typing + pause
  useEffect(() => {
    if (!isTyping && currentSlogan && !isGenerating) {
      console.log('[AI Slogan] Scheduling next action in 8 seconds...');
      // Wait 8 seconds after typing completes, then generate or rotate
      const timer = setTimeout(() => {
        if (generatedSlogans.length < MAX_SLOGANS) {
          console.log('[AI Slogan] Generating slogan', generatedSlogans.length + 1, 'of', MAX_SLOGANS);
          generateSlogan();
        } else {
          console.log('[AI Slogan] Max slogans reached, rotating to next');
          rotateToNextSlogan();
        }
      }, 8000);

      return () => {
        console.log('[AI Slogan] Clearing timeout');
        clearTimeout(timer);
      };
    }
  }, [isTyping, currentSlogan, isGenerating, generatedSlogans.length]);

  // Initialize on mount - load from storage or generate first slogan
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Check if we have stored slogans
      if (generatedSlogans.length > 0) {
        console.log('[AI Slogan] Loading first slogan from storage');
        setCurrentSlogan(generatedSlogans[0]);
      } else {
        console.log('[AI Slogan] No stored slogans - generating first one');
        generateSlogan();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedSlogans]);

  return (
    <div className="relative min-h-[80px] flex items-center justify-center">
      {isGenerating && !isTyping ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Generating next pitch...</span>
        </div>
      ) : (
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto text-center">
          {displayedText}
          {isTyping && displayedText.length > 0 && (
            <span className="inline-block w-0.5 h-6 ml-1 bg-blue-600 dark:bg-blue-400 animate-pulse" />
          )}
        </p>
      )}
    </div>
  );
}
