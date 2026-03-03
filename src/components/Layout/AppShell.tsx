'use client';

import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Sidebar from './Sidebar';
import Header from './Header';
import SetupDialog from './SetupDialog';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { locale } = useLanguage();

    // html lang 属性を動的に切り替え
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return (
        <>
            <SetupDialog />
            <Sidebar />
            <Header />
            <main
                style={{
                    marginLeft: 'var(--sidebar-width)',
                    marginTop: 'var(--header-height)',
                    padding: '24px',
                    minHeight: 'calc(100vh - var(--header-height))',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {children}
            </main>
        </>
    );
}
