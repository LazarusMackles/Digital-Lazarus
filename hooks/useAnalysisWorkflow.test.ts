import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as analysisService from '../services/analysisService';
import * as actions from '../context/actions';
import { useAnalysisWorkflow } from './useAnalysisWorkflow';

// --- Mocks ---
// Mock the service
vi.mock('../services/analysisService', () => ({
  runAnalysis: vi.fn(),
}));

// Mock the context hooks
const mockInputDispatch = vi.fn();
const mockResultDispatch = vi.fn();
const mockUiDispatch = vi.fn();

vi.mock('../context/InputStateContext', () => ({
  useInputState: () => ({
    state: {
      activeInput: 'text',
      textContent: 'Test content',
      fileData: [],
      analysisMode: 'quick',
      forensicMode: 'standard'
    },
    dispatch: mockInputDispatch,
  }),
}));

vi.mock('../context/ResultStateContext', () => ({
  useResultState: () => ({
    state: {},
    dispatch: mockResultDispatch,
  }),
}));

vi.mock('../context/UIStateContext', () => ({
  useUIState: () => ({
    state: {},
    dispatch: mockUiDispatch,
  }),
}));


// This is a minimal React-like environment to test hooks without a full library
const renderHook = <T,>(hook: () => T): T => {
    return hook();
};


describe('useAnalysisWorkflow', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('performAnalysis', () => {
        it('should dispatch start and success actions on a successful analysis', async () => {
            const mockApiResult = { 
                result: { probability: 90, verdict: 'AI', explanation: 'It is AI.' },
                modelName: 'gemini-2.5-flash' 
            };
            (analysisService.runAnalysis as any).mockResolvedValue(mockApiResult);

            const { performAnalysis } = renderHook(useAnalysisWorkflow);
            await performAnalysis();

            // Check that start was dispatched correctly
            expect(mockResultDispatch).toHaveBeenCalledWith({
                type: actions.START_ANALYSIS,
                payload: {
                    evidence: { type: 'text', content: 'Test content' },
                    analysisMode: 'quick',
                }
            });

            // Check that success was dispatched correctly
            expect(mockResultDispatch).toHaveBeenCalledWith({
                type: actions.ANALYSIS_SUCCESS,
                payload: {
                    result: mockApiResult.result,
                    modelName: mockApiResult.modelName,
                    isSecondOpinion: false
                }
            });

             // Check that loading flags were set correctly
            expect(mockUiDispatch).toHaveBeenCalledWith({ type: actions.SET_LOADING, payload: true });
            expect(mockUiDispatch).toHaveBeenCalledWith({ type: actions.SET_LOADING, payload: false });
        });

        it('should dispatch start and error actions on a failed analysis', async () => {
            const mockError = new Error('API Failed');
            (analysisService.runAnalysis as any).mockRejectedValue(mockError);

            const { performAnalysis } = renderHook(useAnalysisWorkflow);
            await performAnalysis();
            
            // Check that start was still dispatched
            expect(mockResultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.START_ANALYSIS }));

            // Check that error was dispatched to the UI context
            expect(mockUiDispatch).toHaveBeenCalledWith({
                type: actions.SET_ERROR,
                payload: 'API Failed'
            });
        });

        it('should dispatch START_REANALYSIS when isReanalysis is true', async () => {
            (analysisService.runAnalysis as any).mockResolvedValue({ result: {}, modelName: 'test-model' });
            
            const { performAnalysis } = renderHook(useAnalysisWorkflow);
            await performAnalysis(true); // Call with reanalysis flag

            expect(mockResultDispatch).toHaveBeenCalledWith({
                type: actions.START_REANALYSIS
            });
            expect(mockUiDispatch).toHaveBeenCalledWith({ type: actions.SET_REANALYZING, payload: true });
        });
    });

    describe('handleNewAnalysis', () => {
        it('should dispatch NEW_ANALYSIS and CLEAR_ERROR but not CLEAR_INPUTS', () => {
            const { handleNewAnalysis } = renderHook(useAnalysisWorkflow);
            handleNewAnalysis();

            expect(mockResultDispatch).toHaveBeenCalledWith({ type: actions.NEW_ANALYSIS });
            expect(mockUiDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_ERROR });
            expect(mockInputDispatch).not.toHaveBeenCalledWith({ type: actions.CLEAR_INPUTS });
        });
    });

    describe('handleClearInputs', () => {
        it('should dispatch CLEAR_INPUTS and CLEAR_ERROR', () => {
            const { handleClearInputs } = renderHook(useAnalysisWorkflow);
            handleClearInputs();

            expect(mockInputDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_INPUTS });
            expect(mockUiDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_ERROR });
        });
    });
});