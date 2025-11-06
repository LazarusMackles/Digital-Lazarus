/**
 * Compresses an image file before converting it to a base64 data URL.
 * This function is designed to reduce the payload size for API requests.
 * 
 * - It resizes the image to fit within a maximum width/height while maintaining aspect ratio.
 * - For JPEG and WEBP, it applies quality-based compression.
 * - Other types (like PNG) are converted to JPEG to ensure significant size reduction.
 * 
 * This helps speed up uploads and reduce the likelihood of request timeouts.
 * 
 * @param file The image file to process.
 * @param options Configuration for resizing and quality.
 * @returns A promise that resolves to the base64 data URL string.
 */
export const compressAndEncodeFile = (
    file: File,
    options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<string> => {
    const { quality = 0.85, maxWidth = 1920, maxHeight = 1080 } = options;
    const compressibleTypes = ['image/jpeg', 'image/webp'];

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file for compression."));
            }

            const img = new Image();
            img.src = event.target.result as string;

            img.onload = () => {
                let { width, height } = img;

                // Calculate new dimensions to fit within maxWidth and maxHeight while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error("Could not get canvas context for image compression."));
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get the data URL. Convert non-compressible types to JPEG for size savings.
                const outputMimeType = compressibleTypes.includes(file.type) ? file.type : 'image/jpeg';
                const dataUrl = canvas.toDataURL(outputMimeType, quality);
                
                resolve(dataUrl);
            };

            img.onerror = (error) => reject(new Error(`Image failed to load for compression: ${error}`));
        };
        
        reader.onerror = (error) => reject(new Error(`File reader error for compression: ${error}`));
    });
};
