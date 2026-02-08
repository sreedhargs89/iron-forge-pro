'use client';

// ═══════════════════════════════════════════════════════════════════════════
// BODY MEASUREMENTS PAGE - Track circumferences and progress
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settings-store';
import { db, BodyMeasurement } from '@/lib/db/schema';
import BottomNav from '@/components/layout/BottomNav';
import { v4 as uuid } from 'uuid';
import {
    ArrowLeft, Plus, Save, Calendar, TrendingUp, TrendingDown,
    Ruler, Scale
} from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_USER_ID = 'default-user';

interface MeasurementField {
    key: keyof BodyMeasurement;
    label: string;
    icon: string;
    group: 'upper' | 'core' | 'lower';
}

const measurementFields: MeasurementField[] = [
    { key: 'neck', label: 'Neck', icon: '🔵', group: 'upper' },
    { key: 'shoulders', label: 'Shoulders', icon: '💪', group: 'upper' },
    { key: 'chest', label: 'Chest', icon: '🎯', group: 'upper' },
    { key: 'leftArm', label: 'Left Arm', icon: '💪', group: 'upper' },
    { key: 'rightArm', label: 'Right Arm', icon: '💪', group: 'upper' },
    { key: 'leftForearm', label: 'Left Forearm', icon: '✊', group: 'upper' },
    { key: 'rightForearm', label: 'Right Forearm', icon: '✊', group: 'upper' },
    { key: 'waist', label: 'Waist', icon: '⭕', group: 'core' },
    { key: 'hips', label: 'Hips', icon: '🔷', group: 'core' },
    { key: 'leftThigh', label: 'Left Thigh', icon: '🦵', group: 'lower' },
    { key: 'rightThigh', label: 'Right Thigh', icon: '🦵', group: 'lower' },
    { key: 'leftCalf', label: 'Left Calf', icon: '🦶', group: 'lower' },
    { key: 'rightCalf', label: 'Right Calf', icon: '🦶', group: 'lower' },
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
            <div className="min-h-screen flex items-center justify-center pb-20">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const unit = settings?.heightUnit === 'ft-in' ? 'in' : 'cm';

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-4 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="btn-ghost p-2 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black flex items-center gap-2">
                                <Ruler className="text-[var(--color-accent-blue)]" size={22} />
                                Body Measurements
                            </h1>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                Track your progress over time
                            </p>
                        </div>
                    </div>

                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #E63946, #F4A261)' }}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    )}
                </div>

                {/* Add New Measurement Form */}
                {isAdding && (
                    <div className="card p-4 mb-6 animate-fade-in">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-[var(--color-accent-blue)]" />
                            New Measurement - {format(new Date(), 'MMM d, yyyy')}
                        </h2>

                        {/* Body Weight & Fat */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="label">Weight ({settings?.weightUnit || 'lbs'})</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    placeholder="0.0"
                                    value={newMeasurement.weight || ''}
                                    onChange={e => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                            <div>
                                <label className="label">Body Fat %</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    placeholder="0.0"
                                    value={newMeasurement.bodyFatPercentage || ''}
                                    onChange={e => setNewMeasurement({ ...newMeasurement, bodyFatPercentage: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                        </div>

                        {/* Circumference Measurements */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                                UPPER BODY ({unit})
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {measurementFields.filter(f => f.group === 'upper').map(field => (
                                    <div key={field.key}>
                                        <label className="label">{field.icon} {field.label}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input"
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

                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                                CORE ({unit})
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {measurementFields.filter(f => f.group === 'core').map(field => (
                                    <div key={field.key}>
                                        <label className="label">{field.icon} {field.label}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input"
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

                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                                LOWER BODY ({unit})
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {measurementFields.filter(f => f.group === 'lower').map(field => (
                                    <div key={field.key}>
                                        <label className="label">{field.icon} {field.label}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input"
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

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="label">Notes (optional)</label>
                            <textarea
                                className="input min-h-[80px]"
                                placeholder="Add any notes..."
                                value={newMeasurement.notes || ''}
                                onChange={e => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewMeasurement({});
                                }}
                                className="btn-ghost flex-1 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary flex-1 py-3 rounded-lg flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #4ADE80, #22C55E)' }}
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
                        <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                            LATEST - {format(new Date(measurements[0].date), 'MMM d, yyyy')}
                        </h2>

                        {/* Weight & Body Fat Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="card p-4 text-center">
                                <Scale size={20} className="mx-auto mb-2" style={{ color: '#457B9D' }} />
                                <div className="text-2xl font-black">
                                    {measurements[0].weight || '—'}
                                </div>
                                <div className="text-[10px] text-[var(--color-text-secondary)]">
                                    WEIGHT ({settings?.weightUnit || 'lbs'})
                                </div>
                            </div>
                            <div className="card p-4 text-center">
                                <div className="text-2xl mb-2">💪</div>
                                <div className="text-2xl font-black">
                                    {measurements[0].bodyFatPercentage || '—'}%
                                </div>
                                <div className="text-[10px] text-[var(--color-text-secondary)]">
                                    BODY FAT
                                </div>
                            </div>
                        </div>

                        {/* Circumference Grid */}
                        <div className="card divide-y divide-[rgba(255,255,255,0.04)]">
                            {measurementFields.map(field => {
                                const value = measurements[0][field.key] as number | undefined;
                                const change = getChange(field.key);

                                if (!value) return null;

                                return (
                                    <div key={field.key} className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{field.icon}</span>
                                            <span className="text-sm">{field.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold">{value} {unit}</span>
                                            {change && change.direction !== 'same' && (
                                                <span
                                                    className="text-xs flex items-center gap-0.5"
                                                    style={{
                                                        color: change.direction === 'up' ? '#4ADE80' : '#EF4444'
                                                    }}
                                                >
                                                    {change.direction === 'up' ? (
                                                        <TrendingUp size={12} />
                                                    ) : (
                                                        <TrendingDown size={12} />
                                                    )}
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
                        <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3">
                            HISTORY
                        </h2>
                        <div className="space-y-2">
                            {measurements.slice(1).map(m => (
                                <div
                                    key={m.id}
                                    className="card px-4 py-3 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-[var(--color-text-secondary)]" />
                                        <span className="text-sm">{format(new Date(m.date), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="text-sm text-[var(--color-text-secondary)]">
                                        {m.weight && `${m.weight} ${settings?.weightUnit || 'lbs'}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {measurements.length === 0 && !isAdding && (
                    <div className="text-center py-16">
                        <Ruler size={48} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
                        <h2 className="text-lg font-bold mb-2">No Measurements Yet</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                            Track your body measurements to see your progress over time
                        </p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn-primary px-6 py-3 rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #E63946, #F4A261)' }}
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
