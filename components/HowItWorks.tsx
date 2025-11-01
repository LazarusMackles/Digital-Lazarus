import React, { useState } from 'react';
import { InformationCircleIcon, ChevronDownIcon } from './icons';

export const HowItWorks: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="my-6 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-t-lg"
                aria-expanded={isOpen}
                aria-controls="how-it-works-content"
            >
                <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">How it Works: A Quick Briefing</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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