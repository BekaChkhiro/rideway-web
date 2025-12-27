import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/providers';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Bike Area - Motorcycle Community',
    template: '%s | Bike Area',
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
  authors: [{ name: 'Bike Area' }],
  creator: 'Bike Area',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Bike Area',
    title: 'Bike Area - Motorcycle Community',
    description:
      'Connect with motorcycle enthusiasts, share your rides, buy and sell bikes and parts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bike Area - Motorcycle Community',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'bg-background border-border',
                title: 'text-foreground',
                description: 'text-muted-foreground',
                success: 'border-green-500',
                error: 'border-destructive',
                warning: 'border-accent',
                info: 'border-primary',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
