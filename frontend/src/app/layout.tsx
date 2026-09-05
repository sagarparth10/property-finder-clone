import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/providers';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Property Nexus | Next-Gen Real Estate Super App',
  description:
    'Discover the future of real estate with Property Nexus. Search verified listings, collaborate with experts, and experience AI-guided property journeys.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} max-w-[100vw] overflow-x-clip bg-gray-50 text-gray-900 antialiased`}> 
        <Providers>
          <div className="flex min-h-screen min-w-0 flex-col">
            <Navbar />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
