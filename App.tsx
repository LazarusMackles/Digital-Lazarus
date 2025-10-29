import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputTabs } from './components/InputTabs';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { analyzeContent } from './services/geminiService';
import type { AnalysisResult, AnalysisMode } from './types';
import { ArrowPathIcon } from './components/icons/ArrowPathIcon';
import { ModeSelector } from './components/ModeSelector';
import { WelcomeModal } from './components/WelcomeModal';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [textContent, setTextContent] = useState<string>('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('deep');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
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
      return value.includes('.') && !value.startsWith('.') && !value.endsWith('.');
    }
  };

  const handleAnalyze = useCallback(async () => {
    if ((!textContent.trim() && !imageData && !url.trim()) || (url.trim() && !isUrlValid)) {
      setError('Mon Dieu! You must provide some valid evidence for me to analyze!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeContent(textContent, imageData, url, analysisMode);
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
  }, [textContent, imageData, url, analysisMode, isUrlValid]);
  
  const handleReset = () => {
    setTextContent('');
    setImageData(null);
    setUrl('');
    setIsUrlValid(true);
    setFileName(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  const isFormValid = (textContent.trim() !== '' || imageData !== null || (url.trim() !== '' && isUrlValid));

  return (
    <>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <Header theme={theme} setTheme={setTheme} />
          <main className="mt-8">
            <div className="relative bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-cyan-500/20 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-cyan-500/10 transition-all duration-300">
              {analysisResult && (
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 z-20 p-2 text-slate-500 hover:text-slate-900 bg-slate-200/50 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
                  aria-label="Analyze new content"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              )}

              <div className="p-6 sm:p-8">
                {isLoading ? (
                  <Loader />
                ) : analysisResult ? (
                  <div className="animate-fade-in-up">
                    <ResultDisplay result={analysisResult} />
                  </div>
                ) : (
                  <>
                    <InputTabs
                      onTextChange={(text) => {
                        setTextContent(text);
                        if (imageData) setImageData(null);
                        if (fileName) setFileName(null);
                        if (url) setUrl('');
                        setIsUrlValid(true);
                      }}
                      onFileChange={(name, content, image) => {
                        setFileName(name);
                        if (url) setUrl('');
                        setIsUrlValid(true);
                        if (image) {
                          setImageData(image);
                          setTextContent('');
                        } else {
                          setTextContent(content || '');
                          setImageData(null);
                        }
                      }}
                      onUrlChange={(newUrl) => {
                          const isValid = validateUrl(newUrl);
                          setUrl(newUrl);
                          setIsUrlValid(isValid);
                          setTextContent('');
                          setImageData(null);
                          setFileName(null);
                      }}
                      textContent={textContent}
                      fileName={fileName}
                      imageData={imageData}
                      url={url}
                      isUrlValid={isUrlValid}
                    />
                    {error && <p className="mt-4 text-center text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    
                    <ModeSelector selectedMode={analysisMode} onModeChange={setAnalysisMode} />

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleAnalyze}
                        disabled={!isFormValid || isLoading}
                        className="w-full sm:w-auto px-10 py-3 text-lg font-bold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Deduce Origin!
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
          <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Gen-AI Content Sleuth. Here's to a future of clarity and brilliant collaboration.</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;