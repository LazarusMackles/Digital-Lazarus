import type { InputType } from '../types';

const TEXT_URL_REGEX = /(https?:\/\/[^\s]+)/;

export const isInputReadyForAnalysis = (
    activeInput: InputType,
    textContent: string,
    fileData: { name: string }[]
): boolean => {
    switch (activeInput) {
        case 'text':
            // The input is valid only if it has content AND it does NOT contain a URL.
            return textContent.trim().length > 0 && !TEXT_URL_REGEX.test(textContent);
        case 'file':
            return fileData.length > 0;
        default:
            return false;
    }
};