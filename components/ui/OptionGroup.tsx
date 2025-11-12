
import React from 'react';
import { ModeButton } from './ModeButton';

interface Option {
    value: string;
    title: string;
    description: string;
}

interface OptionGroupProps<T extends string> {
    legend: string;
    options: ReadonlyArray<Option & { value: T }>;
    selectedValue: T;
    onValueChange: (value: T) => void;
    size?: 'sm' | 'md';
}

export function OptionGroup<T extends string>({ legend, options, selectedValue, onValueChange, size = 'md' }: OptionGroupProps<T>) {
    return (
        <fieldset className="mt-6 mb-8 animate-fade-in w-full border-none p-0">
            <legend className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3 text-center w-full">{legend}</legend>
            <div className={`w-full flex flex-col sm:flex-row gap-${size === 'md' ? '4' : '2'}`}>
                {options.map((option) => (
                    <ModeButton
                        key={option.value}
                        active={selectedValue === option.value}
                        onClick={() => onValueChange(option.value)}
                        title={option.title}
                        description={option.description}
                        size={size}
                        titleStyle="gradient"
                    />
                ))}
            </div>
        </fieldset>
    );
}
