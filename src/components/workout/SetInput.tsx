'use client';

// ═══════════════════════════════════════════════════════════════════════════
// SET INPUT COMPONENT - For weight/reps entry
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

interface SetInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'weight' | 'reps' | 'rpe';
}

export default function SetInput({ value, onChange, placeholder, type = 'weight' }: SetInputProps) {
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
            className="w-[52px] px-1 py-1.5 rounded-md text-center text-[13px] outline-none transition-all"
            style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${isFocused ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
                color: '#E0E0E0',
                fontFamily: 'var(--font-mono)',
            }}
        />
    );
}
