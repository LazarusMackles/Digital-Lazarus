import React, { useState, useEffect, useRef } from 'react';
import { VERDICT_COLORS } from '../utils/constants';

interface RadialProgressProps {
    progress: number;
    duration?: number;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({ progress, duration = 1000 }) => {
    const [displayProgress, setDisplayProgress] = useState(0);
    // FIX: Initialize useRef with an initial value to fix "Expected 1 arguments, but got 0" error.
    // The type is also updated to allow undefined, which matches its usage.
    const frameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const getColor = (p: number) => {
        if (p < 40) return VERDICT_COLORS.HUMAN;
        if (p < 75) return VERDICT_COLORS.MIXED;
        return VERDICT_COLORS.AI;
    };
    
    // Animate the progress value
    useEffect(() => {
        const animate = (timestamp: number) => {
            if (startTimeRef.current === undefined) {
                startTimeRef.current = timestamp;
            }
            const elapsedTime = timestamp - (startTimeRef.current ?? timestamp);
            const progressFraction = Math.min(elapsedTime / duration, 1);
            
            // Ease-out function for a smoother stop
            const easedProgress = progress * (1 - Math.pow(1 - progressFraction, 3));

            setDisplayProgress(easedProgress);

            if (elapsedTime < duration) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        startTimeRef.current = undefined; // Reset for re-renders
        setDisplayProgress(0); // Start from 0
        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [progress, duration]);

    const strokeDashoffset = circumference - (displayProgress / 100) * circumference;
    const color = getColor(progress);
    const roundedDisplayProgress = Math.round(displayProgress);

    return (
        <div 
            className="relative w-48 h-48"
            role="img"
            aria-label={`AI Probability score: ${Math.round(progress)} percent.`}
        >
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
                aria-hidden="true"
            >
                <circle
                    className="stroke-slate-200 dark:stroke-slate-700"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, strokeLinecap: 'round' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-colors duration-500"
                />
            </svg>
            <div 
                className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"
                aria-hidden="true"
            >
                <span className="text-4xl font-bold" style={{ color }}>{roundedDisplayProgress}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">AI Probability</span>
            </div>
        </div>
    );
};
