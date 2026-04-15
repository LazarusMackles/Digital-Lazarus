
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index';
import { Button } from '../ui/Button';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useApiKeys } from '../../hooks/useApiKeys';
import { cn } from '../../utils/cn';

export const OnboardingWizard: React.FC = () => {
    const { 
        hasGoogleApiKey, 
        hasHiveKeys, 
        googleApiKey, 
        hiveAccessKey, 
        hiveSecretKey,
        saveGoogleApiKey, 
        saveHiveKeys 
    } = useApiKeys();
    
    const [step, setStep] = useState(1);
    const [localGoogleKey, setLocalGoogleKey] = useState(googleApiKey || '');
    const [localHiveAccessKey, setLocalHiveAccessKey] = useState(hiveAccessKey || '');
    const [localHiveSecretKey, setLocalHiveSecretKey] = useState(hiveSecretKey || '');
    const [isComplete, setIsComplete] = useState(false);

    useBodyScrollLock();

    // If keys are already present, we might want to skip steps, 
    // but for the wizard usually we want to confirm them.
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinish = () => {
        saveGoogleApiKey(localGoogleKey.trim());
        saveHiveKeys(localHiveAccessKey.trim(), localHiveSecretKey.trim());
        setIsComplete(true);
    };

    if (isComplete) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <Icon name="information-circle" className="w-12 h-12 text-cyan-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4">
                            Activate Vanguard Sensors
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                            To ensure forensic-grade accuracy, Sleuther Vanguard requires connection to its primary power sources. 
                            We'll guide you through connecting your personal API keys.
                        </p>
                        <Button onClick={nextStep} className="w-full py-4 text-lg">
                            Begin Activation
                        </Button>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Step 1: The Neural Core</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Connect your Google Gemini API key to power the deductive reasoning engine.
                        </p>
                        
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Google AI Studio</span>
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-fuchsia-500 hover:underline flex items-center gap-1"
                                >
                                    Get Key <Icon name="arrow-top-right-on-square" className="w-3 h-3" />
                                </a>
                            </div>
                            <input 
                                type="password"
                                placeholder="Paste your Google API Key here"
                                value={localGoogleKey}
                                onChange={(e) => setLocalGoogleKey(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                            <Button onClick={nextStep} disabled={!localGoogleKey} className="flex-1">Next Step</Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Step 2: Forensic Sensors</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Connect your Hive AI keys for pixel-level mathematical verification.
                        </p>
                        
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Hive Moderation</span>
                                <a 
                                    href="https://hivemoderation.com/ai-generated-content-detection" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-fuchsia-500 hover:underline flex items-center gap-1"
                                >
                                    Get Keys <Icon name="arrow-top-right-on-square" className="w-3 h-3" />
                                </a>
                            </div>
                            <input 
                                type="text"
                                placeholder="Hive Access Key"
                                value={localHiveAccessKey}
                                onChange={(e) => setLocalHiveAccessKey(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            <input 
                                type="password"
                                placeholder="Hive Secret Key"
                                value={localHiveSecretKey}
                                onChange={(e) => setLocalHiveSecretKey(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                            <Button onClick={nextStep} disabled={!localHiveAccessKey || !localHiveSecretKey} className="flex-1">Finalize</Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fade-in text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Icon name="thumbs-up" className="w-12 h-12 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            System Ready
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            All sensors are online. Sleuther Vanguard is now operating at maximum forensic capacity.
                        </p>
                        <Button onClick={handleFinish} className="w-full py-4 text-lg bg-green-600 hover:bg-green-500">
                            Enter Command Center
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-cyan-500/30 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
                
                <div className="p-8 sm:p-12">
                    {renderStep()}
                </div>
            </div>
        </div>,
        modalRoot
    );
};
