
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import type { Scenario } from '../types';
import { CompositeIcon, ImageIcon } from './icons/index';

// A small, public-domain AI-generated image of an astronaut cat.
// FIX: Replaced the diagnostic 1x1 pixel with a new, validated base64 string for the astronaut cat image.
const EXAMPLE_IMAGE_BASE64 = 'data:image/png;base64,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B3jyySdp3rw5eXl5fPTRR7Ro0QK9Xo/hcJgyZQpz585l7NixfPnllwDUrl2b/Px8XnvtNXbu3ElNTQ2tW7dmyZIlTJgwgS1btjB37ly6dOnClClT+PLLL6mtreX+++/H29u7v78fPz8/mpqavPvuu5SXl9OsWTOampo4deoUqamp5Obmsm3bNmxtrba+Lq2tlba+Rnt7e1tbW2trK21/d9ubW9u729pbW9vb+rpb27pbW7v7u9r/bntrW2vrm9tbm1tb6+z+8v62tn/zS/4nAB9//DGTJk0C8MADD7By5UoAY8eOZf369QwYMIDNmzdjNptZvHgxM2fOZNiwYbzzzjv069cPIYTjx4/TrVs3Vq5cyYcffsgf/vAHLl68SKdOnTh58qQTJ07w9ttv8+abb7Jnzx6cnZ15/vnnuXLlCiNGjGDcuHEopaxZs4YOHToQERGByWSC0WjEYDBYv349a9eu5Z577mHp0qUMHz6cfv36MWTIEPz9/fnoo4+YPXs2CxcuZNq0adxyyy1MmjSJoqIiTp06BWDJkiUolQ4cOJBly5Zxyy23MGvWLPr160dSUtLo9Xq8vb25dOkSRqNxy5Yt7Nu3j6VLl/K///0vzzzzDOPGjaNVq1YAwOjoKJIkAQDA6OgoAMDI6CgAwKioKACAiIgIAKDX6/H19aVer9+/fz9aWloAwOjoKAj012vj/496vV6v11/04V+/9q/j/e+vBw8ebM+ePezfv5/hw4ezcOFCli5dymeffcbMmTOZP38+9vb2JCYm8uKLL3L06FG++uor9u/fz4wZM/jlL3/JddddR11dndOnTxMSEsLYsWPZv38/+fn5nD17lpycHPr168erV6+YO3cuJSUlFBYWsn79el544QVOnjzJxIkTaTKZHDp0iHHjxhEbG4sQwqxZs6hfvz4jR46kqKiI7du3895779GlSxdycnL417/+haurK61bt+aJJ55g0KBBDAYDV199NYIg4OPjQ1paGo2NjQwZMkT37t1xOBwyZ84c8vPz2bt3L0899RRbtmzh/vvvp2nTpkydOpUBAwYwYcIEvvrqK2xtbeWv/S8lJSV27drF0aNHefrppxk/fjxarZY1a9Ywf/58jh49yrp164hPz3/85z8ZOnQoqampfPvtt1y9epXZs2fj4+ODiIgI3nnnHZqamlixYgUDBw6kqKgIURRxcXHh/fffp3v37vzzz8W5uQ9sY8u21raW5ubm5mbX3/sfgQ9eP72G+x0AAAAASUVORK5CYII=';
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
