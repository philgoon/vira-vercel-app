'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, GitCompareArrows, Building, Star, UserCog, Settings, Store } from 'lucide-react';
import { UserHeader } from './UserHeader';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'team', 'vendor'] },
  { href: '/vendor-portal', label: 'Vendor Portal', icon: Store, roles: ['vendor'] },
  { href: '/vira-match', label: 'ViRA Match', icon: GitCompareArrows, roles: ['admin', 'team'] },
  { href: '/rate-project', label: 'Reviews', icon: Star, roles: ['admin', 'team'] },
  { href: '/vendors', label: 'Vendors', icon: Users, roles: ['admin', 'team'] },
  { href: '/clients', label: 'Clients', icon: Building, roles: ['admin', 'team'] },
  { href: '/projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'team'] },
  { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => 
    !profile || item.roles.includes(profile.role)
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#2C3E50',
      color: '#ECF0F1'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #34495E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#6B8F71',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem', color: 'white' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: '600',
              color: '#ECF0F1'
            }}>ViRA</h1>
          </Link>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : '#ECF0F1',
                backgroundColor: isActive ? '#6B8F71' : 'transparent',
                fontWeight: '500',
                transition: 'background-color 150ms'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#34495E';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #34495E'
      }}>
        <UserHeader />
      </div>
    </div>
  );
}
