'use client';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { ChevronLeft, ChevronRight, Play, Check, Flame } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { program, currentWeek, setCurrentWeek, getWeekProgress, getDayProgress } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !program) {
        return (
            <div className="min-h-screen flex items-center justify-center pb-20">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const weekProgress = getWeekProgress(currentWeek);

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-4 pt-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1
                            className="text-2xl font-black tracking-tight"
                            style={{
                                background: 'linear-gradient(135deg, #E63946, #F4A261)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            IRON FORGE
                        </h1>
                        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                            A 12-WEEK HYPERTROPHY-FOCUSED MUSCLE BUILDING PROGRAM WITH A 6-DAY PUSH/PULL/LEGS SPLIT
                        </p>
                    </div>

                    {/* Week Selector */}
                    <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] rounded-lg px-2 py-1">
                        <button
                            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                            className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
                            disabled={currentWeek <= 1}
                        >
                            <ChevronLeft size={14} className={currentWeek <= 1 ? 'opacity-30' : ''} />
                        </button>
                        <span className="text-xs font-bold min-w-[16px] text-center">{currentWeek}</span>
                        <button
                            onClick={() => setCurrentWeek(Math.min(12, currentWeek + 1))}
                            className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
                            disabled={currentWeek >= 12}
                        >
                            <ChevronRight size={14} className={currentWeek >= 12 ? 'opacity-30' : ''} />
                        </button>
                    </div>
                </div>

                {/* Welcome Message */}
                <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.1), rgba(244, 162, 97, 0.05))',
                        border: '1px solid rgba(230, 57, 70, 0.2)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Flame size={16} style={{ color: '#F4A261' }} />
                        <span className="text-sm font-semibold">Welcome back!</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Week {currentWeek} • {weekProgress}% complete
                    </p>
                </div>

                {/* Week Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                            WEEK {currentWeek} PROGRESS
                        </span>
                        <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>
                            {weekProgress}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${weekProgress}%`,
                                background: 'linear-gradient(90deg, #E63946, #F4A261)',
                            }}
                        />
                    </div>
                </div>

                {/* Workout Days */}
                <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                    YOUR WORKOUTS
                </h2>

                <div className="space-y-2">
                    {program.days.map((day, idx) => {
                        const progress = getDayProgress(currentWeek, day.id);
                        const isComplete = progress === 100;

                        return (
                            <div
                                key={day.id}
                                className="card px-4 py-3 flex items-center justify-between animate-fade-in cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                                style={{
                                    animationDelay: `${idx * 0.05}s`,
                                    borderColor: isComplete ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                }}
                                onClick={() => router.push(`/workout/${day.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-lg"
                                        style={{ filter: isComplete ? 'none' : 'grayscale(0.3)' }}
                                    >
                                        {day.emoji}
                                    </span>
                                    <div>
                                        <div
                                            className="font-bold text-sm"
                                            style={{ color: day.color }}
                                        >
                                            {day.name}
                                        </div>
                                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                                            {day.muscles}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {progress > 0 && progress < 100 && (
                                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                                            {progress}%
                                        </span>
                                    )}

                                    <button
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        style={{
                                            background: isComplete
                                                ? 'rgba(74, 222, 128, 0.15)'
                                                : `linear-gradient(135deg, ${day.color}20, ${day.color}10)`,
                                            color: isComplete ? '#4ADE80' : day.color,
                                            border: `1px solid ${isComplete ? 'rgba(74, 222, 128, 0.3)' : day.color + '30'}`,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/workout/${day.id}`);
                                        }}
                                    >
                                        {isComplete ? (
                                            <>
                                                <Check size={12} strokeWidth={3} />
                                                DONE
                                            </>
                                        ) : (
                                            <>
                                                <Play size={10} fill="currentColor" />
                                                START
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Program Info */}
                <div
                    className="mt-6 rounded-xl p-4"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                >
                    <div className="text-[10px] font-bold text-[var(--color-text-secondary)] tracking-wide mb-2">
                        6-DAY SPLIT
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        Push → Pull → Legs → Rest → Upper → Lower → Core+Arms → Rest.
                        Repeat. Progressive overload each week. Track everything.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="card p-3 text-center">
                        <div className="text-lg font-black" style={{ color: '#E63946' }}>
                            {currentWeek}
                        </div>
                        <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">WEEK</div>
                    </div>
                    <div className="card p-3 text-center">
                        <div className="text-lg font-black" style={{ color: '#4ADE80' }}>
                            {program.days.filter(d => getDayProgress(currentWeek, d.id) === 100).length}
                        </div>
                        <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">COMPLETED</div>
                    </div>
                    <div className="card p-3 text-center">
                        <div className="text-lg font-black" style={{ color: '#457B9D' }}>
                            {weekProgress}%
                        </div>
                        <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">PROGRESS</div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
