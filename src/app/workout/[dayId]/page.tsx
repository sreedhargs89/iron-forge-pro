'use client';

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT SESSION PAGE
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import RestTimer from '@/components/workout/RestTimer';
import SetInput from '@/components/workout/SetInput';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Clock, Dumbbell } from 'lucide-react';

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

    // Update elapsed time
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

    // Auto-start workout when page loads
    useEffect(() => {
        if (mounted && dayId && !isWorkoutActive) {
            startWorkout(dayId);
        }
    }, [mounted, dayId, isWorkoutActive, startWorkout]);

    if (!mounted || !day) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
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
        <div className="pb-6">
            {/* Header */}
            <div className="sticky top-0 z-50 glass-dark px-4 py-3">
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="btn-ghost px-3 py-1.5 rounded-lg text-sm"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back
                    </button>

                    <div className="text-center">
                        <div
                            className="text-lg font-bold flex items-center gap-2"
                            style={{ color: day.color }}
                        >
                            <span>{day.emoji}</span>
                            {day.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                            Week {currentWeek} • {day.muscles}
                        </div>
                    </div>

                    {isWorkoutActive && (
                        <div className="text-right">
                            <div
                                className="text-lg font-bold flex items-center gap-1"
                                style={{ color: '#4ADE80', fontFamily: 'var(--font-mono)' }}
                            >
                                <Clock size={14} />
                                {elapsed}m
                            </div>
                            <div className="text-[9px] text-[var(--color-text-secondary)]">ELAPSED</div>
                        </div>
                    )}

                    {!isWorkoutActive && <div className="w-16" />}
                </div>
            </div>

            {/* Exercises */}
            <div className="px-4 pt-4 space-y-2">
                {day.exercises.map((ex, exIdx) => {
                    const completed = getCompletedSets(currentWeek, day.id, ex.id, ex.sets);
                    const isExpanded = expandedExercise === ex.id;
                    const isComplete = completed === ex.sets;

                    return (
                        <div
                            key={ex.id}
                            className="card overflow-hidden animate-fade-in"
                            style={{
                                animationDelay: `${exIdx * 0.05}s`,
                                borderColor: isComplete
                                    ? 'rgba(74, 222, 128, 0.2)'
                                    : 'rgba(255, 255, 255, 0.04)',
                            }}
                        >
                            {/* Exercise Header */}
                            <div
                                onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                                className="px-4 py-3 cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[11px] font-bold min-w-[20px]"
                                            style={{ color: day.color }}
                                        >
                                            {exIdx + 1}
                                        </span>
                                        <span className="font-semibold text-[14px]">{ex.exerciseName}</span>
                                    </div>
                                    <div className="text-[11px] text-[var(--color-text-secondary)] mt-1 pl-7">
                                        {ex.muscle} • {ex.sets}×{ex.reps} • Rest {formatRest(ex.restSeconds)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-bold"
                                        style={{ color: isComplete ? '#4ADE80' : 'var(--color-text-secondary)' }}
                                    >
                                        {completed}/{ex.sets}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp size={16} className="text-[var(--color-text-secondary)]" />
                                    ) : (
                                        <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Set Logging */}
                            {isExpanded && (
                                <div
                                    className="px-4 pb-4 pt-2"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    {/* Note */}
                                    {ex.note && (
                                        <div
                                            className="text-[11px] py-2 mb-3 flex items-start gap-2"
                                            style={{ color: day.color, opacity: 0.8 }}
                                        >
                                            <span>💡</span>
                                            <span className="italic">{ex.note}</span>
                                        </div>
                                    )}

                                    {/* Set Headers */}
                                    <div
                                        className="grid gap-2 pb-2 text-[10px] text-[var(--color-text-secondary)] font-semibold tracking-wide text-center"
                                        style={{ gridTemplateColumns: '36px 1fr 1fr 1fr' }}
                                    >
                                        <span>SET</span>
                                        <span>WEIGHT</span>
                                        <span>REPS</span>
                                        <span>REST</span>
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
                                                className="grid gap-2 items-center py-1.5"
                                                style={{ gridTemplateColumns: '36px 1fr 1fr 1fr' }}
                                            >
                                                <div
                                                    className="text-center text-[13px] font-bold"
                                                    style={{ color: hasData ? '#4ADE80' : 'var(--color-text-secondary)' }}
                                                >
                                                    {hasData ? <Check size={16} className="mx-auto" /> : i + 1}
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
                <div className="px-4 mt-6">
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #4ADE80, #22C55E)',
                            color: '#000',
                        }}
                    >
                        <Check size={18} strokeWidth={3} />
                        FINISH WORKOUT
                    </button>
                </div>
            )}
        </div>
    );
}
