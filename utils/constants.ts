// File Upload Configuration
export const MAX_FILES = 4;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const ACCEPTED_IMAGE_TYPES_STRING = ACCEPTED_IMAGE_TYPES.join(',');

// Gemini Model Configuration
export const MODELS = {
  QUICK: 'gemini-2.5-flash',
  DEEP: 'gemini-2.5-pro',
};

// UI and Styling Constants
export const VERDICT_COLORS = {
  HUMAN: '#2dd4bf',    // teal-400
  MIXED: '#facc15',    // yellow-400
  AI: '#f43f5e',       // rose-500
};
