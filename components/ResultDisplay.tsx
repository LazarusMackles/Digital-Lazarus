
import React, { useState, useCallback } from 'react';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { VerdictPanel } from './result/VerdictPanel';
import { EvidencePresenter } from './result/EvidencePresenter';
import { ShareModal } from './ShareModal';
import { Card, HighlightsDisplay, Feedback, ResultActionButtons, ChallengeVerdict } from './ui';

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

  const handleShowShareModal = useCallback(() => {
    document.documentElement.scrollTo(0, 0);
    setShowShareModal(true);
  }, []);

  if (!analysisResult) {
    return null; // Or some fallback UI
  }

  const { probability, verdict, explanation, highlights, isSecondOpinion } = analysisResult;
  
  return (
    <>
      <Card className="flex flex-col items-center">
        
        {analysisEvidence?.type === 'file' && <EvidencePresenter evidence={analysisEvidence} probability={probability} />}
        
        <VerdictPanel 
            probability={probability} 
            verdict={verdict} 
            explanation={explanation} 
        />

        {analysisEvidence?.type === 'text' && analysisEvidence.content && (
           <div className="mt-8 w-full max-w-2xl bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
               <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Evidence Analysed:</h3>
               <div className="text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto pr-2">
                    <p className="whitespace-pre-wrap break-words">{analysisEvidence.content}</p>
               </div>
           </div>
        )}
        
        {highlights && highlights.length > 0 && <HighlightsDisplay highlights={highlights} />}
        
        {(!isStreaming && !isReanalyzing) && (
            <>
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl" />
                <div className="mt-8 flex w-full flex-col items-center gap-8">
                    <ChallengeVerdict 
                        onReanalyze={handleReanalyze} 
                        isSecondOpinion={isSecondOpinion || false}
                        analysisModeUsed={analysisModeUsed} 
                    />
                    <Feedback result={analysisResult} evidence={analysisEvidence} timestamp={analysisTimestamp} analysisModeUsed={analysisModeUsed} modelUsed={modelUsed} />
                    <ResultActionButtons onNewAnalysis={handleNewAnalysis} onShowShareModal={handleShowShareModal} />
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
