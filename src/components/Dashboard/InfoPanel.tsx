'use client';

import styles from './InfoPanel.module.css';

interface InfoItem {
    label: string;
    value: string | number;
    unit?: string;
    status?: 'normal' | 'warn' | 'danger' | 'active';
}

interface InfoPanelProps {
    title: string;
    items: InfoItem[];
}

export default function InfoPanel({ title, items }: InfoPanelProps) {
    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.grid}>
                {items.map((item, idx) => (
                    <div key={idx} className={`${styles.item} ${item.status ? styles[item.status] : ''}`}>
                        <span className={styles.label}>{item.label}</span>
                        <span className={styles.value}>
                            {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                            {item.unit && <span className={styles.unit}>{item.unit}</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
