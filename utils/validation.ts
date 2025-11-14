import type { InputType } from '../types';

export const isInputReadyForAnalysis = (
    activeInput: InputType,
    textContent: string,
    fileData: { name: string } | null
): boolean => {
    switch (activeInput) {
        case 'text':
            // The input is valid if it has any content. URLs are permitted.
            return textContent.trim().length > 0;
        case 'file':
            return fileData !== null;
        default:
            return false;
    }
};