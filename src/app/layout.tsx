import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import AppShell from '../components/Layout/AppShell';

export const metadata: Metadata = {
  title: 'NextSpeed – ECU Tuning Tool',
  description: 'RusEFI / Speeduino 対応 ECU チューニングツール。USBでリアルタイム接続し、センサー情報の閲覧やマップ編集を行います。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
