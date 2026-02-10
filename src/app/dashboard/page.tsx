'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { ChevronLeft, ChevronRight, Play, CheckCircle2, Zap, Trophy, Target } from 'lucide-react';

function ProgressRing({ progress, size = 64, strokeWidth = 5, color = '#ef4444' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - progress / 100);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
        </svg>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { program, currentWeek, setCurrentWeek, getWeekProgress, getDayProgress } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const weekProgress = getWeekProgress(currentWeek);
    const completedDays = program.days.filter(d => getDayProgress(currentWeek, d.id) === 100).length;
    const phaseName = currentWeek <= 4 ? 'Foundation' : currentWeek <= 8 ? 'Build' : 'Peak';
    const phaseColor = currentWeek <= 4 ? '#ef4444' : currentWeek <= 8 ? '#f97316' : '#22c55e';

    return (
        <div className="pb-24 safe-area-bottom">
            {/* Hero Header */}
            <div
                className="px-5 pt-14 pb-6 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%)',
                }}
            >
                {/* Decorative gradient orb */}
                <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }}
                />

                <div className="flex justify-between items-start relative">
                    <div>
                        <h1
                            className="text-3xl font-black tracking-tight"
                            style={{
                                background: 'linear-gradient(135deg, #fafafa, #71717a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            IRON FORGE
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${phaseColor}20`, color: phaseColor }}
                            >
                                {phaseName} Phase
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                                12-Week Program
                            </span>
                        </div>
                    </div>

                    {/* Week Selector */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2.5 py-1.5"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <button
                            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                            className="p-0.5 rounded-md transition-colors"
                            disabled={currentWeek <= 1}
                            style={{ opacity: currentWeek <= 1 ? 0.3 : 1 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="text-center min-w-[40px]">
                            <div className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                                W{currentWeek}
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentWeek(Math.min(12, currentWeek + 1))}
                            className="p-0.5 rounded-md transition-colors"
                            disabled={currentWeek >= 12}
                            style={{ opacity: currentWeek >= 12 ? 0.3 : 1 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5">
                {/* Stats Row */}
                <div
                    className="flex items-center justify-between rounded-2xl p-4 mb-6"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ProgressRing progress={weekProgress} size={56} strokeWidth={4} color="#ef4444" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {weekProgress}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Week {currentWeek} Progress</div>
                            <div className="text-xs text-[var(--color-text-muted)]">
                                {completedDays} of {program.days.length} workouts done
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl mb-1" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <Zap size={16} style={{ color: '#ef4444' }} />
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">W{currentWeek}</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl mb-1" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                <Trophy size={16} style={{ color: '#22c55e' }} />
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">{completedDays}/{program.days.length}</div>
                        </div>
                    </div>
                </div>

                {/* Workout Days */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wider uppercase">
                        Today&apos;s Split
                    </h2>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                        {completedDays}/{program.days.length} complete
                    </span>
                </div>

                <div className="space-y-2.5">
                    {program.days.map((day, idx) => {
                        const progress = getDayProgress(currentWeek, day.id);
                        const isComplete = progress === 100;

                        return (
                            <div
                                key={day.id}
                                className="animate-fade-in cursor-pointer rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
                                style={{
                                    animationDelay: `${idx * 0.04}s`,
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                                }}
                                onClick={() => router.push(`/workout/${day.id}`)}
                            >
                                <div className="flex items-center px-4 py-3.5">
                                    {/* Left accent bar */}
                                    <div
                                        className="w-1 h-10 rounded-full mr-3.5 flex-shrink-0"
                                        style={{
                                            background: isComplete
                                                ? '#22c55e'
                                                : `linear-gradient(180deg, ${day.color}, ${day.color}60)`,
                                        }}
                                    />

                                    {/* Icon */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
                                        style={{
                                            background: isComplete ? 'rgba(34, 197, 94, 0.12)' : `${day.color}15`,
                                        }}
                                    >
                                        <span className="text-lg">{day.emoji}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[15px]" style={{ color: isComplete ? '#22c55e' : '#fafafa' }}>
                                                {day.name}
                                            </span>
                                            {isComplete && <CheckCircle2 size={14} style={{ color: '#22c55e' }} />}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                                            {day.muscles}
                                        </div>
                                    </div>

                                    {/* Right: Progress or Action */}
                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                        {progress > 0 && progress < 100 && (
                                            <div className="relative w-8 h-8">
                                                <ProgressRing progress={progress} size={32} strokeWidth={3} color={day.color} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[9px] font-bold" style={{ color: day.color }}>
                                                        {progress}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {!isComplete && progress === 0 && (
                                            <div
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                style={{
                                                    background: `${day.color}15`,
                                                    color: day.color,
                                                }}
                                            >
                                                <Play size={10} fill="currentColor" />
                                                Go
                                            </div>
                                        )}
                                        {isComplete && (
                                            <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                                                Done
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar at bottom of card */}
                                {progress > 0 && progress < 100 && (
                                    <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{ width: `${progress}%`, background: day.color }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 mt-6">
                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <Target size={16} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {currentWeek}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Week</div>
                    </div>
                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {completedDays}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Done</div>
                    </div>
                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <Zap size={16} style={{ color: '#3b82f6' }} />
                        </div>
                        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {weekProgress}%
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Progress</div>
                    </div>
                </div>

                {/* Program Info */}
                <div
                    className="mt-6 rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-2 uppercase">
                        6-Day Split
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        Push &rarr; Pull &rarr; Legs &rarr; Rest &rarr; Upper &rarr; Lower &rarr; Core+Arms &rarr; Rest
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
