'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, GitCompareArrows, Building, Star } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vira-match', label: 'ViRA Match', icon: GitCompareArrows },
  { href: '/rate-project', label: 'Reviews', icon: Star },
  { href: '/vendors', label: 'Vendors', icon: Users },
  { href: '/clients', label: 'Clients', icon: Building },
  { href: '/projects', label: 'Projects', icon: Briefcase },
];

export function SidebarNav() {
  const pathname = usePathname();

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
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
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

      {/* Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #34495E'
      }}>
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#95a5a6' }}>
          ViRA v1.0
        </div>
      </div>
    </div>
  );
}
