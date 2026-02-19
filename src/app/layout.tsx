import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { LayoutContent } from '@/components/layout/LayoutContent';

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
        <ClerkProvider signInUrl="/login" signUpUrl="/login" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
          <LayoutContent>{children}</LayoutContent>
        </ClerkProvider>
      </body>
    </html>
  );
}
