import React, { useState } from 'react';
import { HighlightsDisplay } from './HighlightsDisplay';
import { ChallengeVerdict } from './ChallengeVerdict';
import { Feedback } from './Feedback';
import { SleuthNote } from './SleuthNote';
import { ShareModal } from './ShareModal';
import { ImageLightbox } from './ImageLightbox';
import type { AnalysisMode, ForensicMode } from '../types';
import { useResultState } from '../context/ResultStateContext';
import { useInputState } from '../context/InputStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { Card } from './ui';
import { MODELS } from '../utils/constants';

// New, decomposed components
import { EvidencePresenter } from './result/EvidencePresenter';
import { VerdictPanel } from './result/VerdictPanel';
import { ResultActionButtons } from './result/ResultActionButtons';

const CaseFileDetails: React.FC<{
  analysisModeUsed: AnalysisMode | null,
  timestamp: string | null
}> = ({ analysisModeUsed, timestamp }) => {
  if (!analysisModeUsed || !timestamp) return null;

  const getModelName = (mode: AnalysisMode) => {
    switch (mode) {
      case 'quick': return MODELS.QUICK;
      case 'deep': return MODELS.DEEP;
      default: return 'unknown';
    }
  };
  const modeText = analysisModeUsed === 'quick' ? 'Quick Scan' : 'Deep Dive';

  return (
    <div className="mt-8 w-max max-w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg py-4 px-6 text-sm">
      <h4 className="font-semibold text-center text-cyan-700 dark:text-cyan-400 mb-3">Case File Details</h4>
      <dl className="border-t border-slate-200 dark:border-slate-700 pt-3 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-left">
        <dt className="font-medium text-slate-500 dark:text-slate-400">Analysis Method</dt>
        <dd className="text-slate-800 dark:text-slate-200">{modeText} ({getModelName(analysisModeUsed)})</dd>
        
        <dt className="font-medium text-slate-500 dark:text-slate-400">Date of Analysis</dt>
        <dd className="text-slate-800 dark:text-slate-200">{timestamp}</dd>
      </dl>
    </div>
  );
};


const ResultDisplayComponent: React.FC = () => {
  const { state: resultState } = useResultState();
  const { state: inputState } = useInputState();
  const { handleChallenge, handleNewAnalysis } = useAnalysisWorkflow();
  
  const { 
    analysisResult, 
    isReanalyzing,
    analysisTimestamp,
    analysisEvidence,
  } = resultState;
  const { fileData } = inputState;
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!analysisResult) {
    return null;
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { probability, verdict, explanation, highlights, isSecondOpinion } = analysisResult;
  
  const imageData = fileData.length > 0 ? fileData.map(f => f.imageBase64!).filter(Boolean) : null;
  const isImageAnalysis = analysisEvidence?.type === 'file' && !!imageData && imageData.length > 0;

  return (
    <>
      {showShareModal && (
        <ShareModal 
          result={analysisResult} 
          onClose={handleCloseShareModal}
          evidence={analysisEvidence}
          timestamp={analysisTimestamp}
        />
      )}
      {selectedImage && <ImageLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}

      <Card>
        <div className="flex flex-col items-center">

          <EvidencePresenter
            evidence={analysisEvidence}
            imageData={imageData}
            highlights={highlights}
            onImageClick={setSelectedImage}
          />
          
          {isSecondOpinion && !isReanalyzing && (
            <div className="mb-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 text-sm font-semibold px-4 py-2 rounded-full animate-fade-in">
              RE-EVALUATION COMPLETE
            </div>
          )}

          <VerdictPanel 
            probability={probability}
            verdict={verdict}
            explanation={explanation}
          />

          {isImageAnalysis && highlights && highlights.length > 0 && (
            <HighlightsDisplay highlights={highlights} />
          )}

          {!isSecondOpinion && !isReanalyzing && (
            <ChallengeVerdict onChallenge={handleChallenge} isImageAnalysis={isImageAnalysis} />
          )}
          
          <ResultActionButtons
            onNewAnalysis={handleNewAnalysis}
            onShowShareModal={() => setShowShareModal(true)}
          />
          
          <Feedback result={analysisResult} evidence={analysisEvidence} timestamp={analysisTimestamp} />

          <CaseFileDetails analysisModeUsed={resultState.analysisModeUsed} timestamp={analysisTimestamp} />

          <SleuthNote />
        </div>
      </Card>
    </>
  );
};

export const ResultDisplay = React.memo(ResultDisplayComponent);