import { createDefaultSensorData, type SensorData } from '../types/ecu';

export type EngineProfileId = 'i4_turbo' | 'v8_na' | 'v6_twinturbo';

export interface EngineProfile {
    id: EngineProfileId;
    name: string;
    cylinders: number;
    displacement: number;
    idleRpm: number;
    launchRpm: number;
    redlineRpm: number;
    maxBoost: number; // kPa (absolute, 100 = NA)
    spoolRate: number; // Boost buildup coefficient
    revMultiplier: number; // RPM climb rate coefficient
    shiftDropRpm: number; // RPM drop on shift
    // ドライブトレイン（車速算出用）
    gearRatios: number[]; // 1速〜4速のギア比
    finalDrive: number;   // ファイナルギア比
    tireCircumference: number; // タイヤ外周 (m)
}

export const ENGINE_PROFILES: Record<EngineProfileId, EngineProfile> = {
    i4_turbo: {
        id: 'i4_turbo',
        name: 'Inline-4 2.0L Turbo',
        cylinders: 4,
        displacement: 2000,
        idleRpm: 850,
        launchRpm: 5500,
        redlineRpm: 8000,
        maxBoost: 220, // 1.2 bar boost (220kPa abs)
        spoolRate: 0.1, // Laggy turbo
        revMultiplier: 3.0,
        shiftDropRpm: 2500,
        gearRatios: [3.626, 2.188, 1.541, 1.213],
        finalDrive: 3.944,
        tireCircumference: 1.96, // 225/45R17
    },
    v8_na: {
        id: 'v8_na',
        name: 'V8 6.2L NA OHV',
        cylinders: 8,
        displacement: 6200,
        idleRpm: 650,
        launchRpm: 3500,
        redlineRpm: 6500,
        maxBoost: 100, // Naturally Aspirated
        spoolRate: 1.0, // Instant response
        revMultiplier: 2.2,
        shiftDropRpm: 1500,
        gearRatios: [4.056, 2.353, 1.531, 1.152],
        finalDrive: 3.73,
        tireCircumference: 2.13, // 275/40R20
    },
    v6_twinturbo: {
        id: 'v6_twinturbo',
        name: 'V6 3.8L Twin Turbo',
        cylinders: 6,
        displacement: 3800,
        idleRpm: 750,
        launchRpm: 4500,
        redlineRpm: 7200,
        maxBoost: 250, // 1.5 bar boost
        spoolRate: 0.25, // Quick spooling
        revMultiplier: 2.8,
        shiftDropRpm: 2000,
        gearRatios: [3.827, 2.360, 1.685, 1.312],
        finalDrive: 3.692,
        tireCircumference: 2.04, // 255/40R19
    }
};

type RunState = 'idle' | 'staging' | 'launch' | 'accelerating' | 'shifting' | 'coasting';

export class MockEcuProvider {
    private profile: EngineProfile;
    private timer: ReturnType<typeof setInterval> | null = null;
    private state: RunState = 'idle';
    private stateTicks = 0;
    private currentGear = 1;
    private data: SensorData;
    private onDataCallback: ((data: SensorData) => void) | null = null;

    constructor(profileId: EngineProfileId = 'i4_turbo') {
        this.profile = ENGINE_PROFILES[profileId];
        this.data = createDefaultSensorData();
        this.resetSensors();
    }

    setProfile(profileId: EngineProfileId) {
        this.profile = ENGINE_PROFILES[profileId];
        this.resetSensors();
    }

    getProfileInfo() {
        return this.profile;
    }

    onData(callback: (data: SensorData) => void) {
        this.onDataCallback = callback;
    }

