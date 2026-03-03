'use client';

import { useEcu } from '../hooks/useEcu';
import Gauge from '../components/Dashboard/Gauge';
import InfoPanel from '../components/Dashboard/InfoPanel';
import styles from './page.module.css';

export default function DashboardPage() {
  const { status, sensorData } = useEcu();
  const d = sensorData;
  const isConnected = status === 'connected';

  return (
    <div className={styles.dashboard}>
      <section className={styles.heroSection}>
        <h1 className={styles.pageTitle}>ダッシュボード</h1>
        <p className={styles.pageDesc}>
          {isConnected
            ? 'ECU に接続中 — リアルタイムでセンサーデータを表示しています'
            : 'ECU に接続してリアルタイムデータを表示します。右上の接続ボタンから USB で接続してください。'}
        </p>
      </section>

      {/* メインゲージ群 */}
      <section className={styles.gaugeSection}>
        <div className={styles.gaugeGrid}>
          <Gauge
            label="RPM"
            value={d.rpm}
            min={0}
            max={9000}
            unit="rpm"
            color="cyan"
            warnThreshold={6500}
            dangerThreshold={8000}
            decimals={0}
            size={180}
          />
          <Gauge
            label="水温"
            value={d.coolantTemp}
            min={-40}
            max={140}
            unit="°C"
            color="green"
            warnThreshold={95}
            dangerThreshold={110}
            decimals={0}
            size={140}
          />
          <Gauge
            label="吸気温度"
            value={d.iat}
            min={-40}
            max={80}
            unit="°C"
            color="purple"
            warnThreshold={50}
            dangerThreshold={65}
            decimals={0}
            size={140}
          />
          <Gauge
            label="TPS"
            value={d.tps}
            min={0}
            max={100}
            unit="%"
            color="yellow"
            decimals={1}
            size={140}
          />
          <Gauge
            label="MAP"
            value={d.map}
            min={0}
            max={300}
            unit="kPa"
            color="cyan"
            decimals={0}
            size={140}
          />
          <Gauge
            label="空燃比"
            value={d.afr}
            min={10}
            max={20}
            unit="A/F"
            color="orange"
            warnThreshold={15.5}
            dangerThreshold={17}
            decimals={1}
            size={140}
          />
          <Gauge
            label="バッテリー"
            value={d.batteryVoltage}
            min={10}
            max={16}
            unit="V"
            color="green"
            warnThreshold={13.8}
            dangerThreshold={15}
            decimals={1}
            size={140}
          />
          <Gauge
            label="点火進角"
            value={d.advance}
            min={-10}
            max={50}
            unit="°"
            color="purple"
            decimals={1}
            size={140}
          />
        </div>
      </section>

      {/* 詳細パネル群 */}
      <section className={styles.panelSection}>
        <InfoPanel
          title="燃料系"
          items={[
            { label: 'パルス幅 1', value: d.pulseWidth1, unit: 'ms' },
            { label: 'パルス幅 2', value: d.pulseWidth2, unit: 'ms' },
            { label: 'デューティ', value: d.dutyCycle, unit: '%' },
            { label: '目標 AFR', value: d.afrTarget, unit: 'A/F' },
            { label: '燃圧', value: d.fuelPressure, unit: 'kPa' },
            { label: 'EGO 補正', value: d.egoCorrection, unit: '%' },
            { label: 'ガンマ補正', value: d.gammaEnrich, unit: '%' },
            { label: '現在 VE', value: d.veCurr, unit: '%' },
          ]}
        />

        <InfoPanel
          title="点火系"
          items={[
            { label: '進角', value: d.advance, unit: '°' },
            { label: 'ドウェル', value: d.dwell, unit: 'ms' },
            { label: 'トリガーエラー', value: d.triggerErrors, status: d.triggerErrors > 0 ? 'danger' : 'normal' },
            { label: '同期', value: d.syncStatus ? 'OK' : 'NG', status: d.syncStatus ? 'active' : 'danger' },
          ]}
        />

        <InfoPanel
          title="油温・油圧"
          items={[
            { label: '油温', value: d.oilTemp, unit: '°C', status: d.oilTemp > 120 ? 'danger' : d.oilTemp > 100 ? 'warn' : 'normal' },
            { label: '油圧', value: d.oilPressure, unit: 'kPa', status: d.oilPressure < 100 && d.rpm > 1000 ? 'danger' : 'normal' },
          ]}
        />

        <InfoPanel
          title="ブースト"
          items={[
            { label: '目標', value: d.boostTarget, unit: 'kPa' },
            { label: 'デューティ', value: d.boostDuty, unit: '%' },
          ]}
        />

        <InfoPanel
          title="アイドル"
          items={[
            { label: '目標 RPM', value: d.idleTarget },
            { label: 'IAC 位置', value: d.iacPosition, unit: '%' },
          ]}
        />

        <InfoPanel
          title="その他"
          items={[
            { label: 'クランク角', value: d.crankAngle, unit: '°' },
            { label: 'ファン', value: d.fanOn ? 'ON' : 'OFF', status: d.fanOn ? 'active' : 'normal' },
          ]}
        />
      </section>
    </div >
  );
}
