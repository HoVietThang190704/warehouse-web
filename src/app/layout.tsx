import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import { antdThemeConfig } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { QueryProvider } from '@/providers/query-provider';
import { AntdStaticBridge } from '@/components/ui';
import vi from '@/locales/vi.json';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: vi.metadata.title,
  description: vi.metadata.description,
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-sushi-bg text-sushi-text antialiased font-sans">
        <AntdRegistry>
          <ConfigProvider theme={antdThemeConfig}>
            <App className="min-h-screen">
              <AntdStaticBridge />
              <I18nProvider>
                <QueryProvider>
                  {children}
                </QueryProvider>
              </I18nProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
