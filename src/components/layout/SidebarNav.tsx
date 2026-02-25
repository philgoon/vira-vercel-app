'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, GitCompareArrows, Building, Star, Settings, UserCog, SlidersHorizontal } from 'lucide-react';
import { UserHeader } from './UserHeader';
import { useViRAAuth } from '@/hooks/useViRAAuth';


// [C1] Sprint 4: Removed vendor role - vendors now have dedicated VendorSidebarNav
// [EPIC-002 M1] Grouped nav sections: Intel / Directory / Platform
const navSections = [
  {
    label: 'Intel',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'team'] },
      { href: '/vira-match', label: 'ViRA Match', icon: GitCompareArrows, roles: ['admin', 'team'] },
    ],
  },
  {
    label: 'Directory',
    items: [
      { href: '/vendors', label: 'Vendor Roster', icon: Users, roles: ['admin', 'team'] },
      { href: '/clients', label: 'Clients', icon: Building, roles: ['admin', 'team'] },
      { href: '/projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'team'] },
      { href: '/ratings', label: 'Ratings', icon: Star, roles: ['admin', 'team'] },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
      { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
      { href: '/settings', label: 'Settings', icon: SlidersHorizontal, roles: ['admin'] },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useViRAAuth();

  return (
    <div className="stm-sidebar" style={{ position: 'relative', width: '280px' }}>
      {/* Header with VIRA Wordmark */}
      <div className="stm-sidebar-header">
        <Link href="/" className="stm-sidebar-logo" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/icons/stm-morse-code-white.svg"
            alt="STM"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          />
          <span className="stm-sidebar-logo-text" style={{ fontFamily: 'var(--stm-font-wordmark)', letterSpacing: '0.15em', fontSize: 'var(--stm-text-3xl)', color: 'white' }}>
            VIRA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="stm-sidebar-nav">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(item =>
            !profile || item.roles.includes(profile.role)
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <p style={{
                padding: 'var(--stm-space-3) var(--stm-space-4) var(--stm-space-1)',
                fontSize: 'var(--stm-text-xs)',
                fontWeight: 'var(--stm-font-semibold)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}>
                {section.label}
              </p>
              <ul className="stm-nav-items">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href} className="stm-nav-item">
                      <Link
                        href={item.href}
                        className={`stm-nav-link ${isActive ? 'stm-nav-link-active' : ''}`}
                      >
                        <item.icon className="stm-nav-icon" />
                        <span className="stm-nav-item-label">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div className="stm-sidebar-footer">
        <UserHeader />
      </div>
    </div>
  );
}
