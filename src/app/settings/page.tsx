'use client';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE - User preferences, metrics, and data management
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore, formatHeight } from '@/lib/store/settings-store';
import { useWorkoutStore } from '@/lib/store/workout-store';
import BottomNav from '@/components/layout/BottomNav';
import {
    Scale, Ruler, Target, Bell, Calendar,
    Trash2, Download, ChevronRight,
    Moon, Sun, Dumbbell
} from 'lucide-react';

const DEFAULT_USER_ID = 'default-user';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className="mb-6">
            <h2 className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wide mb-3 px-1">
                {title}
            </h2>
            <div className="card divide-y divide-[rgba(255,255,255,0.04)]">
                {children}
            </div>
        </div>
    );
}

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string | React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}

function SettingsRow({ icon, label, value, onClick, danger }: SettingsRowProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.02)]' : ''}`}
        >
            <div className="flex items-center gap-3">
                <span style={{ color: danger ? '#EF4444' : 'var(--color-text-secondary)' }}>
                    {icon}
                </span>
                <span
                    className="font-medium"
                    style={{ color: danger ? '#EF4444' : 'inherit' }}
                >
                    {label}
                </span>
            </div>
            {value !== undefined && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    {typeof value === 'string' ? (
                        <span className="text-sm">{value}</span>
                    ) : value}
                    {onClick && <ChevronRight size={16} />}
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { settings, updateSettings } = useSettingsStore();
    const { resetAllData } = useWorkoutStore();
    const [mounted, setMounted] = useState(false);

    // Edit modals
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center pb-20">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin" />
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
            case 'bodyWeight':
                updates.bodyWeight = parseFloat(editValue) || undefined;
                break;
            case 'height':
                updates.height = parseFloat(editValue) || undefined;
                break;
            case 'targetWeight':
                updates.targetWeight = parseFloat(editValue) || undefined;
                break;
            case 'bodyFatPercentage':
                updates.bodyFatPercentage = parseFloat(editValue) || undefined;
                break;
        }

        await updateSettings(updates);
        setEditingField(null);
        setEditValue('');
    };

    return (
        <div className="pb-24 safe-area-bottom">
            <div className="px-4 pt-6">
                <h1 className="text-2xl font-black mb-6">⚙️ Settings</h1>

                {/* Body Metrics Section */}
                <SettingsSection title="BODY METRICS">
                    <SettingsRow
                        icon={<Scale size={18} />}
                        label="Body Weight"
                        value={settings.bodyWeight ? `${settings.bodyWeight} ${settings.weightUnit}` : 'Not set'}
                        onClick={() => startEdit('bodyWeight', settings.bodyWeight)}
                    />
                    <SettingsRow
                        icon={<Ruler size={18} />}
                        label="Height"
                        value={settings.height ? formatHeight(settings.height, settings.heightUnit) : 'Not set'}
                        onClick={() => startEdit('height', settings.height)}
                    />
                    <SettingsRow
                        icon={<Target size={18} />}
                        label="Target Weight"
                        value={settings.targetWeight ? `${settings.targetWeight} ${settings.weightUnit}` : 'Not set'}
                        onClick={() => startEdit('targetWeight', settings.targetWeight)}
                    />
                    <SettingsRow
                        icon={<span className="text-base">💪</span>}
                        label="Body Fat %"
                        value={settings.bodyFatPercentage ? `${settings.bodyFatPercentage}%` : 'Not set'}
                        onClick={() => startEdit('bodyFatPercentage', settings.bodyFatPercentage)}
                    />
                </SettingsSection>

                {/* Units Section */}
                <SettingsSection title="UNITS">
                    <SettingsRow
                        icon={<Scale size={18} />}
                        label="Weight Unit"
                        value={
                            <div className="flex gap-1">
                                {(['kg', 'lbs'] as const).map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => updateSettings({ weightUnit: unit })}
                                        className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                                        style={{
                                            background: settings.weightUnit === unit
                                                ? 'rgba(230, 57, 70, 0.2)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: settings.weightUnit === unit
                                                ? '#E63946'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {unit.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                    <SettingsRow
                        icon={<Ruler size={18} />}
                        label="Height Unit"
                        value={
                            <div className="flex gap-1">
                                {(['cm', 'ft-in'] as const).map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => updateSettings({ heightUnit: unit })}
                                        className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                                        style={{
                                            background: settings.heightUnit === unit
                                                ? 'rgba(230, 57, 70, 0.2)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: settings.heightUnit === unit
                                                ? '#E63946'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {unit === 'ft-in' ? 'FT/IN' : 'CM'}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                </SettingsSection>

                {/* Preferences Section */}
                <SettingsSection title="PREFERENCES">
                    <SettingsRow
                        icon={settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        label="Theme"
                        value={
                            <div className="flex gap-1">
                                {(['dark', 'light'] as const).map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => updateSettings({ theme })}
                                        className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                                        style={{
                                            background: settings.theme === theme
                                                ? 'rgba(230, 57, 70, 0.2)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: settings.theme === theme
                                                ? '#E63946'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {theme.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                    <SettingsRow
                        icon={<Calendar size={18} />}
                        label="Week Starts On"
                        value={
                            <div className="flex gap-1">
                                {([{ day: 0, label: 'SUN' }, { day: 1, label: 'MON' }] as const).map(({ day, label }) => (
                                    <button
                                        key={day}
                                        onClick={() => updateSettings({ weekStartsOn: day })}
                                        className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                                        style={{
                                            background: settings.weekStartsOn === day
                                                ? 'rgba(230, 57, 70, 0.2)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: settings.weekStartsOn === day
                                                ? '#E63946'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                    <SettingsRow
                        icon={<Bell size={18} />}
                        label="Workout Reminder"
                        value={
                            <button
                                onClick={() => updateSettings({ workoutReminder: !settings.workoutReminder })}
                                className="w-12 h-6 rounded-full transition-all relative"
                                style={{
                                    background: settings.workoutReminder
                                        ? '#4ADE80'
                                        : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                                    style={{
                                        left: settings.workoutReminder ? 'calc(100% - 22px)' : '2px',
                                    }}
                                />
                            </button>
                        }
                    />
                </SettingsSection>

                {/* Program Overview */}
                <SettingsSection title="PROGRAM">
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Dumbbell size={18} className="text-[var(--color-accent-red)]" />
                            <span className="font-bold">IRON FORGE 12</span>
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-2">
                            <p>
                                <strong className="text-[#E63946]">Weeks 1-4 (Foundation):</strong> Learn movement patterns. Moderate weight, focus on form. RPE 7-8.
                            </p>
                            <p>
                                <strong className="text-[#F4A261]">Weeks 5-8 (Build):</strong> Progressive overload. Add weight or reps each session. RPE 8-9.
                            </p>
                            <p>
                                <strong className="text-[#4ADE80]">Weeks 9-12 (Peak):</strong> Maximum intensity. Hit PRs. RPE 9-10 on compounds.
                            </p>
                        </div>
                    </div>
                </SettingsSection>

                {/* Coaching Notes */}
                <SettingsSection title="COACHING NOTES">
                    <div className="px-4 py-4">
                        <ul className="text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-1.5">
                            <li>• Progressive overload is king — add weight or reps every session</li>
                            <li>• Protein: 1.8-2.2g per kg bodyweight daily</li>
                            <li>• Sleep: 7-9 hours minimum for recovery</li>
                            <li>• Rest days are growth days — don't skip them</li>
                            <li>• If you miss a rep target, keep the weight. Hit it next time.</li>
                            <li>• Track everything. What gets measured gets managed.</li>
                        </ul>
                    </div>
                </SettingsSection>

                {/* Data Management */}
                <SettingsSection title="DATA">
                    <SettingsRow
                        icon={<Download size={18} />}
                        label="Export Data"
                        onClick={handleExportData}
                    />
                    <SettingsRow
                        icon={<Trash2 size={18} />}
                        label="Reset All Data"
                        onClick={handleResetData}
                        danger
                    />
                </SettingsSection>

                {/* App Info */}
                <div className="text-center text-xs text-[var(--color-text-muted)] mt-8 pb-4">
                    <p className="mb-1">Iron Forge Pro v1.0.0</p>
                    <p>Built with 💪 for serious lifters</p>
                </div>
            </div>

            {/* Edit Modal */}
            {editingField && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    onClick={() => setEditingField(null)}
                >
                    <div
                        className="bg-[var(--color-bg-secondary)] rounded-xl p-6 w-full max-w-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">
                            Edit {editingField.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="input mb-4"
                            autoFocus
                            placeholder={`Enter ${editingField}`}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingField(null)}
                                className="btn-ghost flex-1 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="btn-primary flex-1 py-3 rounded-lg"
                                style={{ background: 'linear-gradient(135deg, #E63946, #F4A261)' }}
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
