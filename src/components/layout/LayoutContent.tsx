// [R-FOUNDATION] Sprint 2: Layout Content Component
// Purpose: Conditionally render sidebar based on authentication and route
// [R-STM] Splash screen with morse loader during auth resolution

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();

  // Routes that should not show sidebar (public pages)
  const publicRoutes = ['/login', '/unauthorized', '/account-inactive', '/error'];
  const publicRoutePrefixes = ['/vendor/apply', '/apply'];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix));

  // Splash screen while Clerk loads (non-public routes only)
  if (!isLoaded && !isPublicRoute) {
    return (
      <div className="stm-watermark" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--stm-page-background)',
        gap: 'var(--stm-space-8)',
      }}>
        {/* VIRA Wordmark */}
        <div className="stm-tool-wordmark stm-tool-wordmark-lg stm-tool-wordmark-color">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/icons/stm-morse-code-color.svg"
            alt="STM"
            className="stm-tool-wordmark-icon"
          />
          <span className="stm-tool-wordmark-name">VIRA</span>
        </div>

        {/* STM Morse Loader */}
        <div className="stm-loader stm-loader-lg">
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
        </div>

        <p style={{
          color: 'var(--stm-muted-foreground)',
          fontFamily: 'var(--stm-font-body)',
          fontSize: 'var(--stm-text-sm)',
          fontWeight: 'var(--stm-font-medium)',
        }}>
          Loading ViRA...
        </p>
      </div>
    );
  }

  const showSidebar = !isPublicRoute && isLoaded && !!isSignedIn;

  if (showSidebar) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--stm-page-background)',
      }}>
        {/* Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <SidebarNav />
        </div>

        {/* Main Content - watermark floats above content as pointer-events-none overlay */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <main style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <TopHeader />
            <div style={{ flex: 1 }}>
              {children}
            </div>
          </main>
          {/* Watermark overlay - sits on top of content, click-through */}
          <div className="stm-watermark" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }} />
        </div>
      </div>
    );
  }

  // Full-width layout for public pages
  return <>{children}</>;
}
