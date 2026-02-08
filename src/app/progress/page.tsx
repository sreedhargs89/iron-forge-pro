'use client';

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS PAGE - Charts, stats, and history
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Flame, BarChart3 } from 'lucide-react';

export default function ProgressPage() {
    const { program, currentWeek, getWeekProgress, getDayProgress, getTotalVolume, setCurrentWeek } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);
    const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

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

    // Calculate max volume for scaling
    const allVolumes = weeks.flatMap(w =>
        program.days.map(d => getTotalVolume(w, d.id))
    );
    const maxDayVolume = Math.max(...allVolumes, 1);

    // Calculate weekly totals
    const weeklyTotals = weeks.map(w => {
        let total = 0;
        program.days.forEach(d => {
            total += getTotalVolume(w, d.id);
        });
        return total;
    });
    const maxWeeklyVolume = Math.max(...weeklyTotals, 1);

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-4 pt-6">
                <h1 className="text-2xl font-black flex items-center gap-2 mb-6">
                    <BarChart3 size={24} className="text-[var(--color-accent-blue)]" />
                    Progress
                </h1>

                {/* 12-Week Overview Grid */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                        12-WEEK OVERVIEW
                    </h2>
                    <div className="grid grid-cols-6 gap-1.5">
                        {weeks.map(w => {
                            const p = getWeekProgress(w);
                            const isCurrentWeek = w === currentWeek;

                            return (
                                <div
                                    key={w}
                                    onClick={() => setCurrentWeek(w)}
                                    className="rounded-lg p-2 text-center cursor-pointer transition-all"
                                    style={{
                                        background: p === 100
                                            ? 'rgba(74, 222, 128, 0.15)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: isCurrentWeek
                                            ? '2px solid rgba(255, 255, 255, 0.3)'
                                            : '2px solid transparent',
                                    }}
                                >
                                    <div className="text-[9px] text-[var(--color-text-secondary)] font-semibold">WK</div>
                                    <div
                                        className="text-base font-black"
                                        style={{ color: p === 100 ? '#4ADE80' : '#fff' }}
                                    >
                                        {w}
                                    </div>
                                    <div
                                        className="text-[10px] font-semibold"
                                        style={{ color: p === 100 ? '#4ADE80' : 'var(--color-text-secondary)' }}
                                    >
                                        {p}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Volume by Day */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                        WEEK {currentWeek} VOLUME <span className="font-normal">(weight × reps)</span>
                    </h2>

                    <div className="space-y-2">
                        {program.days.map(day => {
                            const vol = getTotalVolume(currentWeek, day.id);
                            const prevVol = currentWeek > 1 ? getTotalVolume(currentWeek - 1, day.id) : 0;
                            const diff = prevVol > 0 ? Math.round(((vol - prevVol) / prevVol) * 100) : 0;
                            const barWidth = maxDayVolume > 0 ? (vol / maxDayVolume) * 100 : 0;

                            return (
                                <div key={day.id} className="flex items-center gap-3">
                                    <span
                                        className="text-xs font-semibold w-16 truncate"
                                        style={{ color: day.color }}
                                    >
                                        {day.name}
                                    </span>

                                    <div className="flex-1 h-5 bg-[rgba(255,255,255,0.04)] rounded overflow-hidden">
                                        <div
                                            className="h-full rounded transition-all duration-500"
                                            style={{
                                                width: `${barWidth}%`,
                                                background: day.color,
                                                minWidth: vol > 0 ? '4px' : '0',
                                            }}
                                        />
                                    </div>

                                    <span className="text-[11px] font-semibold w-16 text-right text-[#ccc]">
                                        {vol > 0 ? vol.toLocaleString() : '—'}
                                    </span>

                                    {diff !== 0 && vol > 0 && (
                                        <span
                                            className="text-[10px] font-semibold w-10 text-right flex items-center justify-end gap-0.5"
                                            style={{ color: diff > 0 ? '#4ADE80' : '#EF4444' }}
                                        >
                                            {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {Math.abs(diff)}%
                                        </span>
                                    )}
                                    {(diff === 0 || vol === 0) && <span className="w-10" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Total Volume Chart */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                        WEEKLY TOTAL VOLUME TREND
                    </h2>

                    <div className="flex items-end gap-[3px] h-28 p-2 bg-[rgba(255,255,255,0.02)] rounded-xl">
                        {weeks.map(w => {
                            const total = weeklyTotals[w - 1];
                            const height = maxWeeklyVolume > 0
                                ? Math.max((total / maxWeeklyVolume) * 100, 4)
                                : 4;
                            const isCurrentWeek = w === currentWeek;

                            return (
                                <div
                                    key={w}
                                    className="flex-1 flex flex-col items-center gap-1"
                                >
                                    <div
                                        className="w-full rounded-sm transition-all duration-500"
                                        style={{
                                            height: `${height}%`,
                                            background: isCurrentWeek
                                                ? 'linear-gradient(180deg, #457B9D, #264653)'
                                                : 'rgba(255, 255, 255, 0.08)',
                                        }}
                                    />
                                    <span
                                        className="text-[9px]"
                                        style={{
                                            color: isCurrentWeek ? '#fff' : 'var(--color-text-secondary)'
                                        }}
                                    >
                                        {w}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                        CURRENT WEEK STATS
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="card p-4 text-center">
                            <Calendar size={20} className="mx-auto mb-2" style={{ color: '#E63946' }} />
                            <div className="text-xl font-black">
                                {program.days.filter(d => getDayProgress(currentWeek, d.id) === 100).length}
                                <span className="text-sm font-normal text-[var(--color-text-secondary)]">/6</span>
                            </div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">WORKOUTS</div>
                        </div>

                        <div className="card p-4 text-center">
                            <Target size={20} className="mx-auto mb-2" style={{ color: '#4ADE80' }} />
                            <div className="text-xl font-black">
                                {getWeekProgress(currentWeek)}%
                            </div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">COMPLETE</div>
                        </div>

                        <div className="card p-4 text-center">
                            <Flame size={20} className="mx-auto mb-2" style={{ color: '#F4A261' }} />
                            <div className="text-xl font-black">
                                {(weeklyTotals[currentWeek - 1] / 1000).toFixed(1)}k
                            </div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">VOLUME</div>
                        </div>
                    </div>
                </div>

                {/* Program Phase Info */}
                <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                >
                    <div className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                        CURRENT PHASE
                    </div>

                    {currentWeek <= 4 && (
                        <div>
                            <div className="font-bold mb-1" style={{ color: '#E63946' }}>
                                🏗️ Foundation Phase (Weeks 1-4)
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                Focus on form and mind-muscle connection. Moderate weight. RPE 7-8.
                                Building the base for future gains.
                            </p>
                        </div>
                    )}

                    {currentWeek > 4 && currentWeek <= 8 && (
                        <div>
                            <div className="font-bold mb-1" style={{ color: '#F4A261' }}>
                                📈 Build Phase (Weeks 5-8)
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                Progressive overload. Add weight or reps each session.
                                RPE 8-9. Intensity techniques welcome.
                            </p>
                        </div>
                    )}

                    {currentWeek > 8 && (
                        <div>
                            <div className="font-bold mb-1" style={{ color: '#4ADE80' }}>
                                🏆 Peak Phase (Weeks 9-12)
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                Maximum intensity. Hit PRs. RPE 9-10 on compounds.
                                Consider a deload in week 12 if needed.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
