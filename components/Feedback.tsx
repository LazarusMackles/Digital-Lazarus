import React, { useState, useMemo } from 'react';
import { ThumbsUpIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import type { AnalysisResult, AnalysisEvidence } from '../types';

interface FeedbackProps {
  result: AnalysisResult;
  evidence: AnalysisEvidence | null;
  timestamp: string | null;
}

const generateShareText = (
    result: AnalysisResult, 
    evidence: AnalysisEvidence | null, 
    timestamp: string | null,
    forEmailBody: boolean = false
): string => {
    let evidenceText = '';
    if (evidence) {
        switch (evidence.type) {
            case 'file':
                evidenceText = `EVIDENCE ANALYZED (FILES): ${evidence.content}\n`;
                break;
            case 'text':
                const truncatedText = evidence.content.length > 500 ? evidence.content.substring(0, 500) + '...' : evidence.content;
                evidenceText = `EVIDENCE ANALYZED (TEXT):\n---\n${truncatedText}\n---\n\n`;
                break;
            case 'url':
                evidenceText = `EVIDENCE ANALYZED (URL): ${evidence.content}\n`;
                break;
        }
    }

    let text = '';
    if (forEmailBody) {
        text += `[--- PLEASE PROVIDE YOUR FEEDBACK OR SUGGESTION HERE ---]\n\n\n`;
    }

    text += `--- AUTOMATED CASE FILE ---\n`;
    text += `Analysis by: GenAI Sleuther Vanguard\n`;
    if (timestamp) {
        text += `Date of Analysis: ${timestamp}\n`;
    }
    text += `\n`;
    
    if (evidenceText) {
        text += evidenceText + '\n';
    }

    text += `VERDICT: ${result.verdict}\n`;
    text += `AI PROBABILITY: ${Math.round(result.probability)}%\n\n`;
    text += `EXPLANATION:\n${result.explanation}\n\n`;
    
    if (result.highlights && result.highlights.length > 0) {
      text += 'KEY INDICATORS:\n';
      result.highlights.forEach(h => {
        text += `- "${h.text}": ${h.reason}\n`;
      });
      text += '\n';
    }

    text += 'Analysis performed by GenAI Sleuther Vanguard, powered by Google Gemini.';
    return text;
};


export const Feedback: React.FC<FeedbackProps> = React.memo(({ result, evidence, timestamp }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'none' | 'positive' | 'report'>('none');

  const handlePositiveFeedback = () => {
    setFeedbackGiven('positive');
  };

  const mailtoLink = useMemo(() => {
    const reportTitle = encodeURIComponent('Sleuther Vanguard - Feedback');
    const emailBody = encodeURIComponent(generateShareText(result, evidence, timestamp, true));
    return `mailto:churlish.grrly@gmail.com?subject=${reportTitle}&body=${emailBody}`;
  }, [result, evidence, timestamp]);


  const renderContent = () => {
    if (feedbackGiven === 'positive') {
      return <p className="text-cyan-600 dark:text-cyan-400">Merci! Your feedback helps sharpen my deductive skills.</p>;
    }
    if (feedbackGiven === 'report') {
       return <p className="text-cyan-600 dark:text-cyan-400">Your email client is opening. Thank you for your feedback!</p>;
    }
    return (
      <>
        <p className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">Did my analysis help solve your case?</p>
        <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all hover:shadow-lg hover:shadow-fuchsia-500/20">
          <div className="flex justify-center bg-slate-200 dark:bg-slate-800 rounded-full p-1">
            <button 
              onClick={handlePositiveFeedback} 
              className="flex-1 p-2 text-slate-500 hover:text-green-500 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-green-400 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" 
              aria-label="Yes, this was helpful"
              title="Helpful"
            >
              <ThumbsUpIcon className="w-5 h-5 mx-auto" />
            </button>
            <div className="border-l border-slate-300 dark:border-slate-600 mx-1"></div>
            <a 
              href={mailtoLink}
              onClick={() => setFeedbackGiven('report')}
              className="flex-1 p-2 text-slate-500 hover:text-fuchsia-500 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-fuchsia-400 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 inline-block" 
              aria-label="Send feedback or suggestion"
              title="Send Feedback"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 mx-auto" />
            </a>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="mt-6 text-sm text-center">
      {renderContent()}
    </div>
  );
});