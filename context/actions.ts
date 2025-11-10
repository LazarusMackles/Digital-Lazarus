// Action Type Constants for robust state management.

// Input State Actions
export const SET_TEXT_CONTENT = 'SET_TEXT_CONTENT';
export const SET_FILE_DATA = 'SET_FILE_DATA';
export const SET_URL = 'SET_URL';
export const SET_ACTIVE_INPUT = 'SET_ACTIVE_INPUT';
export const SET_ANALYSIS_MODE = 'SET_ANALYSIS_MODE';
export const SET_FORENSIC_MODE = 'SET_FORENSIC_MODE';
export const CLEAR_INPUTS = 'CLEAR_INPUTS';
export const LOAD_SCENARIO = 'LOAD_SCENARIO';

// Result State Actions
export const START_ANALYSIS = 'START_ANALYSIS';
// FIX: Corrected typo from START_REANALysis to START_REANALYSIS
export const START_REANALYSIS = 'START_REANALYSIS';
export const ANALYSIS_SUCCESS = 'ANALYSIS_SUCCESS';
export const ANALYSIS_ERROR = 'ANALYSIS_ERROR';
export const NEW_ANALYSIS = 'NEW_ANALYSIS';
export const STREAM_ANALYSIS_UPDATE = 'STREAM_ANALYSIS_UPDATE';


// Global/UI State Actions
export const SET_SHOW_WELCOME = 'SET_SHOW_WELCOME';
export const SET_THEME = 'SET_THEME';
export const SET_LOADING = 'SET_LOADING';
export const SET_STREAMING = 'SET_STREAMING';
export const SET_REANALYZING = 'SET_REANALYZING';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';