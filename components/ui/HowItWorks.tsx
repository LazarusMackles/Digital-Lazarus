
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
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Evidence:</strong> Upload a single image to begin your digital forensic investigation.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Choose Your Investigation Angle:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Forensic Analysis:</strong> A deep dive into the image's content, searching for tell-tale signs of digital synthesis.</li>
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Hybrid Analysis:</strong> Our most rigorous method, cross-referencing pixel-level scans with a silent provenance check.</li>
                            </ul>
                        </li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Review the Findings:</strong> I'll return a <strong className="text-cyan-600 dark:text-cyan-400">Probability Score</strong> and a <strong className="text-cyan-600 dark:text-cyan-400">Detailed Verdict</strong> based on digital signatures and online history.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Engage with the Verdict:</strong> Not convinced? Trigger an <strong className="text-cyan-600 dark:text-cyan-400">Adversarial Second Opinion</strong> to challenge the initial findings.</li>
                        
                        <li className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                            <p className="italic text-xs mb-3">
                                <strong className="text-slate-700 dark:text-slate-100 not-italic">Note:</strong> AI detection is a complex, evolving science. Consider my findings a well-informed probability, not an undisputed truth.
                            </p>
                            <div className="p-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
                                <p className="text-[11px] leading-relaxed">
                                    <strong className="text-slate-800 dark:text-slate-200">System Configuration:</strong> Sleuther is powered by your own API keys. You will need a <strong className="text-slate-800 dark:text-slate-200">Google Account</strong> to generate a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline">AI Studio</a> and a <strong className="text-slate-800 dark:text-slate-200">Hive Account</strong> for keys at the <a href="https://dashboard.thehive.ai/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline">Hive Dashboard</a>.
                                </p>
                                <p className="text-[10px] mt-2 text-slate-500 dark:text-slate-400 italic">
                                    Manage these sensors at any time via the Settings (cog) icon.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
});
