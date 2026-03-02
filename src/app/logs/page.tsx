import styles from './page.module.css';

export default function LogsPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>データログ</h1>
            <p className={styles.pageDesc}>
                ECU からのリアルタイムデータをログとして記録し、グラフで可視化します。
            </p>

            <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>📊</div>
                <h2 className={styles.placeholderTitle}>データログ機能</h2>
                <p className={styles.placeholderText}>
                    ECU 接続後、リアルタイムデータの記録・再生・エクスポート機能が利用可能になります。
                </p>
                <ul className={styles.featureList}>
                    <li>リアルタイムグラフ描画</li>
                    <li>複数チャンネルの同時記録</li>
                    <li>CSV / MSL 形式でのエクスポート</li>
                    <li>記録データの再生と分析</li>
                </ul>
            </div>
        </div>
    );
}
