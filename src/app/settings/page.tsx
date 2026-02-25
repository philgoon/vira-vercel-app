// [EPIC-002 M1] Settings page — Platform section placeholder
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ padding: 'var(--stm-space-8)' }}>
        <div style={{ marginBottom: 'var(--stm-space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)', marginBottom: 'var(--stm-space-2)' }}>
            <SlidersHorizontal style={{ width: '28px', height: '28px', color: 'var(--stm-primary)' }} />
            <h1 style={{ fontSize: 'var(--stm-text-3xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', margin: 0 }}>
              Settings
            </h1>
          </div>
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
            Platform configuration and preferences
          </p>
        </div>

        <div style={{
          padding: 'var(--stm-space-12)',
          backgroundColor: 'var(--stm-card)',
          border: '1px solid var(--stm-border)',
          borderRadius: 'var(--stm-radius-lg)',
          textAlign: 'center',
        }}>
          <SlidersHorizontal style={{ width: '40px', height: '40px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-4)' }} />
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
            Settings coming in a future milestone.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
