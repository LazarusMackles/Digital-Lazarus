import React, { useState } from 'react';
import { Icon } from './icons/index';

export const HowItWorks: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-8 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700/50 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-center items-center p-4 gap-4"
                aria-expanded={isOpen}
                aria-controls="how-it-works-content"
            >
                <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
                    How Sleuther Works: Quick Guide
                </h3>
                
                <div className="flex-shrink-0 p-2 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-400 dark:border-slate-600">
                    <Icon name="chevron-down" className={`w-5 h-5 text-cyan-500 dark:text-cyan-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div
                id="how-it-works-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-4 pt-2 text-sm text-slate-600 dark:text-slate-300">
                    <ul className="list-none space-y-3">
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Evidence:</strong> Paste text or upload files. For multiple images, first upload is the <strong className="text-cyan-600 dark:text-cyan-400">Primary Evidence</strong>, with other uploads serving as supporting clues for the Primary.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Guide the Investigation:</strong> For images, choose a forensic angle: balanced <strong className="text-cyan-600 dark:text-cyan-400">Standard</strong>, pixel-focused <strong className="text-cyan-600 dark:text-cyan-400">Technical</strong>, or story-focused <strong className="text-cyan-600 dark:text-cyan-400">Conceptual</strong>.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Set the Pace:</strong> Choose <strong className="text-cyan-600 dark:text-cyan-400">Quick Scan</strong> for speed or <strong className="text-cyan-600 dark:text-cyan-400">Deep Dive</strong> for a more thorough examination.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Review the Findings:</strong> I'll return a <strong className="text-cyan-600 dark:text-cyan-400">Probability Score</strong> and a <strong className="text-cyan-600 dark:text-cyan-400">Detailed Verdict</strong>. My analysis is a professional opinion, not the undisputed truth.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">5. Engage with the Verdict:</strong> Not convinced? You can <strong className="text-cyan-600 dark:text-cyan-400">Request a Second Opinion</strong> for a 'Deep Dive' from a new angle. Sending your <strong className="text-cyan-600 dark:text-cyan-400">Feedback</strong> is also crucial—it helps sharpen my skills for the next case!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});