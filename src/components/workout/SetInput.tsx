'use client';

import { useState } from 'react';

interface SetInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'weight' | 'reps' | 'rpe';
}

export default function SetInput({ value, onChange, placeholder }: SetInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-[56px] px-1.5 py-2 rounded-lg text-center text-sm outline-none transition-all"
            style={{
                background: isFocused
                    ? 'rgba(59, 130, 246, 0.1)'
                    : value
                        ? 'rgba(34, 197, 94, 0.08)'
                        : 'rgba(255, 255, 255, 0.04)',
                border: `1.5px solid ${
                    isFocused
                        ? 'rgba(59, 130, 246, 0.5)'
                        : value
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)'
                }`,
                color: value ? '#fafafa' : '#52525b',
                fontFamily: 'var(--font-mono)',
                fontWeight: value ? 600 : 400,
            }}
        />
    );
}
