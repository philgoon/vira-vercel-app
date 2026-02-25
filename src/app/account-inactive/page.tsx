// [R-FOUNDATION] Sprint 2: Account Inactive Page
// Purpose: Display when user account is deactivated

'use client';

import { useRouter } from 'next/navigation';
import { UserX, Mail } from 'lucide-react';
import { useViRAAuth } from '@/hooks/useViRAAuth';

export default function AccountInactivePage() {
  const { profile, signOut } = useViRAAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--stm-muted)',
      padding: 'var(--stm-space-4)',
    }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          backgroundColor: 'var(--stm-muted-foreground)',
          borderRadius: 'var(--stm-radius-full)',
          marginBottom: 'var(--stm-space-6)',
        }}>
          <UserX style={{ width: '36px', height: '36px', color: 'white' }} />
        </div>

        <h1 style={{
          fontSize: 'var(--stm-text-3xl)',
          fontWeight: 'var(--stm-font-bold)',
          color: 'var(--stm-foreground)',
          marginBottom: 'var(--stm-space-4)',
        }}>
          Account Inactive
        </h1>

        <div style={{
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-lg)',
          boxShadow: 'var(--stm-shadow-md)',
          padding: 'var(--stm-space-6)',
          marginBottom: 'var(--stm-space-6)',
        }}>
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-4)' }}>
            Your account has been deactivated. Please contact your administrator to reactivate your access.
          </p>
          {profile && (
            <div style={{
              backgroundColor: 'var(--stm-muted)',
              borderRadius: 'var(--stm-radius-md)',
              padding: 'var(--stm-space-3) var(--stm-space-4)',
              fontSize: 'var(--stm-text-sm)',
            }}>
              <span style={{ color: 'var(--stm-muted-foreground)' }}>Email: </span>
              <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{profile.email}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
          <a
            href="mailto:admin@example.com"
            className="btn-primary"
            style={{ width: '100%', padding: 'var(--stm-space-3)', justifyContent: 'center' }}
          >
            <Mail style={{ width: '16px', height: '16px' }} />
            Contact Administrator
          </a>
          <button
            onClick={() => signOut()}
            style={{
              width: '100%',
              padding: 'var(--stm-space-3)',
              backgroundColor: 'var(--stm-card)',
              color: 'var(--stm-foreground)',
              border: '1px solid var(--stm-border)',
              borderRadius: 'var(--stm-radius-lg)',
              fontSize: 'var(--stm-text-sm)',
              fontWeight: 'var(--stm-font-medium)',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
