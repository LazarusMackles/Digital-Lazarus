import React, { useState } from 'react';
import { InformationCircleIcon, ChevronDownIcon } from './icons';

export const HowItWorks: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="my-6 border bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700/50 rounded-lg transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/20 rounded-t-lg"
                aria-expanded={isOpen}
                aria-controls="how-it-works-content"
            >
                <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">How it Works: A Quick Briefing</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                id="how-it-works-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-300">
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Present Your Evidence:</strong> You can paste text, upload files (images or text docs), or provide a URL for analysis.</li>
                        <li><strong>Choose Your Method:</strong> Select 'Quick Scan' for a fast analysis or 'Deep Analysis' for a more thorough investigation. For images, you can also specify a forensic angle.</li>
                        <li><strong>Receive the Verdict:</strong> My analysis provides a probability score and a detailed verdict explaining the likelihood of AI involvement. Remember, this is a complex science, so treat my findings as a well-informed expert opinion, not an absolute truth.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
});