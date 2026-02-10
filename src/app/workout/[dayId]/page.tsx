'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import RestTimer from '@/components/workout/RestTimer';
import SetInput from '@/components/workout/SetInput';
import { ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

function formatRest(seconds: number): string {
    if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${seconds}s`;
}

export default function WorkoutDayPage() {
    const params = useParams();
    const router = useRouter();
    const dayId = params.dayId as string;

    const {
        program,
        currentWeek,
        isWorkoutActive,
        workoutStartTime,
        expandedExercise,
        startWorkout,
        endWorkout,
        setExpandedExercise,
        getValue,
        setValue,
        getCompletedSets,
    } = useWorkoutStore();

    const [elapsed, setElapsed] = useState(0);
    const [mounted, setMounted] = useState(false);

    const day = program?.days.find(d => d.id === dayId);

    useEffect(() => {
        setMounted(true);

        if (!isWorkoutActive) return;

        const interval = setInterval(() => {
            if (workoutStartTime) {
                setElapsed(Math.round((Date.now() - workoutStartTime.getTime()) / 60000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isWorkoutActive, workoutStartTime]);

    useEffect(() => {
        if (mounted && dayId && !isWorkoutActive) {
            startWorkout(dayId);
        }
    }, [mounted, dayId, isWorkoutActive, startWorkout]);

    if (!mounted || !day) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleFinish = async () => {
        await endWorkout();
        router.push('/dashboard');
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    return (
        <div className="pb-8">
            {/* Header */}
            <div
                className="sticky top-0 z-50 glass-dark px-5 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="text-center">
                        <div className="flex items-center gap-2">
                            <span className="text-base">{day.emoji}</span>
                            <span className="text-base font-bold" style={{ color: day.color }}>
                                {day.name}
                            </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                            Week {currentWeek} &middot; {day.muscles}
                        </div>
                    </div>

                    {isWorkoutActive ? (
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                        >
                            <Clock size={13} style={{ color: '#22c55e' }} />
                            <span
                                className="text-sm font-bold"
                                style={{ color: '#22c55e', fontFamily: 'var(--font-mono)' }}
                            >
                                {elapsed}m
                            </span>
                        </div>
                    ) : (
                        <div className="w-14" />
                    )}
                </div>
            </div>

            {/* Exercises */}
            <div className="px-4 pt-3 space-y-2.5">
                {day.exercises.map((ex, exIdx) => {
                    const completed = getCompletedSets(currentWeek, day.id, ex.id, ex.sets);
                    const isExpanded = expandedExercise === ex.id;
                    const isComplete = completed === ex.sets;
                    const progressPct = (completed / ex.sets) * 100;

                    return (
                        <div
                            key={ex.id}
                            className="rounded-2xl overflow-hidden animate-fade-in"
                            style={{
                                animationDelay: `${exIdx * 0.04}s`,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${isComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                            }}
                        >
                            {/* Exercise Header */}
                            <div
                                onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                                className="px-4 py-3.5 cursor-pointer flex items-center gap-3"
                            >
                                {/* Number badge */}
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    style={{
                                        background: isComplete ? 'rgba(34, 197, 94, 0.15)' : `${day.color}12`,
                                        color: isComplete ? '#22c55e' : day.color,
                                    }}
                                >
                                    {isComplete ? <CheckCircle2 size={16} /> : exIdx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[14px] truncate">
                                        {ex.exerciseName}
                                    </div>
                                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                                        {ex.sets} &times; {ex.reps} &middot; {ex.muscle} &middot; Rest {formatRest(ex.restSeconds)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span
                                        className="text-xs font-bold"
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            color: isComplete ? '#22c55e' : 'var(--color-text-muted)',
                                        }}
                                    >
                                        {completed}/{ex.sets}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp size={16} style={{ color: '#52525b' }} />
                                    ) : (
                                        <ChevronDown size={16} style={{ color: '#52525b' }} />
                                    )}
                                </div>
                            </div>

                            {/* Mini progress bar */}
                            {!isExpanded && completed > 0 && (
                                <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${progressPct}%`,
                                            background: isComplete ? '#22c55e' : day.color,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Expanded Set Logging */}
                            {isExpanded && (
                                <div
                                    className="px-4 pb-4 pt-2"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    {/* Note */}
                                    {ex.note && (
                                        <div
                                            className="flex items-start gap-2 text-[11px] py-2 px-3 mb-3 rounded-lg"
                                            style={{
                                                background: `${day.color}08`,
                                                color: day.color,
                                                border: `1px solid ${day.color}15`,
                                            }}
                                        >
                                            <Info size={13} className="mt-0.5 flex-shrink-0" style={{ opacity: 0.7 }} />
                                            <span className="leading-relaxed">{ex.note}</span>
                                        </div>
                                    )}

                                    {/* Set Headers */}
                                    <div
                                        className="grid gap-2 pb-2 text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wider text-center uppercase"
                                        style={{ gridTemplateColumns: '32px 1fr 1fr 1fr' }}
                                    >
                                        <span>#</span>
                                        <span>Weight</span>
                                        <span>Reps</span>
                                        <span>Rest</span>
                                    </div>

                                    {/* Sets */}
                                    {Array.from({ length: ex.sets }, (_, i) => {
                                        const hasData = !!getValue(currentWeek, day.id, ex.id, i, 'reps');
                                        const prevWeight = currentWeek > 1
                                            ? getValue(currentWeek - 1, day.id, ex.id, i, 'weight')
                                            : '';
                                        const prevReps = currentWeek > 1
                                            ? getValue(currentWeek - 1, day.id, ex.id, i, 'reps')
                                            : '';

                                        return (
                                            <div
                                                key={i}
                                                className="grid gap-2 items-center py-1.5 rounded-lg transition-colors"
                                                style={{
                                                    gridTemplateColumns: '32px 1fr 1fr 1fr',
                                                    background: hasData ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                                                }}
                                            >
                                                <div className="flex justify-center">
                                                    {hasData ? (
                                                        <div
                                                            className="w-6 h-6 rounded-md flex items-center justify-center"
                                                            style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                                                        >
                                                            <Check size={14} style={{ color: '#22c55e' }} />
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold"
                                                            style={{ color: '#52525b', fontFamily: 'var(--font-mono)' }}
                                                        >
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-center">
                                                    <SetInput
                                                        value={getValue(currentWeek, day.id, ex.id, i, 'weight')}
                                                        onChange={(v) => setValue(currentWeek, day.id, ex.id, i, 'weight', v)}
                                                        placeholder={prevWeight || 'lbs'}
                                                        type="weight"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <SetInput
                                                        value={getValue(currentWeek, day.id, ex.id, i, 'reps')}
                                                        onChange={(v) => setValue(currentWeek, day.id, ex.id, i, 'reps', v)}
                                                        placeholder={prevReps || ex.reps}
                                                        type="reps"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <RestTimer seconds={ex.restSeconds} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Finish Button */}
            {isWorkoutActive && (
                <div className="px-5 mt-6">
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.25)',
                        }}
                    >
                        <Check size={18} strokeWidth={3} />
                        Finish Workout
                    </button>
                </div>
            )}
        </div>
    );
}
