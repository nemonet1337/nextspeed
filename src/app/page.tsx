'use client';

import { useEcu } from '../hooks/useEcu';
import { useTranslation } from '../hooks/useTranslation';
import Gauge from '../components/Dashboard/Gauge';
import InfoPanel from '../components/Dashboard/InfoPanel';
import styles from './page.module.css';

export default function DashboardPage() {
  const { status, sensorData } = useEcu();
  const { t } = useTranslation();
  const d = sensorData;
  const isConnected = status === 'connected';

  return (
    <div className={styles.dashboard}>
      <section className={styles.heroSection}>
        <h1 className={styles.pageTitle}>{t('dashboard.title')}</h1>
        <p className={styles.pageDesc}>
          {isConnected
            ? t('dashboard.descConnected')
            : t('dashboard.descDisconnected')}
        </p>
      </section>

      {/* メインゲージ群 */}
      <section className={styles.gaugeSection}>
        <div className={styles.gaugeGrid}>
          <Gauge
            label={t('dashboard.gauge.rpm')}
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
            label={t('dashboard.gauge.coolantTemp')}
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
            label={t('dashboard.gauge.iat')}
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
            label={t('dashboard.gauge.tps')}
            value={d.tps}
            min={0}
            max={100}
            unit="%"
            color="yellow"
            decimals={1}
            size={140}
          />
          <Gauge
            label={t('dashboard.gauge.map')}
            value={d.map}
            min={0}
            max={300}
            unit="kPa"
            color="cyan"
            decimals={0}
            size={140}
          />
          <Gauge
            label={t('dashboard.gauge.afr')}
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
            label={t('dashboard.gauge.battery')}
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
            label={t('dashboard.gauge.advance')}
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
          title={t('dashboard.panel.fuel')}
          items={[
            { label: t('dashboard.panel.pulseWidth1'), value: d.pulseWidth1, unit: 'ms' },
            { label: t('dashboard.panel.pulseWidth2'), value: d.pulseWidth2, unit: 'ms' },
            { label: t('dashboard.panel.dutyCycle'), value: d.dutyCycle, unit: '%' },
            { label: t('dashboard.panel.afrTarget'), value: d.afrTarget, unit: 'A/F' },
            { label: t('dashboard.panel.fuelPressure'), value: d.fuelPressure, unit: 'kPa' },
            { label: t('dashboard.panel.egoCorrection'), value: d.egoCorrection, unit: '%' },
            { label: t('dashboard.panel.gammaEnrich'), value: d.gammaEnrich, unit: '%' },
            { label: t('dashboard.panel.veCurr'), value: d.veCurr, unit: '%' },
          ]}
        />

        <InfoPanel
          title={t('dashboard.panel.ignition')}
          items={[
            { label: t('dashboard.panel.advance'), value: d.advance, unit: '°' },
            { label: t('dashboard.panel.dwell'), value: d.dwell, unit: 'ms' },
            { label: t('dashboard.panel.triggerErrors'), value: d.triggerErrors, status: d.triggerErrors > 0 ? 'danger' : 'normal' },
            { label: t('dashboard.panel.sync'), value: d.syncStatus ? t('dashboard.panel.syncOk') : t('dashboard.panel.syncNg'), status: d.syncStatus ? 'active' : 'danger' },
          ]}
        />

        <InfoPanel
          title={t('dashboard.panel.oilTempPressure')}
          items={[
            { label: t('dashboard.panel.oilTemp'), value: d.oilTemp, unit: '°C', status: d.oilTemp > 120 ? 'danger' : d.oilTemp > 100 ? 'warn' : 'normal' },
            { label: t('dashboard.panel.oilPressure'), value: d.oilPressure, unit: 'kPa', status: d.oilPressure < 100 && d.rpm > 1000 ? 'danger' : 'normal' },
          ]}
        />

        <InfoPanel
          title={t('dashboard.panel.boost')}
          items={[
            { label: t('dashboard.panel.boostTarget'), value: d.boostTarget, unit: 'kPa' },
            { label: t('dashboard.panel.boostDuty'), value: d.boostDuty, unit: '%' },
          ]}
        />

        <InfoPanel
          title={t('dashboard.panel.idle')}
          items={[
            { label: t('dashboard.panel.idleTarget'), value: d.idleTarget },
            { label: t('dashboard.panel.iacPosition'), value: d.iacPosition, unit: '%' },
          ]}
        />

        <InfoPanel
          title={t('dashboard.panel.misc')}
          items={[
            { label: t('dashboard.panel.crankAngle'), value: d.crankAngle, unit: '°' },
            { label: t('dashboard.panel.fan'), value: d.fanOn ? t('common.on') : t('common.off'), status: d.fanOn ? 'active' : 'normal' },
          ]}
        />
      </section>
    </div>
  );
}
