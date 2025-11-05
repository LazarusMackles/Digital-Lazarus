
import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { RadialProgress } from './RadialProgress';
import { HighlightsDisplay } from './HighlightsDisplay';
import { ChallengeVerdict } from './ChallengeVerdict';
import { Feedback } from './Feedback';
import { SleuthNote } from './SleuthNote';
import { ShareModal } from './ShareModal';
import { ImageLightbox } from './ImageLightbox';
import { ArrowPathIcon, EnvelopeIcon } from './icons/index';
import { InteractiveTextDisplay } from './InteractiveTextDisplay';
import type { AnalysisMode } from '../types';
import { EvidenceImage } from './EvidenceImage';

const CaseFileDetails: React.FC<{
  analysisModeUsed: AnalysisMode | null,
  timestamp: string | null
}> = ({ analysisModeUsed, timestamp }) => {
  if (!analysisModeUsed || !timestamp) return null;

  const getModelName = (mode: AnalysisMode) => {
    switch (mode) {
      case 'quick': return 'gemini-2.5-flash';
      case 'deep': return 'gemini-2.5-pro';
      default: return 'unknown';
    }
  };
  const modeText = analysisModeUsed === 'quick' ? 'Quick Scan' : 'Deep Analysis';

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
  const { 
    analysisResult, 
    handleChallenge, 
    handleNewAnalysis, 
    fileData,
    isReanalyzing,
    analysisTimestamp,
    analysisEvidence,
    analysisModeUsed
  } = useAnalysis();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!analysisResult) {
    return null;
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    // Per user feedback, return to the top of the page after closing the modal.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { probability, verdict, explanation, highlights, isSecondOpinion } = analysisResult;
  
  const imageData = fileData.length > 0 ? fileData.map(f => f.imageBase64!).filter(Boolean) : null;
  const isImageAnalysis = analysisEvidence?.type === 'file' && !!imageData && imageData.length > 0;
  const isTextAnalysis = (analysisEvidence?.type === 'text' || (analysisEvidence?.type === 'file' && (!imageData || imageData.length === 0))) && !!analysisEvidence.content;

  const verdictColorClass = () => {
    if (probability < 40) return 'text-teal-500 dark:text-teal-400';
    if (probability < 75) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-rose-500 dark:text-rose-400';
  };

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

      <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
        <div className="flex flex-col items-center">

          {isImageAnalysis && imageData && (
            <div className="mb-8 w-full max-w-xl text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
              <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                Evidence Presented
              </h3>
              <div className={
                imageData.length === 1 
                  ? "flex justify-center" 
                  : "grid grid-cols-2 sm:grid-cols-4 gap-4"
              }>
                {imageData.map((src, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors"
                    onClick={() => setSelectedImage(src)}
                  >
                    <EvidenceImage base64Src={src} alt={`Evidence ${index + 1}`} className="w-full h-full object-contain" />
                    {index === 0 && imageData.length > 1 && (
                      <div className="absolute top-1 left-1 z-10 bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded">PRIMARY</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTextAnalysis && analysisEvidence && (
            <div className="mb-8 w-full max-w-xl text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
              <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                Annotated Evidence (Text)
              </h3>
              <div className="max-h-64 overflow-y-auto p-3 bg-slate-200 dark:bg-slate-900 rounded font-mono text-sm text-slate-700 dark:text-slate-300">
                <InteractiveTextDisplay text={analysisEvidence.content} highlights={highlights || []} />
              </div>
            </div>
          )}
          
          {isSecondOpinion && !isReanalyzing && (
            <div className="mb-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 text-sm font-semibold px-4 py-2 rounded-full animate-fade-in">
              RE-EVALUATION COMPLETE
            </div>
          )}

          <RadialProgress progress={probability} />

          <h2 className={`mt-6 text-3xl font-extrabold text-center ${verdictColorClass()}`}>
            {verdict}
          </h2>
          
          <p className="mt-4 text-center max-w-xl text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {explanation}
          </p>

          {isImageAnalysis && highlights && highlights.length > 0 && (
            <HighlightsDisplay highlights={highlights} />
          )}

          {isImageAnalysis && !isSecondOpinion && !isReanalyzing && (
            <ChallengeVerdict onChallenge={handleChallenge} />
          )}
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleNewAnalysis}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Start New Analysis</span>
            </button>
             <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <EnvelopeIcon className="w-5 h-5" />
              <span>Email Report</span>
            </button>
          </div>
          
          <Feedback result={analysisResult} evidence={analysisEvidence} timestamp={analysisTimestamp} />

          <CaseFileDetails analysisModeUsed={analysisModeUsed} timestamp={analysisTimestamp} />

          <SleuthNote />
        </div>
      </div>
    </>
  );
};

export const ResultDisplay = React.memo(ResultDisplayComponent);
