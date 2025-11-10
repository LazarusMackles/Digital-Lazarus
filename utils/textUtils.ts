
/**
 * Cleans input text to remove non-standard characters and formatting
 * that can interfere with AI analysis.
 * @param text The raw input text.
 * @returns The sanitized text.
 */
export const sanitizeTextInput = (text: string): string => {
    // Replaces non-printable characters (except for standard whitespace like tabs, newlines)
    // with an empty string. Normalises different newline characters to \n.
    return text.replace(/[\r\n]+/g, '\n').replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}]/gu, '');
};
