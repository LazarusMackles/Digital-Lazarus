
import React, { useState } from 'react';
import { Icon } from '../icons/index';

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
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[40rem]' : 'max-h-0'}`}
            >
                <div className="p-4 pt-2 text-sm text-slate-600 dark:text-slate-300">
                    <ul className="list-none space-y-3">
                        <li><strong className="text-slate-700 dark:text-slate-100">1. Submit Your Evidence:</strong> Paste text or upload one or more images. For multiple images, the first is the <strong className="text-cyan-600 dark:text-cyan-400">Primary Evidence</strong>, and others serve as supporting context.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">2. Choose Your Investigation Angle (For Images):</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Forensic Analysis:</strong> A deep dive into the image's content, searching for tell-tale signs of digital synthesis like inconsistent lighting, unnatural textures, and geometric anomalies.</li>
                                <li><strong className="text-cyan-600 dark:text-cyan-400">Provenance Dossier:</strong> A broader investigation that uses Google Search to find an image's history online, including its first appearance and any public fact-checks.</li>
                            </ul>
                        </li>
                        <li><strong className="text-slate-700 dark:text-slate-100">3. Text Analysis is Automatic:</strong> For pasted text, I automatically perform my most thorough forensic analysis. There are no extra options to configure—you always get the best deduction.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">4. Review the Findings:</strong> I'll return a <strong className="text-cyan-600 dark:text-cyan-400">Probability Score</strong> and a <strong className="text-cyan-600 dark:text-cyan-400">Detailed Verdict</strong>. My analysis is a professional opinion, not the undisputed truth.</li>
                        <li><strong className="text-slate-700 dark:text-slate-100">5. Engage with the Verdict:</strong> Not convinced? You can <strong className="text-cyan-600 dark:text-cyan-400">Request a Second Opinion</strong> for a new analysis. Your <strong className="text-cyan-600 dark:text-cyan-400">Feedback</strong> is also crucial—it helps sharpen my skills for the next case!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});
