import React from 'react';
import type { AnalysisEvidence, AnalysisResult } from '../../types';
import { EvidenceImage } from '../EvidenceImage';
import { InteractiveTextDisplay } from '../InteractiveTextDisplay';

interface EvidencePresenterProps {
    evidence: AnalysisEvidence | null;
    imageData: string[] | null;
    highlights: AnalysisResult['highlights'];
    onImageClick: (imageUrl: string) => void;
}

export const EvidencePresenter: React.FC<EvidencePresenterProps> = React.memo(({ evidence, imageData, highlights, onImageClick }) => {
    if (!evidence) return null;

    const isImageAnalysis = evidence.type === 'file' && !!imageData && imageData.length > 0;
    const isTextAnalysis = (evidence.type === 'text' || evidence.type === 'url') && !!evidence.content;

    if (isImageAnalysis) {
        return (
            <div className="mb-8 w-full max-w-xl text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                    Evidence Presented
                </h3>
                <div className={
                    imageData.length === 1
                        ? "flex justify-center"
                        : "grid grid-cols-2 sm:grid-cols-4 gap-4"
                }>
                    {imageData.map((src, index) => (
                        <div
                            key={index}
                            className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors"
                            onClick={() => onImageClick(src)}
                        >
                            <EvidenceImage base64Src={src} alt={`Evidence ${index + 1}`} className="w-full h-full object-contain" />
                            {index === 0 && imageData.length > 1 && (
                                <div className="absolute top-1 left-1 z-10 bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded">PRIMARY</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isTextAnalysis) {
        return (
            <div className="mb-8 w-full max-w-xl text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                    Annotated Evidence ({evidence.type === 'url' ? 'URL Content' : 'Text'})
                </h3>
                <div className="max-h-64 overflow-y-auto p-3 bg-slate-200 dark:bg-slate-900 rounded font-mono text-sm text-slate-700 dark:text-slate-300">
                    <InteractiveTextDisplay text={evidence.content} highlights={highlights || []} />
                </div>
            </div>
        );
    }

    return null;
});