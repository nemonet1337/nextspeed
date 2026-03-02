'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './TuningTable.module.css';

interface TuningTableProps {
    name: string;
    xBins: number[];
    yBins: number[];
    xLabel: string;
    yLabel: string;
    xUnit: string;
    yUnit: string;
    valueUnit: string;
    data: number[][];
    onChange?: (row: number, col: number, value: number) => void;
}

function getCellColor(value: number, min: number, max: number): string {
    const pct = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
    // 青 → シアン → 緑 → 黄 → 赤
    const hue = (1 - pct) * 240;
    return `hsl(${hue}, 80%, ${35 + pct * 15}%)`;
}

export default function TuningTable({
    name,
    xBins,
    yBins,
    xLabel,
    yLabel,
    xUnit,
    yUnit,
    valueUnit,
    data,
    onChange,
}: TuningTableProps) {
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // 最小・最大値
    const { minVal, maxVal } = useMemo(() => {
        let mn = Infinity;
        let mx = -Infinity;
        for (const row of data) {
            for (const v of row) {
                mn = Math.min(mn, v);
                mx = Math.max(mx, v);
            }
        }
        return { minVal: mn, maxVal: mx };
    }, [data]);

    const handleCellClick = useCallback((row: number, col: number) => {
        setSelectedCell([row, col]);
        setEditValue(data[row][col].toString());
    }, [data]);

    const handleCellChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    }, []);

    const handleCellBlur = useCallback(() => {
        if (selectedCell && onChange) {
            const val = parseFloat(editValue);
            if (!isNaN(val)) {
                onChange(selectedCell[0], selectedCell[1], val);
            }
        }
        setSelectedCell(null);
    }, [selectedCell, editValue, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCellBlur();
        } else if (e.key === 'Escape') {
            setSelectedCell(null);
        }
    }, [handleCellBlur]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.name}>{name}</h3>
                <span className={styles.meta}>
                    {yLabel} ({yUnit}) × {xLabel} ({xUnit}) → {valueUnit}
                </span>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.cornerCell}>
                                {yLabel}\{xLabel}
                            </th>
                            {xBins.map((x, i) => (
                                <th key={i} className={styles.axisCellX}>
                                    {x}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {yBins.map((y, row) => (
                            <tr key={row}>
                                <td className={styles.axisCellY}>{y}</td>
                                {xBins.map((_, col) => {
                                    const isSelected =
                                        selectedCell && selectedCell[0] === row && selectedCell[1] === col;

                                    return (
                                        <td
                                            key={col}
                                            className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
                                            style={{
                                                backgroundColor: getCellColor(data[row][col], minVal, maxVal),
                                            }}
                                            onClick={() => handleCellClick(row, col)}
                                        >
                                            {isSelected ? (
                                                <input
                                                    className={styles.cellInput}
                                                    type="number"
                                                    value={editValue}
                                                    onChange={handleCellChange}
                                                    onBlur={handleCellBlur}
                                                    onKeyDown={handleKeyDown}
                                                    autoFocus
                                                />
                                            ) : (
                                                data[row][col].toFixed(1)
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
