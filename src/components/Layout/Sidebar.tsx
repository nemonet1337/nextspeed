'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
    { href: '/', label: 'ダッシュボード', icon: '⚡' },
    { href: '/tuning', label: 'チューニング', icon: '🔧' },
    { href: '/logs', label: 'データログ', icon: '📊' },
    { href: '/settings', label: '設定', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className={styles.logoIcon}>🏎️</span>
                <div>
                    <div className={styles.logoText}>NextSpeed</div>
                    <div className={styles.logoSub}>ECU Tuning</div>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.version}>v0.1.0</div>
                <div className={styles.footerSub}>RusEFI / Speeduino</div>
            </div>
        </aside>
    );
}
