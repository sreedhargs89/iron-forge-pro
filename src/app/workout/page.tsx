'use client';

import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { Play, CheckCircle2, Dumbbell } from 'lucide-react';

export default function WorkoutIndexPage() {
    const router = useRouter();
    const { program, currentWeek, getDayProgress } = useWorkoutStore();

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-5 pt-14">
                <div className="flex items-center gap-3 mb-1">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        <Dumbbell size={20} style={{ color: '#ef4444' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Train</h1>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Week {currentWeek} &middot; Pick a workout
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pt-5">
                <div className="grid grid-cols-2 gap-3">
                    {program.days.map((day, idx) => {
                        const progress = getDayProgress(currentWeek, day.id);
                        const isComplete = progress === 100;

                        return (
                            <div
                                key={day.id}
                                onClick={() => router.push(`/workout/${day.id}`)}
                                className="cursor-pointer relative overflow-hidden rounded-2xl transition-all active:scale-[0.97] animate-fade-in"
                                style={{
                                    animationDelay: `${idx * 0.05}s`,
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isComplete ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                                }}
                            >
                                {/* Top gradient */}
                                <div
                                    className="absolute inset-0 opacity-[0.07]"
                                    style={{
                                        background: `linear-gradient(135deg, ${day.color}, transparent 60%)`
                                    }}
                                />

                                <div className="relative p-4 pb-3.5">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                        style={{ background: isComplete ? 'rgba(34, 197, 94, 0.12)' : `${day.color}12` }}
                                    >
                                        <span className="text-2xl">{day.emoji}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span
                                            className="font-bold text-[15px]"
                                            style={{ color: isComplete ? '#22c55e' : '#fafafa' }}
                                        >
                                            {day.name}
                                        </span>
                                        {isComplete && <CheckCircle2 size={14} style={{ color: '#22c55e' }} />}
                                    </div>
                                    <div className="text-[11px] text-[var(--color-text-muted)] mb-3 leading-snug">
                                        {day.muscles}
                                    </div>

                                    {isComplete ? (
                                        <div
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                            style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}
                                        >
                                            <CheckCircle2 size={12} />
                                            Completed
                                        </div>
                                    ) : progress > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%`, background: day.color }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-semibold" style={{ color: day.color }}>
                                                {progress}%
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                            style={{ background: `${day.color}12`, color: day.color }}
                                        >
                                            <Play size={10} fill="currentColor" />
                                            Start
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
