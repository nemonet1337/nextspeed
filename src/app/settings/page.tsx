import styles from './page.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>設定</h1>
            <p className={styles.pageDesc}>
                接続設定、表示設定、ECU パラメータの詳細設定を行います。
            </p>

            <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>⚙️</div>
                <h2 className={styles.placeholderTitle}>アプリ設定</h2>
                <p className={styles.placeholderText}>
                    ECU 接続後、詳細な設定パラメータにアクセスできます。
                </p>
                <ul className={styles.featureList}>
                    <li>シリアルポート設定 (ボーレート等)</li>
                    <li>表示単位の切り替え (℃/℉, kPa/PSI)</li>
                    <li>ダッシュボードレイアウトのカスタマイズ</li>
                    <li>ECU 基本設定 (エンジンタイプ, 気筒数, インジェクタ特性)</li>
                    <li>トリガーパターン設定</li>
                </ul>
            </div>
        </div>
    );
}
