
/**
 * Service for interacting with the Hive AI Detection API.
 * https://hivemoderation.com/ai-generated-content-detection
 */

export interface HiveResult {
    status: string;
    output: {
        classes: {
            class: string;
            score: number;
        }[];
    }[];
}

/**
 * Analyzes an image using Hive's AI Generated Image Detection model.
 */
export const analyzeWithHive = async (imageBase64: string, apiKey: string): Promise<number> => {
    // Hive expects the base64 string without the data:image/jpeg;base64, prefix
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const response = await fetch('https://api.thehive.ai/api/v2/models/ai_generated_image_detection/predict', {
        method: 'POST',
        headers: {
            'Authorization': `token ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image_data: base64Data
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hive API Error: ${response.status} - ${errorText}`);
    }

    const data: HiveResult = await response.json();
    
    // Hive returns scores for different classes (e.g., "ai_generated", "not_ai_generated")
    // We want the score for "ai_generated"
    const aiGeneratedClass = data.output[0].classes.find(c => c.class === 'ai_generated');
    
    if (!aiGeneratedClass) {
        throw new Error("Hive API did not return an 'ai_generated' class score.");
    }

    // Return score as a percentage (0-100)
    return Math.round(aiGeneratedClass.score * 100);
};
