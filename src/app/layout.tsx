import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'MEDNEXUS – AI Healthcare Intelligence',
  description: 'Smarter Healthcare. Better Decisions. Production-grade hospital decision support & EHR platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-medblue-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
