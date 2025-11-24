import React, { useState } from 'react';
import type { AnalysisEvidence, AnalysisAngle } from '../../types';
import { EvidenceImage, ImageLightbox } from '../ui';
import { cn } from '../../utils/cn';
import { useInputState } from '../../context/InputStateContext';

interface EvidencePresenterProps {
    evidence: AnalysisEvidence;
    probability: number;
    analysisAngleUsed?: AnalysisAngle | null;
}

const getBorderColorClass = (p: number, angle?: AnalysisAngle | null): string => {
    if (angle === 'provenance') {
        return 'border-cyan-500';
    }
    if (p < 40) return 'border-teal-400';
    if (p < 80) return 'border-yellow-400';
    return 'border-rose-500';
};

const EvidenceItem: React.FC<{ name: string; imageBase64: string; onImageClick: (url: string) => void; borderColorClass: string; }> = ({ name, imageBase64, onImageClick, borderColorClass }) => (
    <div 
        className={cn(
            "relative group aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors duration-300", 
            borderColorClass
        )} 
        onClick={() => onImageClick(imageBase64)}
    >
        <EvidenceImage base64Src={imageBase64} alt={`Evidence: ${name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-center">
            <p className="text-xs text-white truncate">{name}</p>
        </div>
    </div>
);


export const EvidencePresenter: React.FC<EvidencePresenterProps> = ({ evidence, probability, analysisAngleUsed }) => {
    const { state: inputState } = useInputState();
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const borderColorClass = getBorderColorClass(probability, analysisAngleUsed);

    const renderContent = () => {
        if (evidence.type === 'reference' && evidence.fileRef === 'input_file') {
             // Retrieve the actual image data from InputState
             const fileData = inputState.fileData;
             if (!fileData || !fileData.imageBase64) {
                 return <p className="text-red-500 text-sm">Evidence data unavailable.</p>;
             }

             return (
                <div className="mt-6 w-full max-w-xs">
                    <EvidenceItem 
                        name={evidence.filename} 
                        imageBase64={fileData.imageBase64} 
                        onImageClick={setLightboxImage} 
                        borderColorClass={borderColorClass} 
                    />
                </div>
            );
        }
        return null;
    }

    return (
        <div className="mb-4 w-full flex flex-col items-center">
            {renderContent()}
            {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
        </div>
    );
};