'use client';

import { useState, useEffect } from 'react';
import { useEcu } from '../../hooks/useEcu';
import { useTranslation } from '../../hooks/useTranslation';

import StatusIndicator from '../Dashboard/StatusIndicator';
import styles from './Header.module.css';

export default function Header() {
    const { status, ecuType } = useEcu();
    const { t } = useTranslation();
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <StatusIndicator status={status} ecuType={ecuType} />
            </div>
        </header>
    );
}
