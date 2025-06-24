import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { SidebarNav } from '@/components/layout/SidebarNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'ViRA - Vendor Intelligence Recommendation Agent',
  description: 'Intelligent vendor recommendations and management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable}`} style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
          {/* Sidebar */}
          <div style={{ width: '16rem', flexShrink: 0 }}>
            <SidebarNav />
          </div>
          
          {/* Main Content */}
          <main style={{ flex: 1, overflow: 'auto' }}>
            <div style={{ height: '100%' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
