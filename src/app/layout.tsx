import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Rideway - Motorcycle Community',
    template: '%s | Rideway',
  },
  description:
    'Connect with motorcycle enthusiasts, share your rides, buy and sell bikes and parts.',
  keywords: [
    'motorcycle',
    'bikes',
    'community',
    'riders',
    'marketplace',
    'forum',
  ],
  authors: [{ name: 'Rideway' }],
  creator: 'Rideway',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Rideway',
    title: 'Rideway - Motorcycle Community',
    description:
      'Connect with motorcycle enthusiasts, share your rides, buy and sell bikes and parts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rideway - Motorcycle Community',
    description:
      'Connect with motorcycle enthusiasts, share your rides, buy and sell bikes and parts.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#141f1a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
