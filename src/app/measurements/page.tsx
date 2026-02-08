'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settings-store';
import { db, BodyMeasurement } from '@/lib/db/schema';
import BottomNav from '@/components/layout/BottomNav';
import { v4 as uuid } from 'uuid';
import {
    ArrowLeft, Plus, Save, Calendar, TrendingUp, TrendingDown,
    Ruler, Scale, X
} from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_USER_ID = 'default-user';

interface MeasurementField {
    key: keyof BodyMeasurement;
    label: string;
    group: 'upper' | 'core' | 'lower';
}

const measurementFields: MeasurementField[] = [
    { key: 'neck', label: 'Neck', group: 'upper' },
    { key: 'shoulders', label: 'Shoulders', group: 'upper' },
    { key: 'chest', label: 'Chest', group: 'upper' },
    { key: 'leftArm', label: 'Left Arm', group: 'upper' },
    { key: 'rightArm', label: 'Right Arm', group: 'upper' },
    { key: 'leftForearm', label: 'L. Forearm', group: 'upper' },
    { key: 'rightForearm', label: 'R. Forearm', group: 'upper' },
    { key: 'waist', label: 'Waist', group: 'core' },
    { key: 'hips', label: 'Hips', group: 'core' },
    { key: 'leftThigh', label: 'Left Thigh', group: 'lower' },
    { key: 'rightThigh', label: 'Right Thigh', group: 'lower' },
    { key: 'leftCalf', label: 'Left Calf', group: 'lower' },
    { key: 'rightCalf', label: 'Right Calf', group: 'lower' },
];

