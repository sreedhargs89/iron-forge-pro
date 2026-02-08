// ═══════════════════════════════════════════════════════════════════════════
// IRON FORGE PRO - WORKOUT STORE
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { db, WorkoutProgram, WorkoutSession, WorkoutSet, ProgramDay } from '../db/schema';

interface WorkoutState {
    // Current Program
    program: WorkoutProgram | null;
    currentWeek: number;

    // Active Workout
    activeSession: WorkoutSession | null;
    isWorkoutActive: boolean;
    workoutStartTime: Date | null;
    expandedExercise: string | null;

    // Data
    workoutData: Record<string, string>; // key-value for sets data

    // Actions
    loadProgram: (userId: string) => Promise<void>;
    setCurrentWeek: (week: number) => Promise<void>;
    startWorkout: (dayId: string) => void;
    endWorkout: () => Promise<void>;
    setExpandedExercise: (exerciseId: string | null) => void;

    // Set Data
    getValue: (week: number, dayId: string, exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'rpe') => string;
    setValue: (week: number, dayId: string, exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'rpe', value: string) => void;

    // Progress Calculations
    getCompletedSets: (week: number, dayId: string, exerciseId: string, totalSets: number) => number;
    getDayProgress: (week: number, dayId: string) => number;
    getWeekProgress: (week: number) => number;
    getTotalVolume: (week: number, dayId: string) => number;

    // Data Management
    loadWorkoutData: (userId: string) => Promise<void>;
    saveWorkoutData: () => Promise<void>;
    resetAllData: (userId: string) => Promise<void>;
}

const STORAGE_KEY = 'iron-forge-workout-data';

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    program: null,
    currentWeek: 1,
    activeSession: null,
    isWorkoutActive: false,
    workoutStartTime: null,
    expandedExercise: null,
    workoutData: {},

    loadProgram: async (userId: string) => {
        try {
            const program = await db.workoutPrograms
                .where('userId')
                .equals(userId)
                .first();

            const settings = await db.globalSettings
                .where('userId')
                .equals(userId)
                .first();

            set({
                program,
                currentWeek: settings?.currentWeek || 1,
            });
        } catch (error) {
            console.error('Failed to load program:', error);
        }
    },

    setCurrentWeek: async (week: number) => {
        set({ currentWeek: week });
    },

    startWorkout: (dayId: string) => {
        const { program, currentWeek } = get();
        if (!program) return;

        const session: WorkoutSession = {
            id: uuid(),
            dayId: dayId,
            odaymId: program.userId || '',
            week: currentWeek,
            startTime: new Date(),
            completed: false,
            sets: [],
            totalVolume: 0,
            createdAt: new Date(),
        };

        set({
            activeSession: session,
            isWorkoutActive: true,
            workoutStartTime: new Date(),
            expandedExercise: null,
        });
    },

    endWorkout: async () => {
        const { activeSession, workoutStartTime, workoutData, currentWeek, program } = get();

        if (activeSession && workoutStartTime && program) {
            const duration = Math.round((Date.now() - workoutStartTime.getTime()) / 60000);

            // Calculate total volume for this session
            const day = program.days.find(d => d.id === activeSession.dayId);
            let totalVolume = 0;

            if (day) {
                day.exercises.forEach(ex => {
                    for (let i = 0; i < ex.sets; i++) {
                        const key = `w${currentWeek}_${day.id}_${ex.id}_s${i}`;
                        const weight = parseFloat(workoutData[`${key}_weight`]) || 0;
                        const reps = parseFloat(workoutData[`${key}_reps`]) || 0;
                        totalVolume += weight * reps;
                    }
                });
            }

            // Save duration to workout data
            const durationKey = `w${currentWeek}_${activeSession.dayId}_duration`;
            set(state => ({
                workoutData: { ...state.workoutData, [durationKey]: String(duration) },
                activeSession: null,
                isWorkoutActive: false,
                workoutStartTime: null,
            }));

            // Persist data
            await get().saveWorkoutData();
        }

        set({
            activeSession: null,
            isWorkoutActive: false,
            workoutStartTime: null,
        });
    },

    setExpandedExercise: (exerciseId: string | null) => {
        set({ expandedExercise: exerciseId });
    },

    getValue: (week, dayId, exerciseId, setIndex, field) => {
        const { workoutData } = get();
        const key = `w${week}_${dayId}_${exerciseId}_s${setIndex}_${field}`;
        return workoutData[key] || '';
    },

    setValue: (week, dayId, exerciseId, setIndex, field, value) => {
        const key = `w${week}_${dayId}_${exerciseId}_s${setIndex}_${field}`;
        set(state => ({
            workoutData: { ...state.workoutData, [key]: value }
        }));
        // Auto-save after a short delay
        setTimeout(() => get().saveWorkoutData(), 500);
    },

    getCompletedSets: (week, dayId, exerciseId, totalSets) => {
        const { workoutData } = get();
        let count = 0;
        for (let i = 0; i < totalSets; i++) {
            const key = `w${week}_${dayId}_${exerciseId}_s${i}_reps`;
            if (workoutData[key]) count++;
        }
        return count;
    },

    getDayProgress: (week, dayId) => {
        const { program } = get();
        if (!program) return 0;

        const day = program.days.find(d => d.id === dayId);
        if (!day) return 0;

        let total = 0;
        let done = 0;

        day.exercises.forEach(ex => {
            total += ex.sets;
            done += get().getCompletedSets(week, dayId, ex.id, ex.sets);
        });

        return total > 0 ? Math.round((done / total) * 100) : 0;
    },

    getWeekProgress: (week) => {
        const { program } = get();
        if (!program) return 0;

        let total = 0;
        let done = 0;

        program.days.forEach(day => {
            day.exercises.forEach(ex => {
                total += ex.sets;
                done += get().getCompletedSets(week, day.id, ex.id, ex.sets);
            });
        });

        return total > 0 ? Math.round((done / total) * 100) : 0;
    },

    getTotalVolume: (week, dayId) => {
        const { program, workoutData } = get();
        if (!program) return 0;

        const day = program.days.find(d => d.id === dayId);
        if (!day) return 0;

        let volume = 0;
        day.exercises.forEach(ex => {
            for (let i = 0; i < ex.sets; i++) {
                const key = `w${week}_${dayId}_${ex.id}_s${i}`;
                const weight = parseFloat(workoutData[`${key}_weight`]) || 0;
                const reps = parseFloat(workoutData[`${key}_reps`]) || 0;
                volume += weight * reps;
            }
        });

        return volume;
    },

    loadWorkoutData: async (userId: string) => {
        try {
            const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
            if (stored) {
                set({ workoutData: JSON.parse(stored) });
            }
        } catch (error) {
            console.error('Failed to load workout data:', error);
        }
    },

    saveWorkoutData: async () => {
        // Get userId from somewhere - we'll need to pass it
        const authData = localStorage.getItem('iron-forge-auth');
        if (authData) {
            const { state } = JSON.parse(authData);
            if (state?.user?.id) {
                localStorage.setItem(
                    `${STORAGE_KEY}-${state.user.id}`,
                    JSON.stringify(get().workoutData)
                );
            }
        }
    },

    resetAllData: async (userId: string) => {
        localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
        set({ workoutData: {}, currentWeek: 1 });
    },
}));
