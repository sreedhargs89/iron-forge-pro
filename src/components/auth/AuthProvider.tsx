'use client';

// ═══════════════════════════════════════════════════════════════════════════
// AUTH PROVIDER - Simplified version without login requirement
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useWorkoutStore } from '@/lib/store/workout-store';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';

const DEFAULT_USER_ID = 'default-user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { loadSettings } = useSettingsStore();
    const { loadProgram, loadWorkoutData } = useWorkoutStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check if default user exists, if not seed the database
                const existingUser = await db.userProfiles.get(DEFAULT_USER_ID);

                if (!existingUser) {
                    // Create default user profile
                    await db.userProfiles.add({
                        id: DEFAULT_USER_ID,
                        email: 'athlete@ironforge.app',
                        name: 'Athlete',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    // Seed database for default user
                    await seedDatabase(DEFAULT_USER_ID);
                }

                // Load user data
                await loadSettings(DEFAULT_USER_ID);
                await loadProgram(DEFAULT_USER_ID);
                await loadWorkoutData(DEFAULT_USER_ID);

                // Redirect from landing/login pages to dashboard
                if (pathname === '/' || pathname === '/login' || pathname === '/register') {
                    router.replace('/dashboard');
                }
            } catch (error) {
                console.error('Failed to initialize app:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, [pathname, router, loadSettings, loadProgram, loadWorkoutData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-sm">Loading Iron Forge...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
