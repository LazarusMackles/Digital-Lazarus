import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index';
import { useHistory } from '../../context/HistoryContext';
import { VERDICT_COLORS } from '../../utils/constants';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { Button } from './Button';

interface HistoryModalProps {
  onClose: () => void;
}

const getColorForProbability = (p: number, angle: string) => {
    if (angle === 'provenance') return 'text-cyan-500';
    if (p < 40) return 'text-teal-500';
    if (p < 80) return 'text-yellow-500';
    return 'text-rose-500';
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { history, clearHistory } = useHistory();
  useBodyScrollLock();

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up mt-8"
      >
        <div className="p-6 sm:p-8">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close history"
            >
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full text-fuchsia-600 dark:text-fuchsia-400">
                    <Icon name="clock" className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                    Case History
                </h2>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No previous cases found on this device.</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {history.map((entry) => (
                        <div key={entry.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.filename}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">{entry.timestamp}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                                    {entry.analysisAngle}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className={`font-bold ${getColorForProbability(entry.probability, entry.analysisAngle)}`}>
                                    {entry.verdict}
                                </p>
                                {entry.analysisAngle !== 'provenance' && (
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {Math.round(entry.probability)}% AI
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {history.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={clearHistory} className="text-sm px-4 py-2">
                        Clear History
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};