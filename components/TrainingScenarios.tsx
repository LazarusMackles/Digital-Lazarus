
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import type { Scenario } from '../types';
import { CompositeIcon, ImageIcon } from './icons/index';

// A small, public-domain AI-generated image of an astronaut cat
const EXAMPLE_IMAGE_BASE64 = 'data:image/png;base64,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';
const EXAMPLE_IMAGE_FILENAME = 'ai_astronaut_cat.png';

const SCENARIOS: Scenario[] = [
    {
        title: 'Composite Text Analysis',
        description: 'See how Sleuther identifies human-written text that contains an AI-generated block.',
        icon: <CompositeIcon className="w-8 h-8" />,
        inputType: 'text',
        analysisMode: 'deep',
        payload: {
            text: `You know, I was messing around with one of those new AI assistants the other day, and I wanted to see if it could handle a really complex topic. I figured, "what's more complex than the history of ancient Rome?"

So, I gave it a simple prompt: "Write a brief summary of the Roman Republic." Here’s the unedited text it spat out:

"The Roman Republic, established in 509 BCE following the overthrow of the monarchy, was characterized by a complex republican form of government. Power was vested in elected officials, notably the two consuls, and the Senate, an advisory body of patricians that wielded significant influence. Its history is marked by territorial expansion through a series of conflicts, including the Punic Wars against Carthage and the conquest of the Hellenistic kingdoms. Internal strife, however, eventually led to its demise, culminating in a series of civil wars and the rise of Julius Caesar, which precipitated the transition to the Roman Empire in 27 BCE."

Pretty impressive, right? It's a bit dry, like a textbook, but it got all the key facts in there. I'm still not sure it could write with real personality, but for a quick summary, it's not bad at all.`
        }
    },
    {
        title: 'AI Image Forensics',
        description: 'Examine a purely AI-generated image to see what clues the system can uncover.',
        icon: <ImageIcon className="w-8 h-8" />,
        inputType: 'file',
        analysisMode: 'deep',
        payload: {
            files: [{ name: EXAMPLE_IMAGE_FILENAME, imageBase64: EXAMPLE_IMAGE_BASE64 }]
        }
    }
];

const ScenarioCard: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    const { dispatch } = useAnalysis();

    const handleClick = () => {
        dispatch({ type: 'LOAD_SCENARIO', payload: scenario });
        // Optional: Scroll to the input area after loading.
        const inputArea = document.getElementById('input-area');
        if(inputArea) {
            inputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <button
            onClick={handleClick}
            className="flex-1 group bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transform hover:-translate-y-0.5 transition-all duration-300 text-left flex items-center gap-4"
        >
            <div className="flex-shrink-0 text-cyan-600 dark:text-cyan-400 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md group-hover:scale-105 transition-transform">
                {scenario.icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{scenario.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{scenario.description}</p>
            </div>
        </button>
    );
};


export const TrainingScenarios: React.FC = React.memo(() => {
    return (
        <div className="mb-8">
            <h3 className="text-center text-sm font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-4">
                Training Scenarios: See Sleuther in Action
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
                {SCENARIOS.map(scenario => <ScenarioCard key={scenario.title} scenario={scenario} />)}
            </div>
        </div>
    );
});