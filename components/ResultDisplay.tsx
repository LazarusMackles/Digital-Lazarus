import React, { useState, useEffect } from 'react';
import { ShareIcon, ArrowPathIcon } from './icons';
import { ShareModal } from './ShareModal';
import { RadialProgress } from './RadialProgress';
import { Feedback } from './Feedback';
import { SleuthNote } from './SleuthNote';
import { HighlightsDisplay } from './HighlightsDisplay';
import { ModeButton } from './ModeButton';
import { useAnalysis } from '../context/AnalysisContext';

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const ActionButtons: React.FC<{ onShare: () => void; onNewAnalysis: () => void; isMobile: boolean }> = ({ onShare, onNewAnalysis, isMobile }) => (
    <>
      <button
        onClick={onShare}
        className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200 text-sm ${isMobile ? 'flex-1' : ''}`}
      >
        <ShareIcon className="w-4 h-4" />
        <span>Share Report</span>
      </button>
      <button 
        onClick={onNewAnalysis} 
        className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200 text-sm ${isMobile ? 'flex-1' : ''}`}
        aria-label="Begin New Analysis"
      >
        <ArrowPathIcon className="w-5 h-5" />
        <span>New Analysis</span>
      </button>
    </>
);


export const ResultDisplay: React.FC = () => {
  const { 
    analysisResult: result, 
    handleChallenge, 
    handleNewAnalysis, 
    isLoading,
    imageData
  } = useAnalysis();
    
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const prevIsLoading = usePrevious(isLoading);

  useEffect(() => {
    if (prevIsLoading && !isLoading && result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoading, prevIsLoading, result]);
  
  if (!result) return null;

  const hasHighlights = result.highlights && result.highlights.length > 0;
  const showChallengeSection = !result.isSecondOpinion;
  const hasImages = imageData && imageData.length > 0;

  const AnalysisContent = () => (
     <div className="flex flex-col items-center text-center animate-fade-in bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
        <RadialProgress progress={result.probability} />
        
        {result.isSecondOpinion && (
            <p className="mt-6 font-semibold text-cyan-600 dark:text-cyan-400">Second Opinion</p>
        )}
        <h2 className={`text-3xl font-bold ${result.isSecondOpinion ? 'mt-1' : 'mt-6'}`}>{result.verdict}</h2>

        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl">{result.explanation}</p>
        
        {hasHighlights && <HighlightsDisplay highlights={result.highlights!} />}
        
        {showChallengeSection && (
          <div className="mt-8 pt-6 border-t border-fuchsia-400/30 dark:border-fuchsia-500/30 w-full max-w-xl">
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Challenge the Verdict & Look Closer</h3>
                <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-1 mb-5">
                    My deduction may be flawed. Guide my re-analysis by choosing a forensic angle below.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <ModeButton
                        active={false}
                        onClick={() => handleChallenge('technical')}
                        title="Focus on Technical Clues"
                        description="Analyse pixels, lighting, and textures."
                        size="sm"
                        titleStyle="gradient"
                    />
                    <ModeButton
                        active={false}
                        onClick={() => handleChallenge('conceptual')}
                        title="Focus on Conceptual Clues"
                        description="Analyse context, subject, and overall 'feel'."
                        size="sm"
                        titleStyle="gradient"
                    />
                </div>
            </div>
          </div>
        )}
        
        {/* --- DESKTOP ACTION BAR --- */}
        <div className="hidden lg:flex flex-col items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl">
          <div className="flex items-center gap-4">
              <ActionButtons onShare={() => setIsShareModalOpen(true)} onNewAnalysis={handleNewAnalysis} isMobile={false} />
          </div>
          <Feedback />
        </div>

        <SleuthNote />
    </div>
  );

  const ImageEvidence = () => (
    <div className="lg:sticky lg:top-8 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
        <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-4 text-center">
            Submitted Evidence
        </h3>
        <div className="grid grid-cols-2 gap-4">
            {imageData!.map((src, index) => (
                <div key={index} className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img src={src} alt={`Uploaded preview ${index + 1}`} className="w-full h-full object-contain" />
                    {index === 0 && (
                        <div className="absolute top-1 left-1 bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded">PRIMARY</div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <>
      {isShareModalOpen && <ShareModal result={result} onClose={() => setIsShareModalOpen(false)} />}
      
      <div className={`relative ${hasImages ? 'lg:grid lg:grid-cols-5 lg:gap-8' : ''}`}>
        
        {hasImages && (
            <div className="lg:col-span-2 mb-8 lg:mb-0">
                <ImageEvidence />
            </div>
        )}
        
        <div className={hasImages ? 'lg:col-span-3' : 'w-full'}>
            <AnalysisContent />
        </div>
      </div>
      
      {/* --- MOBILE STICKY ACTION BAR --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 border-t border-slate-200 dark:border-slate-700 z-30">
          <div className="flex justify-center items-center gap-3 max-w-lg mx-auto">
             <ActionButtons onShare={() => setIsShareModalOpen(true)} onNewAnalysis={handleNewAnalysis} isMobile={true} />
          </div>
      </div>
      {/* Spacer to prevent content from being hidden behind the mobile bar */}
      <div className="h-24 lg:hidden"></div>
    </>
  );
};