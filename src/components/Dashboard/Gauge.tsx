'use client';

import { useEffect, useRef } from 'react';
import styles from './Gauge.module.css';

/** Canvas では CSS variable が使えないため直接カラーを定義 */
const COLOR_MAP: Record<string, string> = {
    cyan: '#00d2ff',
    orange: '#f5a623',
    green: '#4cd964',
    red: '#ff3b30',
    purple: '#9b59b6',
    yellow: '#ffd60a',
};

interface GaugeProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    color?: 'cyan' | 'orange' | 'green' | 'red' | 'purple' | 'yellow';
    warnThreshold?: number;
    dangerThreshold?: number;
    decimals?: number;
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

    // ターゲット値を ref で管理（アニメーションループから常に最新値を参照）
    const targetRef = useRef(Math.max(min, Math.min(max, value)));
    targetRef.current = Math.max(min, Math.min(max, value));

    // 描画パラメータも ref 化
    const paramsRef = useRef({ min, max, size, color, warnThreshold, dangerThreshold, decimals, unit });
    paramsRef.current = { min, max, size, color, warnThreshold, dangerThreshold, decimals, unit };

    // Canvas 初期化 + 常時アニメーションループ
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;

        let running = true;

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const draw = () => {
            if (!running) return;

            const p = paramsRef.current;
            const target = targetRef.current;

            animatedValue.current = lerp(animatedValue.current, target, 0.15);

            const pct = (animatedValue.current - p.min) / (p.max - p.min);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, p.size, p.size);

            const cx = p.size / 2;
            const cy = p.size / 2;
            const radius = p.size / 2 - 12;

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

            // 値アーク — 直接 HEX カラーを使う
            const valueAngle = startAngle + totalArc * pct;
            let arcColor = COLOR_MAP[p.color] || COLOR_MAP.cyan;

            if (p.dangerThreshold !== undefined && animatedValue.current >= p.dangerThreshold) {
                arcColor = COLOR_MAP.red;
            } else if (p.warnThreshold !== undefined && animatedValue.current >= p.warnThreshold) {
                arcColor = COLOR_MAP.orange;
            }

            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, valueAngle, false);
            ctx.strokeStyle = arcColor;
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
            ctx.font = `bold ${p.size * 0.22}px "Inter", "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animatedValue.current.toFixed(p.decimals), cx, cy - 4);

            // 単位テキスト
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `${p.size * 0.09}px "Inter", "Segoe UI", sans-serif`;
            ctx.fillText(p.unit, cx, cy + p.size * 0.16);

            frameRef.current = requestAnimationFrame(draw);
        };

        frameRef.current = requestAnimationFrame(draw);

        return () => {
            running = false;
            cancelAnimationFrame(frameRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size]);

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
