import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import AppShell from '../components/Layout/AppShell';
import { Toaster } from 'react-hot-toast';

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
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(30, 30, 45, 0.9)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
