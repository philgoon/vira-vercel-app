// Top header bar with notifications
'use client';

import NotificationBell from '@/components/notifications/NotificationBell';

export function TopHeader() {
  return (
    <div style={{
      height: '4rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: '2rem',
      paddingRight: '2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <NotificationBell />
    </div>
  );
}
