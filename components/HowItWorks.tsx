import React, { useState } from 'react';
import { InformationCircleIcon, ChevronDownIcon } from './icons';

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
                        <span className="block text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">How It Works: A Quick Guide</span>
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
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Content:</strong> Paste text, upload a file (like an image or document), or enter a website link to be checked.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Uploading Many Images:</strong> If you upload more than one image, the first one is the <strong className="text-cyan-600 dark:text-cyan-400">primary image</strong>. The other images act as supporting clues (like close-ups or different angles) to help with the analysis.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Pick an Analysis Type:</strong> Choose 'Quick Scan' for a fast result, or 'Deep Analysis' for a more detailed check.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Get Your Results:</strong> You will get a score and a summary explaining the chance of AI use. Please remember this is a new and difficult area, so think of the result as an expert guess, not a perfect fact.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});