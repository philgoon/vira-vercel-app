// [EPIC-002 M1] Top header bar — breadcrumb left, date + bell + ViRA Match right
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { GitCompareArrows } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

const BREADCRUMB_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/vendors': 'Vendors',
  '/projects': 'Projects',
  '/ratings': 'Ratings',
  '/clients': 'Clients',
  '/vira-match': 'ViRA Match',
  '/admin': 'Admin',
  '/vendor-portal': 'Vendor Portal',
};

export function TopHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).toUpperCase();

  const currentLabel = BREADCRUMB_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'ViRA';
  const onMatchPage = pathname === '/vira-match';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--stm-space-6)',
      height: '48px',
      borderBottom: '1px solid var(--stm-border)',
      backgroundColor: 'var(--stm-card)',
      flexShrink: 0,
      gap: '12px',
    }}>
      {/* Breadcrumb — left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
          ViRA
        </span>
        <span style={{ fontSize: '12px', color: 'var(--stm-border)', fontFamily: 'var(--stm-font-body)' }}>/</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', textTransform: 'capitalize' }}>
          {currentLabel}
        </span>
      </div>

      {/* Right side — date + divider + bell + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.08em', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
          {today}
        </span>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--stm-border)' }} />

        {/* Notification Bell */}
        <NotificationBell variant="light" />

        {/* ViRA Match CTA — hidden on match page */}
        {!onMatchPage && (
          <button
            onClick={() => router.push('/vira-match')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
              padding: 'var(--stm-space-2) var(--stm-space-4)',
              background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))',
              color: 'white', border: 'none',
              borderRadius: 'var(--stm-radius-md)',
              fontSize: 'var(--stm-text-sm)',
              fontWeight: 'var(--stm-font-semibold)',
              cursor: 'pointer',
              fontFamily: 'var(--stm-font-body)',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <GitCompareArrows style={{ width: '14px', height: '14px' }} />
            Run ViRA Match
          </button>
        )}
      </div>
    </div>
  );
}
