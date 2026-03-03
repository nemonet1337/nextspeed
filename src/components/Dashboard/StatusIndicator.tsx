'use client';

import styles from './StatusIndicator.module.css';
import type { ConnectionStatus, EcuType } from '../../lib/types/ecu';
import { useTranslation } from '../../hooks/useTranslation';

interface StatusIndicatorProps {
    status: ConnectionStatus;
    ecuType: EcuType;
}

const ecuLabels: Record<EcuType, string> = {
    speeduino: 'Speeduino',
    rusefi: 'RusEFI',
    unknown: '--',
};

export default function StatusIndicator({ status, ecuType }: StatusIndicatorProps) {
    const { t } = useTranslation();

    const statusLabels: Record<ConnectionStatus, string> = {
        disconnected: t('status.disconnected'),
        connecting: t('status.connecting'),
        connected: t('status.connected'),
        error: t('status.error'),
    };

    return (
        <div className={styles.statusBar}>
            <div className={`${styles.dot} ${styles[status]}`} />
            <span className={styles.statusText}>{statusLabels[status]}</span>
            {status === 'connected' && (
                <span className={styles.ecuBadge}>{ecuLabels[ecuType]}</span>
            )}
        </div>
    );
}
