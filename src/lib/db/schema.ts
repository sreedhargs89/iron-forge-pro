// ═══════════════════════════════════════════════════════════════════════════
// IRON FORGE PRO - LOCAL DATABASE SCHEMA (Dexie/IndexedDB)
// ═══════════════════════════════════════════════════════════════════════════

import Dexie, { Table } from 'dexie';

// ─── USER PROFILE ───
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── GLOBAL SETTINGS ───
export interface GlobalSettings {
    id: string;
    userId: string;

    // Measurement Units
    weightUnit: 'kg' | 'lbs';
    heightUnit: 'cm' | 'ft-in';
    distanceUnit: 'km' | 'miles';

    // Body Metrics
    bodyWeight?: number;
    height?: number;
    bodyFatPercentage?: number;
    targetWeight?: number;

    // Goals
    workoutDaysPerWeek: number;
    restDayReminder: boolean;
    workoutReminder: boolean;
    reminderTime?: string; // HH:mm format

    // Theme & Display
    theme: 'dark' | 'light' | 'system';
    accentColor: string;

    // Date & Locale
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday

    // Program
    currentProgramId?: string;
    programStartDate?: Date;
    currentWeek: number;

    updatedAt: Date;
}

// ─── EXERCISE DEFINITION ───
export interface Exercise {
    id: string;
    name: string;
    category: 'compound' | 'isolation' | 'cardio' | 'flexibility';
    muscleGroups: string[];
    equipment: string[];
    description?: string;
    instructions?: string[];
    videoUrl?: string;
    imageUrl?: string;
    isCustom: boolean;
    userId?: string; // null for default exercises
    createdAt: Date;
}

// ─── WORKOUT PROGRAM ───
export interface WorkoutProgram {
    id: string;
    userId: string;
    name: string;
    description?: string;
    duration: number; // weeks
    daysPerWeek: number;
    type: 'hypertrophy' | 'strength' | 'powerlifting' | 'bodybuilding' | 'general' | 'custom';
    isDefault: boolean;
    days: ProgramDay[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProgramDay {
    id: string;
    name: string;
    emoji: string;
    color: string;
    muscles: string;
    exercises: ProgramExercise[];
}

export interface ProgramExercise {
    id: string;
    exerciseId: string;
    exerciseName: string; // Denormalized for quick access
    sets: number;
    reps: string; // e.g., "8-10" or "AMRAP"
    restSeconds: number;
    muscle: string;
    note?: string;
    order: number;
}

// ─── WORKOUT SESSION ───
export interface WorkoutSession {
    id: string;
    dayId: string;
    odaymId: string;
    week: number;
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    notes?: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    completed: boolean;
    sets: WorkoutSet[];
    totalVolume: number;
    createdAt: Date;
}

export interface WorkoutSet {
    id: string;
    exerciseId: string;
    exerciseName: string;
    setNumber: number;
    weight?: number;
    reps?: number;
    rpe?: number; // Rate of Perceived Exertion (1-10)
    isWarmup: boolean;
    isDropSet: boolean;
    isPR: boolean;
    notes?: string;
    completedAt?: Date;
}

// ─── PERSONAL RECORDS ───
export interface PersonalRecord {
    id: string;
    userId: string;
    exerciseId: string;
    type: '1rm' | 'volume' | 'reps' | 'duration';
    value: number;
    previousValue?: number;
    achievedAt: Date;
    workoutSessionId: string;
}

// ─── BODY MEASUREMENTS ───
export interface BodyMeasurement {
    id: string;
    userId: string;
    date: Date;

    // Weight & Composition
    weight?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    bmi?: number;

    // Circumferences (in cm or inches based on settings)
    neck?: number;
    shoulders?: number;
    chest?: number;
    leftArm?: number;
    rightArm?: number;
    leftForearm?: number;
    rightForearm?: number;
    waist?: number;
    hips?: number;
    leftThigh?: number;
    rightThigh?: number;
    leftCalf?: number;
    rightCalf?: number;

    notes?: string;
    photoUrls?: string[];
    createdAt: Date;
}

// ─── PROGRESS PHOTO ───
export interface ProgressPhoto {
    id: string;
    userId: string;
    date: Date;
    type: 'front' | 'back' | 'side-left' | 'side-right' | 'other';
    imageData: Blob;
    thumbnailData?: Blob;
    notes?: string;
    createdAt: Date;
}

// ─── WORKOUT HISTORY (Quick lookup) ───
export interface WorkoutHistory {
    id: string;
    userId: string;
    dayId: string;
    date: Date;
    week: number;
    programId: string;
    completed: boolean;
    durationMinutes: number;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    prsAchieved: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class IronForgeDB extends Dexie {
    userProfiles!: Table<UserProfile>;
    globalSettings!: Table<GlobalSettings>;
    exercises!: Table<Exercise>;
    workoutPrograms!: Table<WorkoutProgram>;
    workoutSessions!: Table<WorkoutSession>;
    personalRecords!: Table<PersonalRecord>;
    bodyMeasurements!: Table<BodyMeasurement>;
    progressPhotos!: Table<ProgressPhoto>;
    workoutHistory!: Table<WorkoutHistory>;

    constructor() {
        super('IronForgeDB');

        this.version(1).stores({
            userProfiles: 'id, email',
            globalSettings: 'id, userId',
            exercises: 'id, name, *muscleGroups, isCustom, userId',
            workoutPrograms: 'id, userId, isDefault',
            workoutSessions: 'id, dayId, odaymId, week, startTime, completed',
            personalRecords: 'id, userId, exerciseId, type, achievedAt',
            bodyMeasurements: 'id, userId, date',
            progressPhotos: 'id, userId, date, type',
            workoutHistory: 'id, userId, dayId, date, week, programId',
        });
    }
}

export const db = new IronForgeDB();
