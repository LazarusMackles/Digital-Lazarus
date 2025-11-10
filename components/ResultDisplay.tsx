
import React, { useState, useCallback } from 'react';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { VerdictPanel } from './result/VerdictPanel';
import { EvidencePresenter } from './result/EvidencePresenter';
import { Feedback } from './Feedback';
import { ResultActionButtons } from './result/ResultActionButtons';
import { ShareModal } from './ShareModal';
import { Card, HighlightsDisplay } from './ui';
import { ChallengeVerdict } from './ChallengeVerdict';
import { InteractiveTextDisplay } from './InteractiveTextDisplay';

export const ResultDisplay: React.FC = () => {
  const { state: resultState } = useResultState();
  const { state: uiState } = useUIState();
  const { handleNewAnalysis, performAnalysis } = useAnalysisWorkflow();
  const { analysisResult, analysisEvidence, analysisTimestamp, analysisModeUsed, modelUsed } = resultState;
  const { isStreaming, isReanalyzing } = uiState;
  const [showShareModal, setShowShareModal] = useState(false);

  const handleReanalyze = useCallback(() => {
    performAnalysis(true);
  }, [performAnalysis]);

  if (!analysisResult) {
    return null; // Or some fallback UI
  }

  const { probability, verdict, explanation, highlights, isSecondOpinion } = analysisResult;
  
  return (
    <>
      <Card className="flex flex-col items-center">
        
        {analysisEvidence?.type === 'file' && <EvidencePresenter evidence={analysisEvidence} />}
        
        <VerdictPanel 
            probability={probability} 
            verdict={verdict} 
            explanation={explanation} 
        />

        {analysisEvidence?.type === 'text' && analysisEvidence.content && (
           <div className="mt-8 w-full max-w-2xl bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
               <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Evidence Analyzed:</h3>
               <div className="text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto pr-2">
                    <InteractiveTextDisplay text={analysisEvidence.content} highlights={highlights || []} />
               </div>
           </div>
        )}
        
        {highlights && highlights.length > 0 && <HighlightsDisplay highlights={highlights} />}
        
        {(!isStreaming && !isReanalyzing) && (
            <>
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl" />
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                    <ChallengeVerdict 
                        onReanalyze={handleReanalyze} 
                        isSecondOpinion={isSecondOpinion || false} 
                    />
                    <Feedback result={analysisResult} evidence={analysisEvidence} timestamp={analysisTimestamp} analysisModeUsed={analysisModeUsed} modelUsed={modelUsed} />
                    <ResultActionButtons onNewAnalysis={handleNewAnalysis} onShowShareModal={() => setShowShareModal(true)} />
                </div>
            </>
        )}

      </Card>
      
      {showShareModal && (
        <ShareModal
          result={analysisResult}
          evidence={analysisEvidence}
          timestamp={analysisTimestamp}
          analysisModeUsed={analysisModeUsed}
          modelUsed={modelUsed}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
