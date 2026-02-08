// ═══════════════════════════════════════════════════════════════════════════
// IRON FORGE PRO - GLOBAL SETTINGS STORE
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { db, GlobalSettings } from '../db/schema';
import { createDefaultSettings } from '../db/seed';

interface SettingsState {
    settings: GlobalSettings | null;
    isLoading: boolean;

    // Actions
    loadSettings: (userId: string) => Promise<void>;
    updateSettings: (updates: Partial<GlobalSettings>) => Promise<void>;
    resetSettings: (userId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    isLoading: true,

    loadSettings: async (userId: string) => {
        set({ isLoading: true });

        try {
            let settings = await db.globalSettings.where('userId').equals(userId).first();

            if (!settings) {
                // Create default settings
                settings = createDefaultSettings(userId);
                await db.globalSettings.add(settings);
            }

            set({ settings, isLoading: false });
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isLoading: false });
        }
    },

    updateSettings: async (updates: Partial<GlobalSettings>) => {
        const { settings } = get();
        if (!settings) return;

        try {
            const updatedSettings: GlobalSettings = {
                ...settings,
                ...updates,
                updatedAt: new Date(),
            };

            await db.globalSettings.put(updatedSettings);
            set({ settings: updatedSettings });
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    },

    resetSettings: async (userId: string) => {
        try {
            const defaultSettings = createDefaultSettings(userId);
            await db.globalSettings.put(defaultSettings);
            set({ settings: defaultSettings });
        } catch (error) {
            console.error('Failed to reset settings:', error);
        }
    },
}));

// ─── HELPER FUNCTIONS ───
export function formatWeight(value: number, unit: 'kg' | 'lbs'): string {
    return `${value} ${unit}`;
}

export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return Math.round(value * 2.20462 * 10) / 10;
    return Math.round(value / 2.20462 * 10) / 10;
}

export function formatHeight(cm: number, unit: 'cm' | 'ft-in'): string {
    if (unit === 'cm') return `${cm} cm`;
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
}

export function convertHeightToCm(feet: number, inches: number): number {
    return Math.round((feet * 12 + inches) * 2.54);
}
