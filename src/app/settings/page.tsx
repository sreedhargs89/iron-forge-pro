'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore, formatHeight } from '@/lib/store/settings-store';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import {
    Scale, Ruler, Target, Bell, Calendar,
    Trash2, Download, ChevronRight,
    Moon, Sun, Dumbbell, Settings, X
} from 'lucide-react';

const DEFAULT_USER_ID = 'default-user';

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-5">
            <h2 className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-2 px-1 uppercase">
                {title}
            </h2>
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                {children}
            </div>
        </div>
    );
}

function SettingsRow({ icon, label, value, onClick, danger }: {
    icon: React.ReactNode;
    label: string;
    value?: string | React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3.5 transition-colors ${onClick ? 'cursor-pointer active:bg-[rgba(255,255,255,0.03)]' : ''}`}
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                        background: danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.06)',
                        color: danger ? '#ef4444' : '#71717a',
                    }}
                >
                    {icon}
                </div>
                <span
                    className="text-[14px] font-medium"
                    style={{ color: danger ? '#ef4444' : '#fafafa' }}
                >
                    {label}
                </span>
            </div>
            {value !== undefined && (
                <div className="flex items-center gap-2">
                    {typeof value === 'string' ? (
                        <span className="text-sm text-[var(--color-text-muted)]">{value}</span>
                    ) : value}
                    {onClick && <ChevronRight size={16} style={{ color: '#52525b' }} />}
                </div>
            )}
        </div>
    );
}

function SegmentControl({ options, value, onChange }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={(e) => { e.stopPropagation(); onChange(opt.value); }}
                    className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                    style={{
                        background: value === opt.value ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                        color: value === opt.value ? '#ef4444' : '#71717a',
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { settings, updateSettings } = useSettingsStore();
    const { resetAllData } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleResetData = async () => {
        if (confirm('Reset ALL workout data? This cannot be undone.')) {
            await resetAllData(DEFAULT_USER_ID);
            router.refresh();
        }
    };

    const handleExportData = () => {
        const workoutData = localStorage.getItem(`iron-forge-workout-data-${DEFAULT_USER_ID}`);
        const exportData = {
            exportDate: new Date().toISOString(),
            settings,
            workoutData: workoutData ? JSON.parse(workoutData) : {},
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iron-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const startEdit = (field: string, currentValue: string | number | undefined) => {
        setEditingField(field);
        setEditValue(String(currentValue || ''));
    };

    const saveEdit = async () => {
        if (!editingField) return;
        const updates: Record<string, unknown> = {};
        switch (editingField) {
            case 'bodyWeight': updates.bodyWeight = parseFloat(editValue) || undefined; break;
            case 'height': updates.height = parseFloat(editValue) || undefined; break;
            case 'targetWeight': updates.targetWeight = parseFloat(editValue) || undefined; break;
            case 'bodyFatPercentage': updates.bodyFatPercentage = parseFloat(editValue) || undefined; break;
        }
        await updateSettings(updates);
        setEditingField(null);
        setEditValue('');
    };

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-5 pt-14">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                    >
                        <Settings size={20} style={{ color: '#a1a1aa' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Settings</h1>
                        <p className="text-xs text-[var(--color-text-muted)]">Preferences &amp; data</p>
                    </div>
                </div>

                {/* Body Metrics */}
                <SettingsGroup title="Body Metrics">
                    <SettingsRow
                        icon={<Scale size={16} />}
                        label="Body Weight"
                        value={settings.bodyWeight ? `${settings.bodyWeight} ${settings.weightUnit}` : 'Not set'}
                        onClick={() => startEdit('bodyWeight', settings.bodyWeight)}
                    />
                    <SettingsRow
                        icon={<Ruler size={16} />}
                        label="Height"
                        value={settings.height ? formatHeight(settings.height, settings.heightUnit) : 'Not set'}
                        onClick={() => startEdit('height', settings.height)}
                    />
                    <SettingsRow
                        icon={<Target size={16} />}
                        label="Target Weight"
                        value={settings.targetWeight ? `${settings.targetWeight} ${settings.weightUnit}` : 'Not set'}
                        onClick={() => startEdit('targetWeight', settings.targetWeight)}
                    />
                    <SettingsRow
                        icon={<span className="text-xs font-bold">%</span>}
                        label="Body Fat"
                        value={settings.bodyFatPercentage ? `${settings.bodyFatPercentage}%` : 'Not set'}
                        onClick={() => startEdit('bodyFatPercentage', settings.bodyFatPercentage)}
                    />
                </SettingsGroup>

                {/* Units */}
                <SettingsGroup title="Units">
                    <SettingsRow
                        icon={<Scale size={16} />}
                        label="Weight"
                        value={
                            <SegmentControl
                                options={[{ value: 'kg', label: 'KG' }, { value: 'lbs', label: 'LBS' }]}
                                value={settings.weightUnit}
                                onChange={(v) => updateSettings({ weightUnit: v as 'kg' | 'lbs' })}
                            />
                        }
                    />
                    <SettingsRow
                        icon={<Ruler size={16} />}
                        label="Height"
                        value={
                            <SegmentControl
                                options={[{ value: 'cm', label: 'CM' }, { value: 'ft-in', label: 'FT/IN' }]}
                                value={settings.heightUnit}
                                onChange={(v) => updateSettings({ heightUnit: v as 'cm' | 'ft-in' })}
                            />
                        }
                    />
                </SettingsGroup>

                {/* Preferences */}
                <SettingsGroup title="Preferences">
                    <SettingsRow
                        icon={settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                        label="Theme"
                        value={
                            <SegmentControl
                                options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
                                value={settings.theme}
                                onChange={(v) => updateSettings({ theme: v as 'dark' | 'light' })}
                            />
                        }
                    />
                    <SettingsRow
                        icon={<Calendar size={16} />}
                        label="Week Starts"
                        value={
                            <SegmentControl
                                options={[{ value: '0', label: 'Sun' }, { value: '1', label: 'Mon' }]}
                                value={String(settings.weekStartsOn)}
                                onChange={(v) => updateSettings({ weekStartsOn: Number(v) as 0 | 1 })}
                            />
                        }
                    />
                    <SettingsRow
                        icon={<Bell size={16} />}
                        label="Reminders"
                        value={
                            <button
                                onClick={(e) => { e.stopPropagation(); updateSettings({ workoutReminder: !settings.workoutReminder }); }}
                                className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
                                style={{
                                    background: settings.workoutReminder ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                                    style={{ left: settings.workoutReminder ? 'calc(100% - 22px)' : '2px' }}
                                />
                            </button>
                        }
                    />
                </SettingsGroup>

                {/* Program */}
                <SettingsGroup title="Program">
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                            >
                                <Dumbbell size={16} style={{ color: '#ef4444' }} />
                            </div>
                            <span className="font-bold text-sm">IRON FORGE 12</span>
                        </div>
                        <div className="space-y-2 text-xs text-[var(--color-text-muted)] leading-relaxed">
                            <p><span className="font-semibold" style={{ color: '#ef4444' }}>Weeks 1-4:</span> Foundation. Moderate weight, form focus. RPE 7-8.</p>
                            <p><span className="font-semibold" style={{ color: '#f97316' }}>Weeks 5-8:</span> Build. Progressive overload. RPE 8-9.</p>
                            <p><span className="font-semibold" style={{ color: '#22c55e' }}>Weeks 9-12:</span> Peak. Maximum intensity. RPE 9-10.</p>
                        </div>
                    </div>
                </SettingsGroup>

                {/* Coaching Notes */}
                <SettingsGroup title="Coaching Tips">
                    <div className="px-4 py-4">
                        <ul className="space-y-2 text-xs text-[var(--color-text-muted)] leading-relaxed">
                            <li className="flex gap-2"><span style={{ color: '#ef4444' }}>&#x2022;</span> Progressive overload every session</li>
                            <li className="flex gap-2"><span style={{ color: '#f97316' }}>&#x2022;</span> 1.8-2.2g protein per kg bodyweight</li>
                            <li className="flex gap-2"><span style={{ color: '#22c55e' }}>&#x2022;</span> 7-9 hours sleep for recovery</li>
                            <li className="flex gap-2"><span style={{ color: '#3b82f6' }}>&#x2022;</span> Rest days are growth days</li>
                            <li className="flex gap-2"><span style={{ color: '#8b5cf6' }}>&#x2022;</span> Track everything you lift</li>
                        </ul>
                    </div>
                </SettingsGroup>

                {/* Data */}
                <SettingsGroup title="Data">
                    <SettingsRow
                        icon={<Download size={16} />}
                        label="Export Data"
                        onClick={handleExportData}
                    />
                    <SettingsRow
                        icon={<Trash2 size={16} />}
                        label="Reset All Data"
                        onClick={handleResetData}
                        danger
                    />
                </SettingsGroup>

                <div className="text-center text-xs text-[var(--color-text-muted)] mt-6 pb-4">
                    <p>Iron Forge Pro v1.0.0</p>
                </div>
            </div>

            {/* Edit Modal */}
            {editingField && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={() => setEditingField(null)}
                >
                    <div
                        className="w-full max-w-md rounded-t-3xl p-6 animate-slide-up"
                        style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold">
                                Edit {editingField.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <button
                                onClick={() => setEditingField(null)}
                                className="p-1.5 rounded-lg text-[var(--color-text-muted)]"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="input mb-5 text-lg"
                            autoFocus
                            placeholder={`Enter ${editingField}`}
                        />
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setEditingField(null)}
                                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                    color: '#fff',
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
