// [R-FOUNDATION] Sprint 2: Layout Content Component
// Purpose: Conditionally render sidebar based on authentication and route

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNav } from './SidebarNav';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Routes that should not show sidebar (public pages)
  const publicRoutes = ['/login', '/unauthorized', '/account-inactive', '/error'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show sidebar only if authenticated and not on public route
  const showSidebar = user && !isPublicRoute && !isLoading;

  if (showSidebar) {
    return (
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
    );
  }

  // Full-width layout for public pages
  return <>{children}</>;
}
