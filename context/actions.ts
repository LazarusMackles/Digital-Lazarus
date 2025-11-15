// Action Type Constants for robust state management.

// Input State Actions
export const SET_FILE_DATA = 'SET_FILE_DATA';
export const SET_ANALYSIS_ANGLE = 'SET_ANALYSIS_ANGLE';
export const CLEAR_INPUTS = 'CLEAR_INPUTS';
export const LOAD_SCENARIO = 'LOAD_SCENARIO';

// Result State Actions
export const START_ANALYSIS = 'START_ANALYSIS';
export const START_REANALYSIS = 'START_REANALYSIS';
export const ANALYSIS_SUCCESS = 'ANALYSIS_SUCCESS';
export const ANALYSIS_ERROR = 'ANALYSIS_ERROR';
export const NEW_ANALYSIS = 'NEW_ANALYSIS';
export const STREAM_ANALYSIS_UPDATE = 'STREAM_ANALYSIS_UPDATE';


// Global/UI State Actions
export const SET_SHOW_WELCOME = 'SET_SHOW_WELCOME';
export const SET_THEME = 'SET_THEME';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const SET_SHOW_SETTINGS_MODAL = 'SET_SHOW_SETTINGS_MODAL';
export const SET_SHOW_API_KEY_ONBOARDING = 'SET_SHOW_API_KEY_ONBOARDING';

// New analysis workflow actions
export const START_PIXEL_ANALYSIS = 'START_PIXEL_ANALYSIS';
export const START_CONTEXT_ANALYSIS = 'START_CONTEXT_ANALYSIS';
export const ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE';
export const RESET_ANALYSIS_STATE = 'RESET_ANALYSIS_STATE';