    start() {
        if (this.timer) return;
        this.resetSensors();
        this.state = 'idle';
        this.stateTicks = 0;
        this.timer = setInterval(() => this.tick(), 50); // 20Hz update (50ms)
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Trigger Drag Race Sequence
    triggerDragRace() {
        if (this.state === 'idle' || this.state === 'coasting') {
            this.state = 'staging';
            this.stateTicks = 0;
            this.currentGear = 1;
            this.data.vehicleSpeed = 0;
        }
    }

    private resetSensors() {
        this.data.rpm = this.profile.idleRpm;
        this.data.map = 35; // idle vacuum (35kPa abs)
        this.data.tps = 0;
        this.data.coolantTemp = 85;
        this.data.iat = 30;
        this.data.oilTemp = 90;
        this.data.oilPressure = 200 + (this.data.rpm / 1000) * 50; // Dynamic
        this.data.batteryVoltage = 14.2;
        this.data.afr = 14.7;
        this.data.afrTarget = 14.7;
        this.data.advance = 15;
        this.data.syncStatus = true;
        this.data.vehicleSpeed = 0;
    }

    /** RPM とギアから車速 (km/h) を算出 */
    private calcSpeed(rpm: number, gear: number): number {
        const gearIdx = Math.max(0, Math.min(gear - 1, this.profile.gearRatios.length - 1));
        const gearRatio = this.profile.gearRatios[gearIdx];
        // v = (RPM * tireCircumference) / (gearRatio * finalDrive * 60) → m/s → km/h
        const speedMs = (rpm * this.profile.tireCircumference) / (gearRatio * this.profile.finalDrive * 60);
        return speedMs * 3.6; // m/s → km/h
    }

    private tick() {
        this.stateTicks++;
        let targetRpm = this.profile.idleRpm;
        let targetMap = 35;
        let targetTps = 0;
        let targetAfr = 14.7;

        switch (this.state) {
            case 'idle':
                targetRpm = this.profile.idleRpm;
                targetMap = 35;
                targetTps = 0;
                targetAfr = 14.7 + (Math.random() * 0.4 - 0.2); // slight AFR fluctuation

                // RPM fluctuation
                this.data.rpm = this.lerp(this.data.rpm, targetRpm + (Math.random() * 50 - 25), 0.2);
                this.data.vehicleSpeed = 0;
                break;

            case 'staging':
                // Two-step / Launch control bouncing
                targetTps = 100;
                targetMap = this.profile.maxBoost > 100 ? 100 + (this.stateTicks % 5) * 10 : 95; // Building some boost on two-step

                if (this.stateTicks % 4 === 0) {
                    this.data.rpm = this.profile.launchRpm + 150;
                    this.data.advance = -5; // Retard timing for two-step
                } else {
                    this.data.rpm = this.profile.launchRpm - 150;
                    this.data.advance = 10;
                }

                targetAfr = 12.0;
                this.data.vehicleSpeed = 0; // まだ止まっている

                // Stage for 2 seconds (40 ticks)
                if (this.stateTicks > 40) {
                    this.state = 'launch';
                    this.stateTicks = 0;
                }
                break;

            case 'launch':
                // Initial launch squat
                targetTps = 100;
                this.data.rpm = this.lerp(this.data.rpm, this.profile.launchRpm - 500, 0.5); // clutch drop drag
                targetMap = this.profile.maxBoost;
                targetAfr = 11.5;

                // ローンチ時は少し車速が出始める
                this.data.vehicleSpeed = this.lerp(this.data.vehicleSpeed, this.calcSpeed(this.data.rpm, 1) * 0.3, 0.3);

                if (this.stateTicks > 5) { // 0.25s
                    this.state = 'accelerating';
                    this.stateTicks = 0;
                }
                break;

            case 'accelerating':
                targetTps = 100;
                targetAfr = 11.5;
                targetMap = this.profile.maxBoost;

                // Calculate RPM climb based on gear (higher gear = slower revs)
                const revGain = (this.profile.revMultiplier * 80) / this.currentGear;
                this.data.rpm += revGain;

                // 車速をRPM・ギアから算出
                const targetSpeed = this.calcSpeed(this.data.rpm, this.currentGear);
                this.data.vehicleSpeed = this.lerp(this.data.vehicleSpeed, targetSpeed, 0.3);

                // Advance timing over RPM
                this.data.advance = 15 + ((this.data.rpm - 3000) / 4000) * 15;

                if (this.data.rpm >= this.profile.redlineRpm) {
                    if (this.currentGear < 4) {
                        this.state = 'shifting';
                        this.stateTicks = 0;
                    } else {
                        // Finished 1/4 mile
                        this.state = 'coasting';
                        this.stateTicks = 0;
                    }
                }
                break;

            case 'shifting':
                targetTps = 0; // Lift to shift (or flat shift)
                targetMap = 40;
                targetAfr = 16.0;
                this.data.advance = 5;

                // Drop RPM quickly
                this.data.rpm = this.lerp(this.data.rpm, this.profile.redlineRpm - this.profile.shiftDropRpm, 0.4);

                // シフト中も車速は維持〜微増（慣性で走り続ける）
                this.data.vehicleSpeed *= 1.002;

                if (this.stateTicks > 6) { // 300ms shift time
                    this.currentGear++;
                    this.state = 'accelerating';
                    this.stateTicks = 0;
                }
                break;

            case 'coasting':
                // Decelerate
                targetTps = 0;
                targetMap = 25; // High vacuum on decel
                targetAfr = 18.0; // Fuel cut
                this.data.advance = 10;

                this.data.rpm -= 30; // Slow decel in gear

                // 車速も減速
                this.data.vehicleSpeed = this.lerp(this.data.vehicleSpeed, 0, 0.03);

                if (this.data.rpm < this.profile.idleRpm + 500) {
                    this.state = 'idle';
                    this.stateTicks = 0;
                    this.currentGear = 1;
                }
                break;
        }

        // Apply smooth transitions to MAP and TPS (except instant changes)
        const spoolSpeed = this.state === 'coasting' || this.state === 'shifting' ? 0.8 : this.profile.spoolRate;
        this.data.map = this.lerp(this.data.map, targetMap, spoolSpeed);
        this.data.tps = this.lerp(this.data.tps, targetTps, 0.6);
        this.data.afr = this.lerp(this.data.afr, targetAfr, 0.3);

        // Update dependent sensors
        this.data.boostTarget = this.profile.maxBoost > 100 ? this.profile.maxBoost : 0;
        this.data.boostDuty = this.data.map > 100 ? Math.min(100, (this.data.map / this.profile.maxBoost) * 100) : 0;

        // Oil pressure rises with RPM
        const targetOilP = 200 + (this.data.rpm / 8000) * 500;
        this.data.oilPressure = this.lerp(this.data.oilPressure, targetOilP, 0.1);

        // Injector Duty Cycle rough estimation
        const airflow = (this.data.rpm * this.data.map) / 20000; // Fake airflow formula
        this.data.dutyCycle = targetTps > 0 ? Math.min(95, airflow) : 1;
        this.data.pulseWidth1 = (this.data.dutyCycle / 100) * (120000 / Math.max(1, this.data.rpm));

        // Inject noise/jitter for realism
        if (this.state !== 'staging') {
            this.data.rpm += (Math.random() - 0.5) * 10; // 10rpm jitter
        }
        this.data.map += (Math.random() - 0.5) * 2;
        this.data.batteryVoltage = 14.1 + (Math.random() * 0.2);

        this.data.timestamp = Date.now();

        if (this.onDataCallback) {
            this.onDataCallback({ ...this.data });
        }
    }

    private lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * factor;
    }
}
