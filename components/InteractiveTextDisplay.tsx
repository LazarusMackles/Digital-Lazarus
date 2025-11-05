import React from 'react';
import type { AnalysisResult } from '../types';

interface InteractiveTextDisplayProps {
  text: string;
  highlights: NonNullable<AnalysisResult['highlights']>;
}

// A component for the highlighted span with a tooltip
const HighlightedSegment: React.FC<{ text: string; reason: string }> = ({ text, reason }) => {
  return (
    <span className="relative group bg-yellow-200/50 dark:bg-yellow-700/30 rounded-sm px-1 py-0.5 cursor-help">
      {text}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {reason}
        <svg className="absolute text-slate-800 dark:text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </span>
    </span>
  );
};

// Helper function to escape special characters for use in a RegExp
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const InteractiveTextDisplay: React.FC<InteractiveTextDisplayProps> = React.memo(({ text, highlights }) => {
  if (!highlights || highlights.length === 0) {
    return (
        <p className="whitespace-pre-wrap break-words">
            {text}
        </p>
    );
  }

  // Use a map to store reasons for unique highlight texts.
  // This prevents issues if the model returns highlights for the same text multiple times.
  const highlightMap = new Map<string, string>();
  highlights.forEach(h => {
    if (h.text && !highlightMap.has(h.text)) {
        highlightMap.set(h.text, h.reason);
    }
  });

  if (highlightMap.size === 0) {
      return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }

  // Create a regex that finds any of the highlight texts.
  const regex = new RegExp(`(${[...highlightMap.keys()].map(escapeRegExp).join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {parts.map((part, index) => {
        const reason = highlightMap.get(part);
        if (reason) {
          return <HighlightedSegment key={index} text={part} reason={reason} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
});
