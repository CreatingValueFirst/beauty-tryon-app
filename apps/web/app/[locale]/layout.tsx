import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../../styles/globals.css';
import { Providers } from '@/components/providers';
import { locales } from '@/i18n';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true,
  viewportFit: 'cover', // Support iOS safe area insets
  themeColor: '#8B5CF6',
};

export const metadata: Metadata = {
  title: 'BeautyTryOn - Virtual Hair & Nail Try-On',
  description: 'Try on different hairstyles and nail designs virtually using AI and AR technology',
  keywords: ['virtual try-on', 'hair styles', 'nail designs', 'AR', 'beauty tech'],
  authors: [{ name: 'BeautyTryOn Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BeautyTryOn',
  },
  formatDetection: {
    telephone: false,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 15
  const { locale } = await params;

  // Get messages for the locale (middleware ensures valid locale)
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
