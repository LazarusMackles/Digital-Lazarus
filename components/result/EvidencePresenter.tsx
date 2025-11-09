
import React, { useState } from 'react';
import type { AnalysisEvidence } from '../../types';
import { EvidenceImage } from '../EvidenceImage';
import { ImageLightbox } from '../ImageLightbox';
import { SleuthNote } from '../ui';
import { InteractiveTextDisplay } from '../InteractiveTextDisplay';
import { useResultState } from '../../context/ResultStateContext';

interface EvidencePresenterProps {
    evidence: AnalysisEvidence;
}

const EvidenceItem: React.FC<{ file: { name: string; imageBase64: string }; onImageClick: (url: string) => void }> = ({ file, onImageClick }) => (
    <div 
        className="relative group aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer" 
        onClick={() => onImageClick(file.imageBase64)}
    >
        <EvidenceImage base64Src={file.imageBase64} alt={`Evidence: ${file.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-center">
            <p className="text-xs text-white truncate">{file.name}</p>
        </div>
    </div>
);


export const EvidencePresenter: React.FC<EvidencePresenterProps> = ({ evidence }) => {
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    if (!evidence.content) return null;

    const renderContent = () => {
        switch (evidence.type) {
            case 'text':
                 // Text is now rendered directly in ResultDisplay via InteractiveTextDisplay
                return null;
            case 'file':
                try {
                    const files: { name: string; imageBase64: string }[] = JSON.parse(evidence.content);
                    if (!files.length) return null;

                    return (
                        <>
                            <SleuthNote>
                                The primary piece of evidence is displayed first, with any additional files presented as supporting context. Click an image to enlarge.
                            </SleuthNote>
                            {files.length === 1 ? (
                                <div className="mt-4 w-full max-w-xs">
                                    <EvidenceItem file={files[0]} onImageClick={setLightboxImage} />
                                </div>
                            ) : (
                                <div className="mt-4 w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {files.map((file, index) => (
                                        <EvidenceItem key={`${file.name}-${index}`} file={file} onImageClick={setLightboxImage} />
                                    ))}
                                </div>
                            )}
                        </>
                    );
                } catch (error) {
                    console.error("Failed to parse file evidence content:", error);
                    return <p className="text-red-500">Could not display file evidence.</p>;
                }

            default:
                return null;
        }
    }

    return (
        <div className="mb-4 w-full flex flex-col items-center">
            {renderContent()}
            {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
        </div>
    );
};
