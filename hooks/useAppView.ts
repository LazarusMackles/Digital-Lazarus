import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';

export type AppView = 'LOADING' | 'RESULT' | 'INPUT';

/**
 * A custom hook that determines which main view should be displayed
 * based on the current result state. This encapsulates the view logic
 * that was previously in the AppContent component.
 * @returns {AppView} A string representing the current view state.
 */
export const useAppView = (): AppView => {
    const { state: resultState } = useResultState();
    const { state: uiState } = useUIState();
    
    const { 
        analysisEvidence, 
        analysisResult 
    } = resultState;
    const {
        isLoading,
        isReanalyzing,
        isStreaming
    } = uiState;

    // Determine if we are in a state where the result view should be shown for streaming text.
    // A re-analysis is a full loading state, not a text stream-in view.
    const isStreamingTextView = isStreaming && analysisEvidence?.type === 'text' && !isReanalyzing;

    // Show the main loader for all loading states except when streaming new text results.
    if (isLoading && !isStreamingTextView) {
        return 'LOADING';
    }
    
    // If there's a result (including a streaming placeholder), show the result display.
    if (analysisResult) {
        return 'RESULT';
    }

    return 'INPUT';
};