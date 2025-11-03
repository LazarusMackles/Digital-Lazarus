import React from 'react';
import type { AnalysisResult } from '../types';

interface HighlightsDisplayProps {
  highlights: NonNullable<AnalysisResult['highlights']>;
}

export const HighlightsDisplay: React.FC<HighlightsDisplayProps> = React.memo(({ highlights }) => {
  return (
    <div className="mt-8 w-full max-w-xl text-left">
      <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
        Key Indicators Found
      </h3>
      <div className="space-y-4">
        {highlights.map((highlight, index) => (
          <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="border-l-4 border-cyan-500 pl-4">
              <p className="text-base font-semibold text-slate-800 dark:text-white">{highlight.text}</p>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{highlight.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
});