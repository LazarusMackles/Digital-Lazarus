
import React, { useState } from 'react';
import { Icon } from '../icons/index';

export const HowItWorks: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-6 mx-auto w-full max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700/50 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-center items-center py-3 px-4 gap-3"
                aria-expanded={isOpen}
                aria-controls="how-it-works-content"
            >
                <h3 className="text-lg sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
                    How Sleuther Works: Guide
                </h3>
                
                <div className="flex-shrink-0 p-1 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-400 dark:border-slate-600">
                    <Icon name="chevron-down" className={`w-3 h-3 text-cyan-500 dark:text-cyan-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div
                id="how-it-works-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[40rem]' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300">
                    <ul className="list-none space-y-3">
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Evidence:</strong> Upload a single image to begin your investigation.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Choose Your Investigation Angle:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Forensic Analysis:</strong> A deep dive into the image's content, searching for tell-tale signs of digital synthesis.</li>
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Provenance Dossier:</strong> An investigation using Google Search to find the image's history online.</li>
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Hybrid Analysis:</strong> The most accurate method, cross-referencing a specialized pixel scan with Gemini's forensic interpretation. (Requires a Sightengine API Key).</li>
                            </ul>
                        </li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Provide Your API Keys:</strong> This tool requires your own Google AI Studio and (optionally) Sightengine API keys. Manage them in the Settings panel.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Review the Findings:</strong> I'll return a <strong className="text-cyan-600 dark:text-cyan-400">Probability Score</strong> and a <strong className="text-cyan-600 dark:text-cyan-400">Detailed Verdict</strong>.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">5. Engage with the Verdict:</strong> Not convinced? You can <strong className="text-cyan-600 dark:text-cyan-400">Request a Second Opinion</strong> for a new analysis.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});
