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
        settings: string;
    };
    header: {
        usbConnect: string;
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
        veTableName: string;
        ignTableName: string;
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
    };
    common: {
        on: string;
        off: string;
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
        settings: '設定',
    },

    // ヘッダー
    header: {
        usbConnect: 'USB 接続',
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
        veTableName: 'VE テーブル (Volumetric Efficiency)',
        ignTableName: '点火マップ (Ignition Advance)',
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
    },

    // 共通
    common: {
        on: 'ON',
        off: 'OFF',
    },
};
