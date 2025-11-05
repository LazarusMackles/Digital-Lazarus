import React, { useState } from 'react';
import { InformationCircleIcon, ChevronDownIcon } from './icons/index';

export const HowItWorks: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-8 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700/50 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-center items-center p-4 relative"
                aria-expanded={isOpen}
                aria-controls="how-it-works-content"
            >
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Mission Briefing</span>
                        <span className="block text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">How Sleuther Works: A Quick Guide</span>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 absolute right-4 top-1/2 -translate-y-1/2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                id="how-it-works-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-4 pt-2 text-sm text-slate-600 dark:text-slate-300">
                    <ul className="list-none space-y-3">
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Evidence:</strong> Paste text, upload files, or provide a URL. For multiple images, the first is the <strong className="text-cyan-600 dark:text-cyan-400">Primary Evidence</strong>, with others serving as supporting clues.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Guide the Investigation (For Images):</strong> For images, choose a forensic angle: balanced <strong className="text-cyan-600 dark:text-cyan-400">Standard</strong>, pixel-focused <strong className="text-cyan-600 dark:text-cyan-400">Technical</strong>, or story-focused <strong className="text-cyan-600 dark:text-cyan-400">Conceptual</strong>.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Set the Pace:</strong> Choose <strong className="text-cyan-600 dark:text-cyan-400">Quick Scan</strong> for speed or <strong className="text-cyan-600 dark:text-cyan-400">Deep Analysis</strong> for a more thorough examination.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Review the Findings:</strong> I'll return a <strong className="text-cyan-600 dark:text-cyan-400">Probability Score</strong> and a <strong className="text-cyan-600 dark:text-cyan-400">Detailed Verdict</strong>. My report is an expert opinion, not the undisputed truth, and your feedback helps me learn.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});