
import React from 'react';
import { Header } from './components/Header';
import { ResultDisplay } from './components/ResultDisplay';
import { InputForm } from './components/InputForm';
import { InputStateProvider, useInputState } from './context/InputStateContext';
import { ResultStateProvider, useResultState } from './context/ResultStateContext';
import { UIStateProvider, useUIState } from './context/UIStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Card, Loader, SettingsModal, WelcomeModal, HistoryModal } from './components/ui';
import { useAppView } from './hooks/useAppView';
import { IntroPanel } from './components/IntroPanel';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { HistoryProvider } from './context/HistoryContext';
import { IconSprite } from './components/IconSprite';
import * as actions from './context/actions';

const AppContent: React.FC = () => {
  const view = useAppView();
  const { state: uiState, dispatch: uiDispatch } = useUIState();
  const { state: inputState } = useInputState();
  const { state: resultState } = useResultState();
  
  const { showWelcome, showSettingsModal, analysisStage } = uiState;
  const { analysisAngle } = inputState;
  const isSecondOpinion = resultState.analysisResult?.isSecondOpinion || false;

  const getLoaderMessage = () => {
    // Round 2: Deep Review (Global)
    if (isSecondOpinion) {
      return "Conducting Deep Review.";
    }

    // Provenance (Simplified)
    if (analysisAngle === 'provenance') {
      return "Tracing Digital Footprint.";
    }

    // Hybrid Analysis (Detailed Steps)
    if (analysisAngle === 'hybrid') {
      if (analysisStage === 'analyzing_pixels') {
        return "Analysing Pixel Structure.";
      }
      return "Correlating Findings.";
    }

    // Forensic (Simplified)
    return "Forensic Scan in Progress.";
  };

  const handleCloseWelcome = () => {
    uiDispatch({ type: actions.SET_SHOW_WELCOME, payload: false });
  };

  const handleCloseSettings = () => {
    uiDispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: false });
  };

  const renderContent = () => {
    switch (view) {
      case 'LOADING':
        return (
          <div className="max-w-2xl mx-auto w-full">
            <Card>
                <Loader 
                    message={getLoaderMessage()} 
                    analysisAngleUsed={analysisAngle}
                    isSecondOpinion={isSecondOpinion}
                    analysisStage={analysisStage}
                />
            </Card>
          </div>
        );
      case 'RESULT':
        return <ResultDisplay />;
      case 'INPUT':
      default:
        return (
          <>
            <IntroPanel />
            <div className="mt-6">
              <InputForm />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      <IconSprite />
      
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      {showSettingsModal && <SettingsModal onClose={handleCloseSettings} />}
      
      <ErrorBoundary>
        <div className="flex-grow container mx-auto px-4 py-4 sm:py-8 max-w-5xl">
          <Header />
          <main className="w-full">
              {renderContent()}
          </main>
        </div>
      </ErrorBoundary>
      
      <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} Sleuther Vanguard. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <HistoryProvider>
        <UIStateProvider>
          <InputStateProvider>
            <ResultStateProvider>
              <AppContent />
            </ResultStateProvider>
          </InputStateProvider>
        </UIStateProvider>
      </HistoryProvider>
    </ApiKeyProvider>
  );
};

export default App;
