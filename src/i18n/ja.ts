// 翻訳辞書の型定義
export interface Translations {
    setup: {
        title: string;
        subtitle: string;
        language: string;
        ecuType: string;
        start: string;
    };
    nav: {
        dashboard: string;
        tuning: string;
        logs: string;
        failsafe: string;
        features: string;
        accessories: string;
        settings: string;
    };
    header: {
        usbConnect: string;
        mockConnect: string;
        triggerDragRace: string;
        connecting: string;
        disconnect: string;
        portDialog: {
            title: string;
            port: string;
            baudRate: string;
            cancel: string;
            connect: string;
            noPorts: string;
        };
        mockDialog: {
            title: string;
            engine: string;
            cancel: string;
            connect: string;
        };
    };
    status: {
        disconnected: string;
        connecting: string;
        connected: string;
        error: string;
    };
    dashboard: {
        title: string;
        descConnected: string;
        descDisconnected: string;
        gauge: {
            rpm: string;
            coolantTemp: string;
            iat: string;
            tps: string;
            map: string;
            afr: string;
            battery: string;
            advance: string;
            vehicleSpeed: string;
        };
        panel: {
            fuel: string;
            pulseWidth1: string;
            pulseWidth2: string;
            dutyCycle: string;
            afrTarget: string;
            fuelPressure: string;
            egoCorrection: string;
            gammaEnrich: string;
            veCurr: string;
            ignition: string;
            advance: string;
            dwell: string;
            triggerErrors: string;
            sync: string;
            syncOk: string;
            syncNg: string;
            oilTempPressure: string;
            oilTemp: string;
            oilPressure: string;
            boost: string;
            boostTarget: string;
            boostDuty: string;
            idle: string;
            idleTarget: string;
            iacPosition: string;
            misc: string;
            crankAngle: string;
            fan: string;
        };
    };
    tuning: {
        title: string;
        desc: string;
        veTab: string;
        ignTab: string;
        afrTab: string;
        boostTab: string;
        vvtTab: string;
        veTableName: string;
        ignTableName: string;
        afrTableName: string;
        boostTableName: string;
        vvtTableName: string;
        paramsTab: string;
        burn: string;
        read: string;
        saveFile: string;
        loadFile: string;
        burnSuccess: string;
        readSuccess: string;
        commError: string;
        saveSuccess: string;
        saveFailed: string;
        loadSuccess: string;
        loadFailed: string;
        electronOnly: string;
        electronOnlyLoad: string;
    };
    logs: {
        title: string;
        desc: string;
        resume: string;
        pause: string;
        clear: string;
        export: string;
        waiting: string;
        connectPrompt: string;
        exportSuccess: string;
        exportFailed: string;
    };
    settings: {
        title: string;
        desc: string;
        saved: string;
        save: string;
        appSettings: string;
        language: string;
        languageJa: string;
        languageEn: string;
        units: string;
        metric: string;
        imperial: string;
        baudRate: string;
        ecuSettings: string;
        ecuSettingsNote: string;
        displacement: string;
        cylinders: string;
        injectorSize: string;
        // ブースト制御
        boostControl: string;
        boostEnabled: string;
        boostMode: string;
        boostModeOpen: string;
        boostModeClosed: string;
        maxBoost: string;
        boostCutPoint: string;
        solenoidFreq: string;
        // 電子スロットル (ETB)
        etbControl: string;
        etbEnabled: string;
        pedalMin: string;
        pedalMax: string;
        throttleMin: string;
        throttleMax: string;
        etbPGain: string;
        etbIGain: string;
        etbDGain: string;
        // 可変バルブタイミング (VVT)
        vvtControl: string;
        vvtEnabled: string;
        vvtMode: string;
        vvtModeOnOff: string;
        vvtModeOpenLoop: string;
        vvtModeClosedLoop: string;
        vvtMaxAdvance: string;
        vvtMinAdvance: string;
        vvtFreq: string;
        // アイドル制御
        idleControl: string;
        idleMode: string;
        idleModeStepper: string;
        idleModePWM: string;
        idleModeETB: string;
        idleTargetWarm: string;
        idleTargetCold: string;
        iacMaxOpen: string;
        idleAdvance: string;
        // 始動・暖機補正
        startupEnrich: string;
        crankingRpm: string;
        crankingEnrich: string;
        primingPulse: string;
        warmupEnrich: string;
        asePercent: string;
        aseDuration: string;
        aePercent: string;
        // 燃料カット・保護
        fuelCutProtection: string;
        dfcoEnableRpm: string;
        dfcoRecoverRpm: string;
        dfcoTpsThreshold: string;
        softRevLimit: string;
        hardRevLimit: string;
        revLimitMode: string;
        revLimitFuelCut: string;
        revLimitIgnCut: string;
        revLimitBoth: string;
        // フェイルセーフ温度設定
        failsafe: string;
        failsafeNote: string;
        maxCltWarning: string;
        maxCltCut: string;
        maxIat: string;
        maxOilTemp: string;
        minOilPressure: string;
        minBatteryV: string;
        // 便利機能
        convenienceFeatures: string;
        launchControl: string;
        launchEnabled: string;
        launchRpm: string;
        launchRetard: string;
        launchBoostCut: string;
        flatShift: string;
        flatShiftEnabled: string;
        flatShiftRpmDrop: string;
        autoBlip: string;
        autoBlipEnabled: string;
        autoBlipDuration: string;
        // アクセサリ
        accessories: string;
        fanOnTemp: string;
        fanOffTemp: string;
        fanHysteresis: string;
        fuelPumpPrime: string;
        tachoEnabled: string;
        nitrousEnabled: string;
        acControlEnabled: string;
        acLowRpm: string;
        // フレックスフューエル
        flexFuel: string;
        flexFuelEnabled: string;
        flexSensorEnabled: string;
        flexE0Afr: string;
        flexE85Afr: string;
    };
    common: {
        on: string;
        off: string;
        enabled: string;
        disabled: string;
    };
}

