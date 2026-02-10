'use client';

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import { TrendingUp, TrendingDown, Calendar, Target, Flame, BarChart3 } from 'lucide-react';

export default function ProgressPage() {
    const { program, currentWeek, getWeekProgress, getDayProgress, getTotalVolume, setCurrentWeek } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);
    const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

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

    const allVolumes = weeks.flatMap(w =>
        program.days.map(d => getTotalVolume(w, d.id))
    );
    const maxDayVolume = Math.max(...allVolumes, 1);

    const weeklyTotals = weeks.map(w => {
        let total = 0;
        program.days.forEach(d => {
            total += getTotalVolume(w, d.id);
        });
        return total;
    });
    const maxWeeklyVolume = Math.max(...weeklyTotals, 1);

    const phaseName = currentWeek <= 4 ? 'Foundation' : currentWeek <= 8 ? 'Build' : 'Peak';
    const phaseColor = currentWeek <= 4 ? '#ef4444' : currentWeek <= 8 ? '#f97316' : '#22c55e';
    const phaseDesc = currentWeek <= 4
        ? 'Focus on form and mind-muscle connection. RPE 7-8.'
        : currentWeek <= 8
            ? 'Progressive overload. Add weight or reps. RPE 8-9.'
            : 'Maximum intensity. Hit PRs. RPE 9-10 on compounds.';

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-5 pt-14">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                    >
                        <BarChart3 size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Stats</h1>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Week {currentWeek} &middot; {phaseName} Phase
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <Calendar size={16} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {program.days.filter(d => getDayProgress(currentWeek, d.id) === 100).length}
                            <span className="text-sm font-normal text-[var(--color-text-muted)]">/6</span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Workouts</div>
                    </div>

                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                            <Target size={16} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {getWeekProgress(currentWeek)}%
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Complete</div>
                    </div>

                    <div
                        className="rounded-2xl p-3.5 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                            <Flame size={16} style={{ color: '#f97316' }} />
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                            {weeklyTotals[currentWeek - 1] > 0 ? `${(weeklyTotals[currentWeek - 1] / 1000).toFixed(1)}k` : '0'}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Volume</div>
                    </div>
                </div>

                {/* 12-Week Overview Grid */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider mb-3 uppercase">
                        12-Week Overview
                    </h2>
                    <div
                        className="grid grid-cols-6 gap-1.5 p-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {weeks.map(w => {
                            const p = getWeekProgress(w);
                            const isCurrentWeek = w === currentWeek;

                            return (
                                <div
                                    key={w}
                                    onClick={() => setCurrentWeek(w)}
                                    className="rounded-xl p-2 text-center cursor-pointer transition-all active:scale-95"
                                    style={{
                                        background: p === 100
                                            ? 'rgba(34, 197, 94, 0.12)'
                                            : isCurrentWeek
                                                ? 'rgba(255, 255, 255, 0.06)'
                                                : 'transparent',
                                        border: isCurrentWeek
                                            ? '1.5px solid rgba(255, 255, 255, 0.2)'
                                            : '1.5px solid transparent',
                                    }}
                                >
                                    <div
                                        className="text-sm font-bold"
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            color: p === 100 ? '#22c55e' : isCurrentWeek ? '#fafafa' : '#71717a',
                                        }}
                                    >
                                        {w}
                                    </div>
                                    <div
                                        className="text-[9px] font-semibold mt-0.5"
                                        style={{ color: p === 100 ? '#22c55e' : '#52525b' }}
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
                    <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider mb-3 uppercase">
                        Week {currentWeek} Volume
                    </h2>

                    <div
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {program.days.map(day => {
                            const vol = getTotalVolume(currentWeek, day.id);
                            const prevVol = currentWeek > 1 ? getTotalVolume(currentWeek - 1, day.id) : 0;
                            const diff = prevVol > 0 ? Math.round(((vol - prevVol) / prevVol) * 100) : 0;
                            const barWidth = maxDayVolume > 0 ? (vol / maxDayVolume) * 100 : 0;

                            return (
                                <div key={day.id}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold" style={{ color: day.color }}>
                                            {day.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {vol > 0 ? vol.toLocaleString() : '--'}
                                            </span>
                                            {diff !== 0 && vol > 0 && (
                                                <span
                                                    className="text-[10px] font-semibold flex items-center gap-0.5"
                                                    style={{ color: diff > 0 ? '#22c55e' : '#ef4444' }}
                                                >
                                                    {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                    {Math.abs(diff)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${barWidth}%`,
                                                background: `linear-gradient(90deg, ${day.color}, ${day.color}88)`,
                                                minWidth: vol > 0 ? '4px' : '0',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Total Volume Chart */}
                <div className="mb-6">
                    <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider mb-3 uppercase">
                        Volume Trend
                    </h2>

                    <div
                        className="flex items-end gap-[4px] h-32 p-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {weeks.map(w => {
                            const total = weeklyTotals[w - 1];
                            const height = maxWeeklyVolume > 0
                                ? Math.max((total / maxWeeklyVolume) * 100, 3)
                                : 3;
                            const isCurrentWeek = w === currentWeek;

                            return (
                                <div
                                    key={w}
                                    onClick={() => setCurrentWeek(w)}
                                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                                >
                                    <div
                                        className="w-full rounded-md transition-all duration-500"
                                        style={{
                                            height: `${height}%`,
                                            background: isCurrentWeek
                                                ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)'
                                                : total > 0
                                                    ? 'rgba(255, 255, 255, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '4px',
                                        }}
                                    />
                                    <span
                                        className="text-[9px] font-medium"
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            color: isCurrentWeek ? '#fafafa' : '#52525b',
                                        }}
                                    >
                                        {w}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Phase Info */}
                <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: phaseColor }}
                        />
                        <span className="text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
                            Current Phase
                        </span>
                    </div>
                    <div className="font-semibold mb-1" style={{ color: phaseColor }}>
                        {phaseName} Phase (Weeks {currentWeek <= 4 ? '1-4' : currentWeek <= 8 ? '5-8' : '9-12'})
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {phaseDesc}
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
