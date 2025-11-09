// File Upload Configuration
export const MAX_FILES = 4;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const ACCEPTED_IMAGE_TYPES_STRING = ACCEPTED_IMAGE_TYPES.join(',');

// Gemini Model Configuration
export const MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  // FIX: This was the root cause of the hang. 'gemini-2.5-flash-image' is an image-to-image
  // model and does not support this type of JSON analysis. The correct model for a fast,
  // multimodal analysis is 'gemini-2.5-flash'.
  QUICK_IMAGE: 'gemini-2.5-flash',
};

// UI and Styling Constants
export const VERDICT_COLORS = {
  HUMAN: '#2dd4bf',    // teal-400
  MIXED: '#facc15',    // yellow-400
  AI: '#f43f5e',       // rose-500
};

// Application Configuration
export const FEEDBACK_EMAIL = 'churlish.grrly@gmail.com';