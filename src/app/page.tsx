'use client';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE - Redirect to Dashboard
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--color-accent-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)] text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
