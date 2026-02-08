'use client';

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Settings, User, Dumbbell } from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'HOME' },
    { href: '/workout', icon: Dumbbell, label: 'WORKOUT' },
    { href: '/progress', icon: BarChart3, label: 'PROGRESS' },
    { href: '/settings', icon: Settings, label: 'SETTINGS' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="nav-bottom">
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors"
                        style={{ color: isActive ? '#fff' : '#555' }}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
