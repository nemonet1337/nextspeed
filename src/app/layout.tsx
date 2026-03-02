import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';

export const metadata: Metadata = {
  title: 'NextSpeed – ECU Tuning Tool',
  description:
    'RusEFI / Speeduino 対応 ECU チューニングツール。USB・Bluetooth でリアルタイム接続し、センサー情報の閲覧やマップ編集を行います。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Sidebar />
        <Header />
        <main
          style={{
            marginLeft: 'var(--sidebar-width)',
            marginTop: 'var(--header-height)',
            padding: '24px',
            minHeight: 'calc(100vh - var(--header-height))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
