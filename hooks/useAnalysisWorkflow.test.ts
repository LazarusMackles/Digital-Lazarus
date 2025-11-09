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
    // We don't need the state for this test, just the dispatch
    state: {},
    dispatch: mockResultDispatch,
  }),
}));


// This is a minimal React-like environment to test hooks without a full library
const renderHook = <T>(hook: () => T): T => {
    return hook();
};


describe('useAnalysisWorkflow', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('performAnalysis', () => {
        it('should dispatch start and success actions on a successful analysis', async () => {
            const mockResult = { probability: 90, verdict: 'AI', explanation: 'It is AI.' };
            (analysisService.runAnalysis as any).mockResolvedValue(mockResult);

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
                // FIX: Corrected action type to ANALYSIS_SUCCESS.
                type: actions.ANALYSIS_SUCCESS,
                payload: {
                    result: mockResult,
                    isSecondOpinion: false
                }
            });
        });

        it('should dispatch start and error actions on a failed analysis', async () => {
            const mockError = new Error('API Failed');
            (analysisService.runAnalysis as any).mockRejectedValue(mockError);

            const { performAnalysis } = renderHook(useAnalysisWorkflow);
            await performAnalysis();
            
            // Check that start was still dispatched
            expect(mockResultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.START_ANALYSIS }));

            // Check that error was dispatched
            expect(mockResultDispatch).toHaveBeenCalledWith({
                type: actions.ANALYSIS_ERROR,
                payload: 'API Failed'
            });
        });

        it('should dispatch START_REANALYSIS when isReanalysis is true', async () => {
            (analysisService.runAnalysis as any).mockResolvedValue({});
            
            const { performAnalysis } = renderHook(useAnalysisWorkflow);
            await performAnalysis(true); // Call with reanalysis flag

            expect(mockResultDispatch).toHaveBeenCalledWith({
                type: actions.START_REANALYSIS
            });
        });
    });

    describe('handleNewAnalysis', () => {
        it('should dispatch NEW_ANALYSIS and CLEAR_INPUTS', () => {
            const { handleNewAnalysis } = renderHook(useAnalysisWorkflow);
            handleNewAnalysis();

            expect(mockResultDispatch).toHaveBeenCalledWith({ type: actions.NEW_ANALYSIS });
            expect(mockInputDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_INPUTS });
        });
    });

    describe('handleClearInputs', () => {
        it('should dispatch CLEAR_INPUTS and CLEAR_ERROR', () => {
            const { handleClearInputs } = renderHook(useAnalysisWorkflow);
            handleClearInputs();

            expect(mockInputDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_INPUTS });
            expect(mockResultDispatch).toHaveBeenCalledWith({ type: actions.CLEAR_ERROR });
        });
    });
});