import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://contribute-theonepercentclub.web.app'),
  title: {
    default: 'Club-Eve | Contribution',
    template: '%s | Club-Eve',
  },
  description: 'Interactive community evaluation, focus mode integrity monitoring, and voting platform for active contribution rounds.',
  keywords: ['Club-Eve', 'Contribution Portal', 'Community Evaluation', 'Focus Mode', 'Integrity Monitoring', 'Active Rounds'],
  authors: [{ name: 'Club-Eve Team' }],
  creator: 'Club-Eve',
  publisher: 'Club-Eve',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Club-Eve',
    title: 'Club-Eve | Contribution',
    description: 'Interactive community evaluation, focus mode integrity monitoring, and voting platform for active contribution rounds.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Club-Eve Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club-Eve | Contribution',
    description: 'Interactive community evaluation, focus mode integrity monitoring, and voting platform for active contribution rounds.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 min-h-screen flex flex-col selection:bg-[#003C5E] selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
