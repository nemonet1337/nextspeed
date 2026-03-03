'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const navItems = [
        { href: '/', label: t('nav.dashboard'), icon: '⚡' },
        { href: '/tuning', label: t('nav.tuning'), icon: '🔧' },
        { href: '/logs', label: t('nav.logs'), icon: '📊' },
        { href: '/settings', label: t('nav.settings'), icon: '⚙️' },
    ];

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
