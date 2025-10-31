import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputTabs } from './components/InputTabs';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { analyzeContent } from './services/geminiService';
import type { AnalysisResult, AnalysisMode, ForensicMode } from './types';
import { ModeSelector } from './components/ModeSelector';
import { WelcomeModal } from './components/WelcomeModal';
import { ForensicModeToggle } from './components/ForensicModeToggle';
import { SpinnerIcon } from './components/icons';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [textContent, setTextContent] = useState<string>('');
  const [imageData, setImageData] = useState<string[] | null>(null);
  const [url, setUrl] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [fileNames, setFileNames] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('deep');
  const [forensicMode, setForensicMode] = useState<ForensicMode>('standard');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isChallenged, setIsChallenged] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    return 'dark';
  });

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-900');
      document.body.classList.remove('bg-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-100');
      document.body.classList.remove('bg-slate-900');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const validateUrl = (value: string): boolean => {
    if (!value) return true; // Empty is considered valid for UI state
    try {
      new URL(value);
      return value.includes('.') && !value.startsWith('http://.') && !value.startsWith('https://.');
    } catch (_) {
      // Fallback for simple validation without full URL object
      return value.includes('.') && !value.startsWith('.') && !value.endsWith('.') && !value.includes(' ');
    }
  };

  const handleAnalyze = useCallback(async () => {
    if ((!textContent.trim() && (!imageData || imageData.length === 0) && !url.trim()) || (url.trim() && !isUrlValid)) {
      setError('Mon Dieu! You must provide some valid evidence for me to analyse!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIsChallenged(false);

    try {
      const result = await analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode, isChallenge: false });
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sacre bleu! An unidentifiable error has occurred in the digital ether. Most mysterious!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [textContent, imageData, url, analysisMode, forensicMode, isUrlValid]);

  const handleChallenge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsChallenged(true);
    // Intentionally not clearing analysisResult to feel like an update
    try {
      const result = await analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode, isChallenge: true }); // Re-run in challenge mode
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sacre bleu! An unidentifiable error has occurred in the digital ether. Most mysterious!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [textContent, imageData, url, analysisMode, forensicMode]);
  
  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setIsChallenged(false);
  };
  
  const handleFilesChange = (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => {
    setTextContent('');
    setImageData(null);
    setUrl('');
    
    if (files.length > 0) {
      const names = files.map(f => f.name);
      setFileNames(names);

      const images = files.map(f => f.imageBase64).filter((b64): b64 is string => !!b64);
      if (images.length > 0) {
        setImageData(images);
      }

      const textFile = files.find(f => f.content);
      if (textFile && textFile.content) {
        setTextContent(textFile.content);
      }
    }
  };

  const handleClearFiles = () => {
    setImageData(null);
    setFileNames(null);
    setTextContent('');
  }

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsUrlValid(validateUrl(value));
  }
  
  const isInputEmpty = !textContent.trim() && (!imageData || imageData.length === 0) && !url.trim();

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
          <ResultDisplay
            result={analysisResult}
            onChallengeVerdict={handleChallenge}
            isChallenged={isChallenged}
            onNewAnalysis={handleNewAnalysis}
            isLoading={isLoading}
          />
        </div>
      );
    }

    return (
       <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
        <InputTabs
          onTextChange={setTextContent}
          onFilesChange={handleFilesChange}
          onClearFiles={handleClearFiles}
          onUrlChange={handleUrlChange}
          textContent={textContent}
          fileNames={fileNames}
          imageData={imageData}
          url={url}
          isUrlValid={isUrlValid}
        />
        
        {imageData && imageData.length > 0 && <ForensicModeToggle selectedMode={forensicMode} onModeChange={setForensicMode} />}
        
        <ModeSelector selectedMode={analysisMode} onModeChange={setAnalysisMode} />
        
        {error && <p className="my-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg animate-fade-in">{error}</p>}
        
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isInputEmpty || !isUrlValid || (isLoading && !analysisResult)}
            className={`w-full sm:w-auto px-10 py-4 text-lg font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 disabled:opacity-60 disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-wait flex items-center justify-center ${
              isLoading && !analysisResult ? 'animate-pulse-deduce' : ''
            }`}
          >
            {isLoading && !analysisResult ? (
              <>
                <SpinnerIcon className="animate-spin w-6 h-6 mr-3" />
                <span>Deducing...</span>
              </>
            ) : (
              'Deduce the Digital DNA'
            )}
          </button>
        </div>
      </div>
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

export default App;