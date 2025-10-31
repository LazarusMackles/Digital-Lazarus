import React from 'react';
import { Header } from './components/Header';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { WelcomeModal } from './components/WelcomeModal';
import { InputForm } from './components/InputForm';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';

const AppContent: React.FC = () => {
  const { 
    isLoading, 
    analysisResult, 
    showWelcome, 
    setShowWelcome,
    theme,
    setTheme
  } = useAnalysis();

  const renderContent = () => {
    if (isLoading && !analysisResult) {
      return (
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
          <Loader />
        </div>
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
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="min-h-screen p-4 sm:p-6 md:p-8 text-slate-800 dark:text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <Header theme={theme} setTheme={setTheme} />
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
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
  );
};


export default App;