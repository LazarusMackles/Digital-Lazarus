
import React from 'react';
import { Header } from './components/Header';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { WelcomeModal } from './components/WelcomeModal';
import { InputForm } from './components/InputForm';
import { InputStateProvider } from './context/InputStateContext';
import { ResultStateProvider, useResultState } from './context/ResultStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as actions from './context/actions';
import { Card } from './components/ui';

const AppContent: React.FC = () => {
  // FIX: Corrected a corrupted hook call which was causing compilation errors.
  const { state, dispatch } = useResultState();
  const { 
    isLoading, 
    analysisResult,
    isReanalyzing,
    showWelcome, 
  } = state;

  const handleCloseWelcome = () => dispatch({ type: actions.SET_SHOW_WELCOME, payload: false });

  const renderContent = () => {
    if (isLoading) {
      const loaderMessage = isReanalyzing 
        ? "Re-analysing with a critical eye ..." 
        : "Deducing the Digital DNA ...";
      return (
        <Card>
          <Loader message={loaderMessage} />
        </Card>
      );
    }

    if (analysisResult) {
      return (
        <div className="animate-fade-in-up">
          <ResultDisplay />
        </div>
      );
    }

    return (
       <InputForm />
    );
  };

  return (
    <>
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      <div className="min-h-screen p-4 sm:p-6 md:p-8 dark:text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <Header />
          <main className="mt-12">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
};


const App: React.FC = () => {
  return (
    <InputStateProvider>
      <ResultStateProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ResultStateProvider>
    </InputStateProvider>
  );
};


export default App;
