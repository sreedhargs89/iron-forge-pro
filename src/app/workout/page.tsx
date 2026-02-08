'use client';

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT INDEX PAGE - Quick start any workout
// ═══════════════════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { Play, Check } from 'lucide-react';

export default function WorkoutIndexPage() {
    const router = useRouter();
    const { program, currentWeek, getDayProgress } = useWorkoutStore();

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-4 pt-6">
                <h1 className="text-2xl font-black mb-1">Start Workout</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                    Week {currentWeek} • Choose your workout
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {program.days.map((day) => {
                        const progress = getDayProgress(currentWeek, day.id);
                        const isComplete = progress === 100;

                        return (
                            <div
                                key={day.id}
                                onClick={() => router.push(`/workout/${day.id}`)}
                                className="card p-4 cursor-pointer text-center relative overflow-hidden"
                                style={{
                                    borderColor: isComplete
                                        ? 'rgba(74, 222, 128, 0.3)'
                                        : 'rgba(255, 255, 255, 0.04)',
                                }}
                            >
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        background: `linear-gradient(135deg, ${day.color}, transparent)`
                                    }}
                                />

                                <div className="relative">
                                    <span className="text-3xl mb-2 block">{day.emoji}</span>
                                    <div
                                        className="font-bold mb-1"
                                        style={{ color: day.color }}
                                    >
                                        {day.name}
                                    </div>
                                    <div className="text-[10px] text-[var(--color-text-secondary)] mb-3">
                                        {day.muscles}
                                    </div>

                                    <div
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                                        style={{
                                            background: isComplete
                                                ? 'rgba(74, 222, 128, 0.15)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: isComplete ? '#4ADE80' : day.color,
                                        }}
                                    >
                                        {isComplete ? (
                                            <>
                                                <Check size={12} />
                                                DONE
                                            </>
                                        ) : progress > 0 ? (
                                            `${progress}%`
                                        ) : (
                                            <>
                                                <Play size={10} fill="currentColor" />
                                                START
                                            </>
                                        )}
                                    </div>
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
