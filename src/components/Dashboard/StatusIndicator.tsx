'use client';

import styles from './StatusIndicator.module.css';
import type { ConnectionStatus, EcuType } from '../../lib/types/ecu';

interface StatusIndicatorProps {
    status: ConnectionStatus;
    ecuType: EcuType;
}

const statusLabels: Record<ConnectionStatus, string> = {
    disconnected: '未接続',
    connecting: '接続中...',
    connected: '接続済み',
    error: 'エラー',
};

const ecuLabels: Record<EcuType, string> = {
    speeduino: 'Speeduino',
    rusefi: 'RusEFI',
    unknown: '--',
};

export default function StatusIndicator({ status, ecuType }: StatusIndicatorProps) {
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
