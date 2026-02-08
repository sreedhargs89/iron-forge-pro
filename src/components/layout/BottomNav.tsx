'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, BarChart3, Settings } from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/workout', icon: Dumbbell, label: 'Train' },
    { href: '/progress', icon: BarChart3, label: 'Stats' },
    { href: '/settings', icon: Settings, label: 'More' },
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
                        className="flex flex-col items-center gap-0.5 py-1 relative"
                        style={{ width: '64px' }}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200"
                            style={{
                                background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            }}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                style={{
                                    color: isActive ? '#ef4444' : '#52525b',
                                    transition: 'color 200ms ease',
                                }}
                            />
                        </div>
                        <span
                            className="text-[10px] font-medium transition-colors duration-200"
                            style={{
                                color: isActive ? '#fafafa' : '#52525b',
                            }}
                        >
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
