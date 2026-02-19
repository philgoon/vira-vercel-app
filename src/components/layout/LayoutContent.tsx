// [R-FOUNDATION] Sprint 2: Layout Content Component
// Purpose: Conditionally render sidebar based on authentication and route

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

  const showSidebar = !isPublicRoute && isLoaded && !!isSignedIn;

  if (showSidebar) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Sidebar */}
        <div style={{ width: '16rem', flexShrink: 0 }}>
          <SidebarNav />
        </div>
        
        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <TopHeader />
          <div style={{ flex: 1, overflow: 'auto' }}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Full-width layout for public pages
  return <>{children}</>;
}
