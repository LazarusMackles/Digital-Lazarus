/**
 * Converts a File object into a base64 encoded data URL.
 * @param file The file to convert.
 * @returns A promise that resolves to the base64 data URL string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

/**
 * Converts a base64 data URL into a Blob and returns a temporary object URL.
 * This is more robust than using long data URLs directly in `src` attributes,
 * as it avoids browser length limitations and is more performant.
 * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...").
 * @returns A promise that resolves to a temporary blob URL (e.g., "blob:http...").
 */
export const base64ToBlobUrl = async (base64Data: string): Promise<string> => {
    const response = await fetch(base64Data);
    if (!response.ok) {
        throw new Error('Failed to fetch base64 data');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
