'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

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

    const size = 40;
    const strokeWidth = 3;
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference * (1 - pct / 100);

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={start}
                className="relative flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={isRunning ? '#22c55e' : 'rgba(255,255,255,0.2)'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        color: isRunning ? '#22c55e' : '#a1a1aa',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 600,
                    }}
                >
                    {min}:{String(sec).padStart(2, '0')}
                </div>
            </button>

            {(isRunning || timeLeft !== seconds) && (
                <button
                    onClick={reset}
                    className="p-1 rounded-md transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}
                >
                    <RotateCcw size={12} />
                </button>
            )}
        </div>
    );
}
