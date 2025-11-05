
import React from 'react';
import type { Scenario } from '../types';
import { CompositeIcon, ImageIcon } from './icons/index';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';


// A small, public-domain AI-generated image of an astronaut cat.
// FIX: The previous base64 string was causing issues. Replaced with a new, smaller, and validated image.
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
    const { dispatch } = useInputState();

    const handleClick = () => {
        dispatch({ type: actions.LOAD_SCENARIO, payload: scenario });
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