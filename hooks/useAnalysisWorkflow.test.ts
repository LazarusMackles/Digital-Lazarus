import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalysisWorkflow } from './useAnalysisWorkflow';
import * as analyzeApi from '../api/analyze';
import * as sightengineService from '../services/sightengineService';
import * as InputStateContext from '../context/InputStateContext';
import * as ResultStateContext from '../context/ResultStateContext';
import * as UIStateContext from '../context/UIStateContext';
import * as ApiKeyContext from '../context/ApiKeyContext';
import * as actions from '../context/actions';
import type { InputState } from '../context/InputStateContext';

// --- Mocks Setup ---

vi.mock('../api/analyze');
vi.mock('../services/sightengineService');

const mockAnalyzeContent = vi.mocked(analyzeApi.analyzeContent);
const mockAnalyzeWithSearch = vi.mocked(analyzeApi.analyzeWithSearch);
const mockAnalyzeWithSightengine = vi.mocked(sightengineService.analyzeWithSightengine);

// A minimal test harness for React hooks.
const renderHook = <T,>(hook: () => T): T => {
    return hook();
};

const mockInputState: InputState = {
    fileData: { name: 'test.jpg', imageBase64: 'data:image/jpeg;base64,test' },
    analysisAngle: 'forensic',
};

describe('useAnalysisWorkflow', () => {
    const inputDispatch = vi.fn();
    const resultDispatch = vi.fn();
    const uiDispatch = vi.fn();

    beforeEach(() => {
        vi.spyOn(InputStateContext, 'useInputState').mockReturnValue({ state: mockInputState, dispatch: inputDispatch });
        vi.spyOn(ResultStateContext, 'useResultState').mockReturnValue({ state: ResultStateContext.initialState, dispatch: resultDispatch });
        vi.spyOn(UIStateContext, 'useUIState').mockReturnValue({ state: UIStateContext.initialState, dispatch: uiDispatch });
        vi.spyOn(ApiKeyContext, 'useApiKeys').mockReturnValue({
            googleApiKey: 'google_key',
            sightengineApiKey: 'sightengine_key:secret',
            hasGoogleApiKey: true,
            hasSightengineApiKey: true,
            saveGoogleApiKey: vi.fn(),
            saveSightengineApiKey: vi.fn(),
        });
        mockAnalyzeContent.mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Looks AI' });
        mockAnalyzeWithSearch.mockResolvedValue({ text: 'Found online', candidates: [{ groundingMetadata: { groundingChunks: [{web: {uri: 'test.com'}}] } }] });
        mockAnalyzeWithSightengine.mockResolvedValue({ ai_generated: 0.95 });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should handle successful forensic analysis', async () => {
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis();
        
        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.START_ANALYSIS }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.START_CONTEXT_ANALYSIS });
        expect(mockAnalyzeContent).toHaveBeenCalled();
        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.ANALYSIS_SUCCESS }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.ANALYSIS_COMPLETE });
    });

    it('should handle successful hybrid analysis', async () => {
        vi.spyOn(InputStateContext, 'useInputState').mockReturnValue({ state: { ...mockInputState, analysisAngle: 'hybrid' }, dispatch: vi.fn() });
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis();

        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.START_ANALYSIS }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.START_PIXEL_ANALYSIS });
        expect(mockAnalyzeWithSightengine).toHaveBeenCalled();
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.START_CONTEXT_ANALYSIS });
        expect(mockAnalyzeContent).toHaveBeenCalled();
        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: actions.ANALYSIS_SUCCESS,
            payload: expect.objectContaining({ result: expect.objectContaining({ probability: 95 }) }) // 0.95 * 100
        }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.ANALYSIS_COMPLETE });
    });
    
     it('should handle successful provenance analysis', async () => {
        vi.spyOn(InputStateContext, 'useInputState').mockReturnValue({ state: { ...mockInputState, analysisAngle: 'provenance' }, dispatch: vi.fn() });
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis();

        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.START_ANALYSIS }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.START_CONTEXT_ANALYSIS });
        expect(mockAnalyzeWithSearch).toHaveBeenCalled();
        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: actions.ANALYSIS_SUCCESS }));
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.ANALYSIS_COMPLETE });
    });

    it('should dispatch an error if Sightengine API fails during hybrid analysis', async () => {
        vi.spyOn(InputStateContext, 'useInputState').mockReturnValue({ state: { ...mockInputState, analysisAngle: 'hybrid' }, dispatch: vi.fn() });
        mockAnalyzeWithSightengine.mockRejectedValue(new Error('Sightengine failed'));
        
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis();

        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.SET_ERROR, payload: expect.stringContaining('Sightengine analysis failed') });
        expect(mockAnalyzeContent).not.toHaveBeenCalled();
    });
    
    it('should dispatch an error if Gemini API fails', async () => {
        mockAnalyzeContent.mockRejectedValue(new Error('Gemini failed'));
        
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis();
        
        expect(uiDispatch).toHaveBeenCalledWith({ type: actions.SET_ERROR, payload: 'Gemini failed' });
    });

    it('should handle reanalysis correctly', async () => {
        const { performAnalysis } = renderHook(useAnalysisWorkflow);
        await performAnalysis(true); // isReanalysis = true

        expect(resultDispatch).toHaveBeenCalledWith({ type: actions.START_REANALYSIS });
        expect(resultDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: actions.ANALYSIS_SUCCESS,
            payload: expect.objectContaining({ isSecondOpinion: true })
        }));
    });
});
