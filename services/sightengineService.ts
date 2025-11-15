const SIGHTENGINE_API_ENDPOINT = 'https://api.sightengine.com/1.0/check.json';

interface SightengineResponse {
    status: 'success' | 'failure';
    type: {
        ai_generated: number;
    };
    error?: {
        type: string;
        message: string;
    };
}

export const analyzeWithSightengine = async (base64Image: string, apiKey: string): Promise<{ ai_generated: number }> => {
    const [header, data] = base64Image.split(',');
    if (!data) {
        throw new Error("Invalid base64 string for Sightengine analysis.");
    }
    
    const formData = new FormData();
    formData.append('models', 'genai');
    
    // Sightengine API keys are split into user and secret. We'll use a colon delimiter.
    const [apiUser, apiSecret] = apiKey.split(':');
    if (!apiUser || !apiSecret) {
        throw new Error("Sightengine API Key is invalid. It must be in the format 'user:secret'.");
    }

    formData.append('api_user', apiUser);
    formData.append('api_secret', apiSecret);
    
    // Convert base64 to blob to send as a file
    const binaryStr = atob(data);
    let len = binaryStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        arr[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([arr], { type: 'image/jpeg' });
    formData.append('media', blob, 'image.jpg');

    try {
        const response = await fetch(SIGHTENGINE_API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        const result: SightengineResponse = await response.json();

        if (result.status === 'failure') {
            throw new Error(`Sightengine API Error: ${result.error?.message || 'Unknown error'}`);
        }

        return result.type;
    } catch (error) {
        console.error("Error calling Sightengine API:", error);
        throw new Error("Could not complete analysis with Sightengine.");
    }
};