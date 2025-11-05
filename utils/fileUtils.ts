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
 * This version uses `atob` for maximum compatibility, avoiding potential `fetch`
 * API issues in some environments.
 * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...").
 * @returns A temporary blob URL (e.g., "blob:http..."). This URL should be revoked with URL.revokeObjectURL() when no longer needed.
 */
export const base64ToBlobUrl = (base64Data: string): string => {
    const [header, data] = base64Data.split(',');
    if (!data) {
        throw new Error('Invalid base64 string provided for Blob conversion.');
    }

    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const binaryStr = atob(data);
    let len = binaryStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        arr[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([arr], { type: mime });
    return URL.createObjectURL(blob);
};