export const ja: Translations = {
    // 起動ダイアログ
    setup: {
        title: 'NextSpeed セットアップ',
        subtitle: 'はじめに言語と使用するECUを選択してください',
        language: '言語',
        ecuType: 'ECU タイプ',
        start: '開始',
    },

    // サイドバー
    nav: {
        dashboard: 'ダッシュボード',
        tuning: 'チューニング',
        logs: 'データログ',
        failsafe: 'フェイルセーフ',
        features: '便利機能',
        accessories: 'アクセサリ',
        settings: '設定',
    },

    // ヘッダー
    header: {
        usbConnect: 'USB 接続',
        mockConnect: 'デモ接続',
        triggerDragRace: '🏁 ドラッグレース',
        connecting: '接続中...',
        disconnect: '切断',
        portDialog: {
            title: 'シリアルポート選択',
            port: 'ポート',
            baudRate: 'ボーレート',
            cancel: 'キャンセル',
            connect: '接続',
            noPorts: '利用可能なポートが見つかりません',
        },
        mockDialog: {
            title: 'エンジンプロファイル選択',
            engine: 'エンジン',
            cancel: 'キャンセル',
            connect: '接続',
        },
    },

    // ステータスインジケータ
    status: {
        disconnected: '未接続',
        connecting: '接続中...',
        connected: '接続済み',
        error: 'エラー',
    },

    // ダッシュボード
    dashboard: {
        title: 'ダッシュボード',
        descConnected: 'ECU に接続中 — リアルタイムでセンサーデータを表示しています',
        descDisconnected: 'ECU に接続してリアルタイムデータを表示します。右上の接続ボタンから USB で接続してください。',
        gauge: {
            rpm: 'RPM',
            coolantTemp: '水温',
            iat: '吸気温度',
            tps: 'TPS',
            map: 'MAP',
            afr: '空燃比',
            battery: 'バッテリー',
            advance: '点火進角',
            vehicleSpeed: '車速',
        },
        panel: {
            fuel: '燃料系',
            pulseWidth1: 'パルス幅 1',
            pulseWidth2: 'パルス幅 2',
            dutyCycle: 'デューティ',
            afrTarget: '目標 AFR',
            fuelPressure: '燃圧',
            egoCorrection: 'EGO 補正',
            gammaEnrich: 'ガンマ補正',
            veCurr: '現在 VE',

            ignition: '点火系',
            advance: '進角',
            dwell: 'ドウェル',
            triggerErrors: 'トリガーエラー',
            sync: '同期',
            syncOk: 'OK',
            syncNg: 'NG',

            oilTempPressure: '油温・油圧',
            oilTemp: '油温',
            oilPressure: '油圧',

            boost: 'ブースト',
            boostTarget: '目標',
            boostDuty: 'デューティ',

            idle: 'アイドル',
            idleTarget: '目標 RPM',
            iacPosition: 'IAC 位置',

            misc: 'その他',
            crankAngle: 'クランク角',
            fan: 'ファン',
        },
    },

    // チューニング
    tuning: {
        title: 'チューニング',
        desc: 'VE マップ・点火マップの閲覧と編集を行います。セルをクリックして値を変更できます。',
        veTab: 'VE マップ (燃料)',
        ignTab: '点火マップ',
        afrTab: 'AFR ターゲット',
        boostTab: 'ブースト目標',
        vvtTab: 'VVT マップ',
        veTableName: 'VE テーブル (Volumetric Efficiency)',
        ignTableName: '点火マップ (Ignition Advance)',
        afrTableName: 'AFR ターゲットテーブル (Air-Fuel Ratio)',
        boostTableName: 'ブースト目標テーブル (Boost Target)',
        vvtTableName: 'VVT マップ (Variable Valve Timing)',
        paramsTab: 'パラメータ設定',
        burn: '🔥 ECU に書き込み (Burn)',
        read: '📥 ECU から読み込み',
        saveFile: '💾 ファイルに保存',
        loadFile: '📂 ファイルから読み込み',
        burnSuccess: 'ECUへ書き込み要求を送信しました。(デモ)',
        readSuccess: 'ECUへ読み込み要求を送信しました。(デモ)',
        commError: 'ECUとの通信エラー: ',
        saveSuccess: 'チューニングデータを保存しました。',
        saveFailed: '保存に失敗しました: ',
        loadSuccess: 'チューニングデータを読み込みました。',
        loadFailed: '読み込みに失敗しました: ',
        electronOnly: 'ファイル保存はElectron環境でのみサポートされています。',
        electronOnlyLoad: 'ファイル読み込みはElectron環境でのみサポートされています。',
    },

    // データログ
    logs: {
        title: 'データログ',
        desc: 'ECU からのリアルタイムデータをログとして記録し、グラフで可視化します。',
        resume: '▶ 再開',
        pause: '⏸ 一時停止',
        clear: '🗑 クリア',
        export: '💾 CSV エクスポート',
        waiting: 'データを待機中...',
        connectPrompt: 'ECUに接続してリアルタイムデータを取得してください。',
        exportSuccess: 'ログをCSVで保存しました。',
        exportFailed: '保存に失敗しました。',
    },

    // 設定
    settings: {
        title: '設定',
        desc: '接続設定、表示設定、ECU パラメータの詳細設定を行います。',
        saved: '✓ 保存しました',
        save: '💾 設定を保存',
        appSettings: 'アプリケーション設定',
        language: '言語',
        languageJa: '日本語',
        languageEn: 'English',
        units: '単位系',
        metric: 'メートル法 (℃, kPa)',
        imperial: 'ヤード・ポンド法 (℉, PSI)',
        baudRate: 'デフォルトボーレート',
        ecuSettings: 'ECU 基本設定 (デモ)',
        ecuSettingsNote: '※ 実際のECUへの書き込みは未実装です',
        displacement: '排気量 (cc)',
        cylinders: '気筒数',
        injectorSize: 'インジェクターサイズ (cc/min)',

        // ブースト制御
        boostControl: 'ブースト制御',
        boostEnabled: 'ブースト制御を有効化',
        boostMode: '制御方式',
        boostModeOpen: 'オープンループ',
        boostModeClosed: 'クローズドループ',
        maxBoost: '最大ブースト圧 (kPa)',
        boostCutPoint: 'ブーストカットポイント (kPa)',
        solenoidFreq: 'ソレノイド周波数 (Hz)',

        // 電子スロットル (ETB)
        etbControl: '電子スロットル (ETB / DBW)',
        etbEnabled: '電子スロットルを有効化',
        pedalMin: 'ペダル最小 ADC',
        pedalMax: 'ペダル最大 ADC',
        throttleMin: 'スロットル最小 ADC',
        throttleMax: 'スロットル最大 ADC',
        etbPGain: 'PID P ゲイン',
        etbIGain: 'PID I ゲイン',
        etbDGain: 'PID D ゲイン',

        // 可変バルブタイミング (VVT)
        vvtControl: '可変バルブタイミング (VVT)',
        vvtEnabled: 'VVT を有効化',
        vvtMode: 'VVT モード',
        vvtModeOnOff: 'ON/OFF',
        vvtModeOpenLoop: 'オープンループ',
        vvtModeClosedLoop: 'クローズドループ',
        vvtMaxAdvance: '最大進角 (°)',
        vvtMinAdvance: '最小進角 (°)',
        vvtFreq: '制御周波数 (Hz)',

        // アイドル制御
        idleControl: 'アイドル制御',
        idleMode: 'アイドル方式',
        idleModeStepper: 'ステッパーモーター',
        idleModePWM: 'PWM バルブ',
        idleModeETB: '電子スロットル (ETB)',
        idleTargetWarm: '目標アイドル RPM (暖機後)',
        idleTargetCold: '目標アイドル RPM (冷間時)',
        iacMaxOpen: 'IAC 最大開度 (%)',
        idleAdvance: 'アイドル進角 (°)',

        // 始動・暖機補正
        startupEnrich: '始動・暖機補正',
        crankingRpm: 'クランキング RPM 閾値',
        crankingEnrich: 'クランキング補正量 (%)',
        primingPulse: 'プライミングパルス (ms)',
        warmupEnrich: '暖機補正量 (%)',
        asePercent: '始動後補正 ASE (%)',
        aseDuration: 'ASE 補正期間 (秒)',
        aePercent: '加速補正 AE (%)',

        // 燃料カット・保護
        fuelCutProtection: '燃料カット・保護',
        dfcoEnableRpm: 'DFCO 有効 RPM',
        dfcoRecoverRpm: 'DFCO 復帰 RPM',
        dfcoTpsThreshold: 'DFCO TPS 閾値 (%)',
        softRevLimit: 'ソフトレブリミット (rpm)',
        hardRevLimit: 'ハードレブリミット (rpm)',
        revLimitMode: 'レブリミット方式',
        revLimitFuelCut: '燃料カット',
        revLimitIgnCut: '点火カット',
        revLimitBoth: '両方',

        // フェイルセーフ温度設定
        failsafe: 'フェイルセーフ・保護設定',
        failsafeNote: 'エンジン保護のための各種上限/下限設定',
        maxCltWarning: '水温上限 警告 (°C)',
        maxCltCut: '水温上限 カット (°C)',
        maxIat: '吸気温度 上限 (°C)',
        maxOilTemp: '油温 上限 (°C)',
        minOilPressure: '油圧 下限 (kPa)',
        minBatteryV: 'バッテリー電圧 下限 (V)',

        // 便利機能
        convenienceFeatures: '便利機能',
        launchControl: 'ローンチコントロール',
        launchEnabled: 'ローンチコントロールを有効化',
        launchRpm: 'ローンチ リミット RPM',
        launchRetard: '点火リタード (°)',
        launchBoostCut: 'ブーストカット有効',
        flatShift: 'フラットシフト',
        flatShiftEnabled: 'フラットシフトを有効化',
        flatShiftRpmDrop: 'カット RPM ドロップ',
        autoBlip: 'オートブリッピング',
        autoBlipEnabled: 'オートブリッピングを有効化',
        autoBlipDuration: 'ブリップ期間 (ms)',

        // アクセサリ
        accessories: 'アクセサリ',
        fanOnTemp: 'ファン ON 温度 (°C)',
        fanOffTemp: 'ファン OFF 温度 (°C)',
        fanHysteresis: 'ファンヒステリシス (°C)',
        fuelPumpPrime: '燃料ポンプ プライム時間 (秒)',
        tachoEnabled: 'タコ出力を有効化',
        nitrousEnabled: 'ナイトラスを有効化',
        acControlEnabled: 'A/C 制御を有効化',
        acLowRpm: 'A/C カット RPM 下限',

        // フレックスフューエル
        flexFuel: 'フレックスフューエル',
        flexFuelEnabled: 'フレックスフューエルを有効化',
        flexSensorEnabled: 'エタノール含有率センサー',
        flexE0Afr: 'E0 時 AFR',
        flexE85Afr: 'E85 時 AFR',
    },

    // 共通
    common: {
        on: 'ON',
        off: 'OFF',
        enabled: '有効',
        disabled: '無効',
    },
};
