// Database exports
export { db, IronForgeDB } from './schema';
export type {
    UserProfile,
    GlobalSettings,
    Exercise,
    WorkoutProgram,
    ProgramDay,
    ProgramExercise,
    WorkoutSession,
    WorkoutSet,
    PersonalRecord,
    BodyMeasurement,
    ProgressPhoto,
    WorkoutHistory,
} from './schema';
export { seedDatabase, createDefaultProgram, createDefaultSettings } from './seed';
