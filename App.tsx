

import React from 'react';
import { Header } from './components/Header';
import { ResultDisplay } from './components/ResultDisplay';
import { WelcomeModal } from './components/WelcomeModal';
import { InputForm } from './components/InputForm';
import { InputStateProvider } from './context/InputStateContext';
import { ResultStateProvider, useResultState } from './context/ResultStateContext';
import { UIStateProvider, useUIState } from './context/UIStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as actions from './context/actions';
import { Card, Loader, SettingsModal } from './components/ui';
import { useAppView } from './hooks/useAppView';
import { IntroPanel } from './components/IntroPanel';
import { ApiKeyProvider } from './context/ApiKeyContext';

const IconSprite: React.FC = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-0 h-0">
    <defs>
      <symbol id="icon-arrow-path" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99" />
      </symbol>
      <symbol id="icon-chat-bubble-oval-left-ellipsis" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.423l-1.684.732a.75.75 0 0 1-.842-.842l.732-1.684a9.76 9.76 0 0 1-.423-2.53C5.25 7.444 9.28 3.75 14.25 3.75c4.97 0 9 3.694 9 8.25Z" />
      </symbol>
      <symbol id="icon-chevron-down" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </symbol>
      <symbol id="icon-envelope" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </symbol>
      <symbol id="icon-information-circle" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </symbol>
       <symbol id="icon-key" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21 8.25Z" />
      </symbol>
       <symbol id="icon-magnifying-glass" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </symbol>
      <symbol id="icon-link" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </symbol>
       <symbol id="icon-light-bulb" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311V21m-3.75 0h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1.5m3.75 0v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1.5m-6.375 7.375a12.057 12.057 0 0 1-4.5 0m3.75 2.311V21m-3.75 0h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1.5m3.75 0v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1.5M9 6.75a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v.75M9 7.5h6" />
      </symbol>
      <symbol id="icon-moon" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </symbol>
      <symbol id="icon-spinner" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </symbol>
      <symbol id="icon-sun" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </symbol>
      <symbol id="icon-thumbs-up" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.422 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 3v2.154c0 .414.21 .790.528 1.005 1.454.772 2.756 2.242 3.298 4.03a.75.75 0 01-.42 1.005l-.353.176c-.86.43-1.737.75-2.651.975v.008c.375.362.625.864.625 1.41a2.25 2.25 0 01-2.25 2.25H7.5A2.25 2.25 0 015.25 15V5.25A2.25 2.25 0 017.5 3h.001c.621 0 1.22.218 1.694.604a1.861 1.861 0 00.98 1.106c.343.172.695.31 1.05.409.356.1.71.196 1.064.292V10.5c-1.158-.28-2.327-.518-3.5-.687V15" />
      </symbol>
      <symbol id="icon-upload" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75M3.75 16.5a2.25 2.25 0 01-2.25-2.25V6.75c0-1.24 1.01-2.25 2.25-2.25h16.5c1.24 0 2.25 1.01 2.25 2.25v7.5c0 1.24-1.01 2.25-2.25 2.25H3.75z" />
      </symbol>
      <symbol id="icon-x-mark" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </symbol>
    </defs>
  </svg>
));

const AppContent: React.FC = () => {
  const { state: resultState } = useResultState();
  const { state: uiState, dispatch: uiDispatch } = useUIState();
  const view = useAppView();

  const { 
    analysisResult,
    analysisAngleUsed,
  } = resultState;
  
  const { analysisStage, showWelcome, showSettingsModal } = uiState;

  const handleCloseWelcome = () => uiDispatch({ type: actions.SET_SHOW_WELCOME, payload: false });
  const handleCloseSettings = () => uiDispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: false });

  const renderContent = () => {
    switch (view) {
      case 'LOADING': {
        let loaderMessage = "Deducing the Digital DNA ...";
        if (analysisResult?.isSecondOpinion) {
            loaderMessage = "Re-analysing with a critical eye ...";
        } else if (analysisStage === 'analyzing_pixels') {
            loaderMessage = "Scanning pixels...";
        } else if (analysisStage === 'analyzing_context') {
            loaderMessage = "Interpreting context...";
        }

        return (
          <Card>
            <Loader 
              message={loaderMessage} 
              analysisAngleUsed={analysisAngleUsed}
            />
          </Card>
        );
      }
      case 'RESULT':
        return (
          <div className="animate-fade-in-up">
            <ResultDisplay />
          </div>
        );
      case 'INPUT':
      default:
        return <InputForm />;
    }
  };

  return (
    <>
      <IconSprite />
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      {showSettingsModal && <SettingsModal onClose={handleCloseSettings} />}
      <div className="min-h-screen grid grid-rows-[auto_1fr] max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 dark:text-white transition-colors duration-300">
          <div>
            <Header />
            {(view === 'INPUT' || view === 'LOADING') && <IntroPanel />}
          </div>
          <main className={view === 'RESULT' ? 'mt-8' : 'mt-12'}>
            {renderContent()}
          </main>
      </div>
    </>
  );
};


const App: React.FC = () => {
  return (
    <ApiKeyProvider>
        <InputStateProvider>
          <UIStateProvider>
            <ResultStateProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </ResultStateProvider>
          </UIStateProvider>
        </InputStateProvider>
    </ApiKeyProvider>
  );
};


export default App;