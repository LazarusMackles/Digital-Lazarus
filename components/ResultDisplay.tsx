
import React, { useState, useCallback } from 'react';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { VerdictPanel } from './result/VerdictPanel';
import { EvidencePresenter } from './result/EvidencePresenter';
import { ShareModal } from './ShareModal';
import { Card, HighlightsDisplay, Feedback, ResultActionButtons, ChallengeVerdict, ProvenanceSources } from './ui';

export const ResultDisplay: React.FC = () => {
  const { state: resultState } = useResultState();
  const { state: uiState } = useUIState();
  const { handleNewAnalysis, performAnalysis } = useAnalysisWorkflow();
  const { analysisResult, analysisEvidence, analysisTimestamp, modelUsed, analysisAngleUsed } = resultState;
  const { isStreaming, isReanalyzing } = uiState;
  const [showShareModal, setShowShareModal] = useState(false);

  const handleReanalyze = useCallback(() => {
    performAnalysis(true);
  }, [performAnalysis]);

  const handleShowShareModal = useCallback(() => {
    document.documentElement.scrollTo(0, 0);
    setShowShareModal(true);
  }, []);

  if (!analysisResult || !analysisEvidence) {
    return null; 
  }

  const { probability, verdict, explanation, highlights, groundingMetadata, isSecondOpinion } = analysisResult;
  
  return (
    <>
      <Card className="flex flex-col items-center">
        
        <EvidencePresenter 
            evidence={analysisEvidence} 
            probability={probability} 
            analysisAngleUsed={analysisAngleUsed} 
        />
        
        <VerdictPanel 
            probability={probability} 
            verdict={verdict} 
            explanation={explanation} 
            analysisAngleUsed={analysisAngleUsed}
        />
        
        {highlights && highlights.length > 0 && <HighlightsDisplay highlights={highlights} />}
        
        {groundingMetadata && <ProvenanceSources groundingMetadata={groundingMetadata} />}

        {(!isStreaming && !isReanalyzing) && (
            <>
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl" />
                <div className="mt-8 flex w-full flex-col items-center gap-8">
                    <ChallengeVerdict 
                        onReanalyze={handleReanalyze} 
                        isSecondOpinion={isSecondOpinion || false}
                    />
                    {/* FIX: Passed the missing analysisAngleUsed prop to the Feedback component. */}
                    <Feedback result={analysisResult} evidence={analysisEvidence} timestamp={analysisTimestamp} modelUsed={modelUsed} analysisAngleUsed={analysisAngleUsed} />
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
          modelUsed={modelUsed}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
