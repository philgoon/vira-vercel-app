import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { LayoutContent } from '@/components/layout/LayoutContent';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
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
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
      <body style={{ fontFamily: 'var(--stm-font-body)', backgroundColor: 'var(--stm-page-background)' }}>
        <ClerkProvider signInUrl="/login" signUpUrl="/login" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
          <LayoutContent>{children}</LayoutContent>
        </ClerkProvider>
      </body>
    </html>
  );
}
