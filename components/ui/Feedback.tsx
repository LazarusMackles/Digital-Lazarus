
import React, { useState, useMemo } from 'react';
import { Icon } from '../icons/index';
// FIX: Removed unused and deprecated AnalysisMode import.
import type { AnalysisResult, AnalysisEvidence } from '../../types';
import { generateShareText } from '../../utils/reportUtils';
import { FEEDBACK_EMAIL } from '../../utils/constants';

interface FeedbackProps {
  result: AnalysisResult;
  evidence: AnalysisEvidence | null;
  timestamp: string | null;
  // FIX: Removed analysisModeUsed as it's a deprecated property.
  modelUsed: string | null;
}

export const Feedback: React.FC<FeedbackProps> = React.memo(({ result, evidence, timestamp, modelUsed }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'none' | 'positive' | 'report'>('none');

  const handlePositiveFeedback = () => {
    setFeedbackGiven('positive');
  };

  const mailtoLink = useMemo(() => {
    const reportTitle = encodeURIComponent('Sleuther Vanguard - Feedback');
    // FIX: Corrected arguments passed to generateShareText, removing the deprecated analysisModeUsed.
    const emailBody = encodeURIComponent(generateShareText(result, evidence, timestamp, true, modelUsed));
    const recipient = encodeURIComponent(`Sleuther Feedback <${FEEDBACK_EMAIL}>`);
    return `mailto:${recipient}?subject=${reportTitle}&body=${emailBody}`;
  }, [result, evidence, timestamp, modelUsed]);


  const renderContent = () => {
    if (feedbackGiven === 'positive') {
      return <p className="text-cyan-600 dark:text-cyan-400">Merci! Your feedback helps sharpen my deductive skills.</p>;
    }
    if (feedbackGiven === 'report') {
       return <p className="text-cyan-600 dark:text-cyan-400">Your email client is opening. Thank you for your feedback!</p>;
    }
    return (
      <>
        <p className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Did my analysis help solve your case?</p>
        <div className="p-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 inline-block">
            <div className="inline-flex justify-center items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 gap-1">
                <button 
                  onClick={handlePositiveFeedback} 
                  className="p-1.5 text-slate-500 hover:text-green-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-green-400 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" 
                  aria-label="Yes Helpful"
                  title="Yes Helpful"
                >
                  <Icon name="thumbs-up" className="w-4 h-4" />
                </button>
                <div className="border-l border-slate-300 dark:border-slate-600 h-4"></div>
                <a 
                  href={mailtoLink}
                  onClick={() => setFeedbackGiven('report')}
                  className="p-1.5 text-slate-500 hover:text-fuchsia-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-fuchsia-400 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 inline-block" 
                  aria-label="Send feedback or suggestion"
                  title="Send Feedback"
                >
                  <Icon name="chat-bubble-oval-left-ellipsis" className="w-4 h-4" />
                </a>
            </div>
        </div>
      </>
    );
  };

  return (
    <div className="text-sm text-center mt-4">
      {renderContent()}
    </div>
  );
});