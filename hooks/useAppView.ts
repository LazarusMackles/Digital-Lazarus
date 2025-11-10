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
    
    const { analysisResult } = resultState;
    const { isLoading } = uiState;

    // If the app is in a loading state, always show the main loader.
    // This takes precedence over showing a partial or placeholder result.
    if (isLoading) {
        return 'LOADING';
    }
    
    // If there's a result and we are not loading, show the result display.
    if (analysisResult) {
        return 'RESULT';
    }

    // Otherwise, show the input form.
    return 'INPUT';
};