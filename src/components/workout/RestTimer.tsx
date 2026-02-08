'use client';

// ═══════════════════════════════════════════════════════════════════════════
// REST TIMER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

interface RestTimerProps {
    seconds: number;
    onComplete?: () => void;
}

export default function RestTimer({ seconds, onComplete }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const start = () => {
        if (isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            return;
        }

        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setIsRunning(false);
                    onComplete?.();
                    return seconds;
                }
                return t - 1;
            });
        }, 1000);
    };

    const reset = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setTimeLeft(seconds);
    };

    const pct = ((seconds - timeLeft) / seconds) * 100;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;

    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference * (1 - pct / 100);

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-11 h-11">
                <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />
                    <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={isRunning ? '#4ADE80' : 'rgba(255,255,255,0.3)'}
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 22 22)"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div
                    className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                    style={{
                        color: isRunning ? '#4ADE80' : '#ccc',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    {min}:{String(sec).padStart(2, '0')}
                </div>
            </div>

            <button
                onClick={start}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                style={{
                    background: isRunning ? '#EF4444' : '#4ADE80',
                    color: isRunning ? '#fff' : '#000',
                }}
            >
                {isRunning ? '⏸' : '▶'}
            </button>

            {timeLeft !== seconds && (
                <button
                    onClick={reset}
                    className="px-2 py-1 rounded-md text-[10px] transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: '#999',
                    }}
                >
                    ↺
                </button>
            )}
        </div>
    );
}