export default function MeasurementsPage() {
    const router = useRouter();
    const { settings } = useSettingsStore();
    const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadMeasurements();
    }, []);

    const loadMeasurements = async () => {
        try {
            const data = await db.bodyMeasurements
                .where('userId')
                .equals(DEFAULT_USER_ID)
                .reverse()
                .sortBy('date');
            setMeasurements(data);
        } catch (error) {
            console.error('Failed to load measurements:', error);
        }
    };

    const handleSave = async () => {
        const measurement: BodyMeasurement = {
            id: uuid(),
            userId: DEFAULT_USER_ID,
            date: new Date(),
            ...newMeasurement,
            createdAt: new Date(),
        } as BodyMeasurement;

        try {
            await db.bodyMeasurements.add(measurement);
            setMeasurements([measurement, ...measurements]);
            setIsAdding(false);
            setNewMeasurement({});
        } catch (error) {
            console.error('Failed to save measurement:', error);
        }
    };

    const getLatestValue = (key: keyof BodyMeasurement): number | undefined => {
        if (measurements.length === 0) return undefined;
        return measurements[0][key] as number | undefined;
    };

    const getPreviousValue = (key: keyof BodyMeasurement): number | undefined => {
        if (measurements.length < 2) return undefined;
        return measurements[1][key] as number | undefined;
    };

    const getChange = (key: keyof BodyMeasurement): { value: number; direction: 'up' | 'down' | 'same' } | null => {
        const current = getLatestValue(key);
        const previous = getPreviousValue(key);
        if (current === undefined || previous === undefined) return null;
        const diff = current - previous;
        if (diff === 0) return { value: 0, direction: 'same' };
        return { value: Math.abs(diff), direction: diff > 0 ? 'up' : 'down' };
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const unit = settings?.heightUnit === 'ft-in' ? 'in' : 'cm';

    const renderFieldGroup = (group: 'upper' | 'core' | 'lower', label: string) => (
        <div className="mb-4">
            <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-2 uppercase">
                {label} ({unit})
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
                {measurementFields.filter(f => f.group === group).map(field => (
                    <div key={field.key}>
                        <label className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1 block">
                            {field.label}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            className="input text-sm"
                            placeholder="0.0"
                            value={(newMeasurement[field.key] as number) || ''}
                            onChange={e => setNewMeasurement({
                                ...newMeasurement,
                                [field.key]: parseFloat(e.target.value) || undefined
                            })}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-5 pt-14">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-1 text-[var(--color-text-secondary)]"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                            >
                                <Ruler size={20} style={{ color: '#3b82f6' }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black">Measurements</h1>
                                <p className="text-[11px] text-[var(--color-text-muted)]">Track body progress</p>
                            </div>
                        </div>
                    </div>

                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                color: '#fff',
                            }}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    )}
                </div>

                {/* Add New Measurement Form */}
                {isAdding && (
                    <div
                        className="rounded-2xl p-5 mb-6 animate-fade-in"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={15} style={{ color: '#3b82f6' }} />
                                <span className="text-sm font-semibold">
                                    {format(new Date(), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <button
                                onClick={() => { setIsAdding(false); setNewMeasurement({}); }}
                                className="p-1 text-[var(--color-text-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body Weight & Fat */}
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                            <div>
                                <label className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1 block">
                                    Weight ({settings?.weightUnit || 'lbs'})
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input text-sm"
                                    placeholder="0.0"
                                    value={newMeasurement.weight || ''}
                                    onChange={e => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1 block">
                                    Body Fat %
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input text-sm"
                                    placeholder="0.0"
                                    value={newMeasurement.bodyFatPercentage || ''}
                                    onChange={e => setNewMeasurement({ ...newMeasurement, bodyFatPercentage: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                        </div>

                        {renderFieldGroup('upper', 'Upper Body')}
                        {renderFieldGroup('core', 'Core')}
                        {renderFieldGroup('lower', 'Lower Body')}

                        {/* Notes */}
                        <div className="mb-5">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1 block">
                                Notes
                            </label>
                            <textarea
                                className="input min-h-[72px] text-sm"
                                placeholder="Optional notes..."
                                value={newMeasurement.notes || ''}
                                onChange={e => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => { setIsAdding(false); setNewMeasurement({}); }}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff',
                                }}
                            >
                                <Save size={16} />
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Latest Measurements Summary */}
                {measurements.length > 0 && !isAdding && (
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider mb-3 uppercase">
                            Latest &middot; {format(new Date(measurements[0].date), 'MMM d, yyyy')}
                        </h2>

                        {/* Weight & Body Fat Cards */}
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                            <div
                                className="rounded-2xl p-4 text-center"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Scale size={16} style={{ color: '#3b82f6' }} />
                                </div>
                                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {measurements[0].weight || '--'}
                                </div>
                                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                    Weight ({settings?.weightUnit || 'lbs'})
                                </div>
                            </div>
                            <div
                                className="rounded-2xl p-4 text-center"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                                    <span className="text-sm">%</span>
                                </div>
                                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {measurements[0].bodyFatPercentage || '--'}
                                </div>
                                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                    Body Fat %
                                </div>
                            </div>
                        </div>

                        {/* Circumference Grid */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            {measurementFields.map((field, idx) => {
                                const value = measurements[0][field.key] as number | undefined;
                                const change = getChange(field.key);

                                if (!value) return null;

                                return (
                                    <div
                                        key={field.key}
                                        className="flex items-center justify-between px-4 py-3"
                                        style={{
                                            background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.035)',
                                        }}
                                    >
                                        <span className="text-sm text-[var(--color-text-secondary)]">{field.label}</span>
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {value} {unit}
                                            </span>
                                            {change && change.direction !== 'same' && (
                                                <span
                                                    className="text-[10px] font-semibold flex items-center gap-0.5"
                                                    style={{ color: change.direction === 'up' ? '#22c55e' : '#ef4444' }}
                                                >
                                                    {change.direction === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                    {change.value.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* History */}
                {measurements.length > 1 && !isAdding && (
                    <div>
                        <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider mb-3 uppercase">
                            History
                        </h2>
                        <div className="space-y-2">
                            {measurements.slice(1).map(m => (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Calendar size={14} style={{ color: '#52525b' }} />
                                        <span className="text-sm">{format(new Date(m.date), 'MMM d, yyyy')}</span>
                                    </div>
                                    <span className="text-sm text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {m.weight ? `${m.weight} ${settings?.weightUnit || 'lbs'}` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {measurements.length === 0 && !isAdding && (
                    <div className="text-center py-20">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'rgba(59, 130, 246, 0.08)' }}
                        >
                            <Ruler size={32} style={{ color: '#3b82f6', opacity: 0.6 }} />
                        </div>
                        <h2 className="text-lg font-bold mb-1">No Measurements</h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            Track body measurements to see progress
                        </p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                color: '#fff',
                            }}
                        >
                            Add First Measurement
                        </button>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
