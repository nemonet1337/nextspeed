'use client';

import { useEffect, useRef } from 'react';
import styles from './Gauge.module.css';

interface GaugeProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    /** ゲージの色テーマ */
    color?: 'cyan' | 'orange' | 'green' | 'red' | 'purple' | 'yellow';
    /** 警告しきい値 */
    warnThreshold?: number;
    /** 危険しきい値 */
    dangerThreshold?: number;
    /** 小数点以下の桁数 */
    decimals?: number;
    /** サイズ (px) */
    size?: number;
}

export default function Gauge({
    label,
    value,
    min,
    max,
    unit,
    color = 'cyan',
    warnThreshold,
    dangerThreshold,
    decimals = 0,
    size = 160,
}: GaugeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animatedValue = useRef(min);
    const frameRef = useRef<number>(0);

    // 値のクランプ
    const clampedValue = Math.max(min, Math.min(max, value));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 12;

        // アニメーション
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const draw = () => {
            animatedValue.current = lerp(animatedValue.current, clampedValue, 0.15);
            const pct = (animatedValue.current - min) / (max - min);

            ctx.clearRect(0, 0, size, size);

            // 開始角・終了角 (225° → -45°)
            const startAngle = (225 * Math.PI) / 180;
            const endAngle = (-45 * Math.PI) / 180;
            const totalArc = (270 * Math.PI) / 180;

            // 背景アーク
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle, false);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 値アーク
            const valueAngle = startAngle + totalArc * pct;
            let arcColor = `var(--gauge-${color})`;

            if (dangerThreshold !== undefined && animatedValue.current >= dangerThreshold) {
                arcColor = 'var(--gauge-red)';
            } else if (warnThreshold !== undefined && animatedValue.current >= warnThreshold) {
                arcColor = 'var(--gauge-orange)';
            }

            const gradient = ctx.createLinearGradient(0, size, size, 0);
            gradient.addColorStop(0, arcColor);
            gradient.addColorStop(1, arcColor);

            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, valueAngle, false);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();

            // グロー効果
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, valueAngle, false);
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.3;
            ctx.filter = 'blur(6px)';
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.filter = 'none';

            // 値テキスト
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${size * 0.22}px "Inter", "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animatedValue.current.toFixed(decimals), cx, cy - 4);

            // 単位テキスト
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `${size * 0.09}px "Inter", "Segoe UI", sans-serif`;
            ctx.fillText(unit, cx, cy + size * 0.16);

            if (Math.abs(animatedValue.current - clampedValue) > 0.01) {
                frameRef.current = requestAnimationFrame(draw);
            }
        };

        frameRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frameRef.current);
        };
    }, [clampedValue, min, max, size, color, warnThreshold, dangerThreshold, decimals, unit]);

    return (
        <div className={styles.gaugeWrapper} style={{ width: size, height: size + 28 }}>
            <canvas
                ref={canvasRef}
                className={styles.gaugeCanvas}
                style={{ width: size, height: size }}
            />
            <div className={styles.gaugeLabel}>{label}</div>
        </div>
    );
}
