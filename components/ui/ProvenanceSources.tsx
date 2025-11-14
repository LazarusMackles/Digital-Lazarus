import React from 'react';
import { Icon } from '../icons/index';

interface ProvenanceSourcesProps {
  groundingMetadata: any;
}

export const ProvenanceSources: React.FC<ProvenanceSourcesProps> = React.memo(({ groundingMetadata }) => {
  const sources = groundingMetadata?.groundingChunks;

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 w-full max-w-xl text-left">
      <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
        Sources Found Online
      </h3>
      <div className="space-y-3">
        {sources.map((source: any, index: number) => {
          if (source.web && source.web.uri) {
            return (
              <a 
                key={index} 
                href={source.web.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                    <Icon name="link" className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{source.web.title || 'Untitled Source'}</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 truncate">{source.web.uri}</p>
                    </div>
                </div>
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
});
