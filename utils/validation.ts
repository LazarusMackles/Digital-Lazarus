import type { InputType } from '../types';

const TEXT_URL_REGEX = /(https?:\/\/[^\s]+)/;
const URL_VALIDATION_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;


export const isInputReadyForAnalysis = (
    activeInput: InputType,
    textContent: string,
    fileData: { name: string }[],
    url: string
): boolean => {
    switch (activeInput) {
        case 'text':
            // The input is valid only if it has content AND it does NOT contain a URL.
            return textContent.trim().length > 0 && !TEXT_URL_REGEX.test(textContent);
        case 'file':
            return fileData.length > 0;
        case 'url':
            return URL_VALIDATION_REGEX.test(url);
        default:
            return false;
    }
};