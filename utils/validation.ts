import type { InputType } from '../types';

const URL_REGEX = /(https?:\/\/[^\s]+)/;

export const isInputReadyForAnalysis = (
    activeInput: InputType,
    textContent: string,
    fileData: { name: string }[]
): boolean => {
    switch (activeInput) {
        case 'text':
            // The input is valid only if it has content AND it does NOT contain a URL.
            return textContent.trim().length > 0 && !URL_REGEX.test(textContent);
        case 'file':
            return fileData.length > 0;
        case 'url':
            // This feature is disabled, so it's never valid for submission.
            return false;
        default:
            return false;
    }
};