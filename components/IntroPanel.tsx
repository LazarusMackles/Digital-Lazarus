import React from 'react';

export const IntroPanel: React.FC = React.memo(() => (
    <div className="mt-2 sm:mt-4 max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="space-y-4 text-sm sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed text-center font-medium">
            <p>
                Sleuther Vanguard is a premier <span className="text-cyan-600 dark:text-cyan-400 font-bold">digital forensics application</span> designed to restore trust in visual media. By harmonising rigid mathematical pixel analysis with the cognitive reasoning of <span className="text-cyan-600 dark:text-cyan-400 font-bold">advanced Artificial Intelligence</span>, it acts as an automated detective, scrutinising images for the subtle fingerprints of manipulation. Whether investigating deepfakes or verifying news photography, the system provides an immediate, probability-based verdict on an image’s authenticity.
            </p>
            <p>
                Engineered with a strict <span className="text-cyan-600 dark:text-cyan-400 font-bold">'privacy-first' philosophy</span>, Sleuther operates entirely within the user's secure browser environment, ensuring sensitive evidence never leaves your control. It transforms the complex science of digital forensics into an accessible, mobile-ready interface, empowering investigators to separate genuine history from synthetic fabrication in seconds.
            </p>
        </div>
    </div>
));