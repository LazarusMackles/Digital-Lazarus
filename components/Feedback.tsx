
import React, { useState, useMemo } from 'react';
import { Icon } from './icons/index';
// FIX: Added AnalysisAngle to types import
import type { AnalysisResult, AnalysisEvidence, AnalysisAngle } from '../types';
import { generateShareText } from '../utils/reportUtils';
import { FEEDBACK_EMAIL } from '../utils/constants';

interface FeedbackProps {
  result: AnalysisResult;
  evidence: AnalysisEvidence | null;
  timestamp: string | null;
  modelUsed: string | null;
  // FIX: Added missing analysisAngleUsed prop
  analysisAngleUsed: AnalysisAngle | null;
}

// FIX: Added analysisAngleUsed to props destructuring
export const Feedback: React.FC<FeedbackProps> = React.memo(({ result, evidence, timestamp, modelUsed, analysisAngleUsed }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'none' | 'positive' | 'report'>('none');

  const handlePositiveFeedback = () => {
    setFeedbackGiven('positive');
  };

  const mailtoLink = useMemo(() => {
    const reportTitle = encodeURIComponent('Sleuther Vanguard - Case Feedback');
    // FIX: Passed analysisAngleUsed to generateShareText to satisfy its signature.
    const emailBody = encodeURIComponent(generateShareText(result, evidence, timestamp, true, modelUsed, analysisAngleUsed));
    const recipient = encodeURIComponent(`Sleuther Feedback <${FEEDBACK_EMAIL}>`);
    return `mailto:${recipient}?subject=${reportTitle}&body=${emailBody}`;
    // FIX: Added analysisAngleUsed to dependency array.
  }, [result, evidence, timestamp, modelUsed, analysisAngleUsed]);


  const renderContent = () => {
    if (feedbackGiven === 'positive') {
      return <p className="text-cyan-600 dark:text-cyan-400">Merci! Your feedback helps sharpen my deductive skills.</p>;
    }
    if (feedbackGiven === 'report') {
       return <p className="text-cyan-600 dark:text-cyan-400">Your email client is opening. Thank you for your feedback!</p>;
    }
    return (
      <>
        <p className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Did this analysis solve your case?</p>
        <div className="inline-flex justify-center items-center border border-slate-300 dark:border-slate-600 rounded-full p-1 gap-1">
            <button 
              onClick={handlePositiveFeedback} 
              className="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-green-400 dark:hover:bg-slate-700 rounded-full transition-all duration-200" 
              aria-label="Yes, case solved!"
              title="Yes, case solved!"
            >
              <Icon name="check" className="w-5 h-5" />
            </button>
            <div className="border-l border-slate-300 dark:border-slate-600 h-5"></div>
            <a 
              href={mailtoLink}
              onClick={() => setFeedbackGiven('report')}
              className="p-2 text-slate-500 hover:text-fuchsia-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-fuchsia-400 dark:hover:bg-slate-700 rounded-full transition-all duration-200 inline-block" 
              aria-label="No, I need more evidence (Send Report)"
              title="No, I need more evidence (Send Report)"
            >
              <Icon name="envelope" className="w-5 h-5" />
            </a>
        </div>
      </>
    );
  };

  return (
    <div className="text-sm text-center">
      {renderContent()}
    </div>
  );
});
