// [R-FOUNDATION] Sprint 2: Unauthorized Access Page
// Purpose: Display when user doesn't have required role for a page

'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useViRAAuth } from '@/hooks/useViRAAuth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { profile, signOut } = useViRAAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'color-mix(in srgb, var(--stm-error) 6%, var(--stm-muted))',
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
          backgroundColor: 'var(--stm-error)',
          borderRadius: 'var(--stm-radius-full)',
          marginBottom: 'var(--stm-space-6)',
        }}>
          <ShieldAlert style={{ width: '36px', height: '36px', color: 'white' }} />
        </div>

        <h1 style={{
          fontSize: 'var(--stm-text-3xl)',
          fontWeight: 'var(--stm-font-bold)',
          color: 'var(--stm-foreground)',
          marginBottom: 'var(--stm-space-4)',
        }}>
          Access Denied
        </h1>

        <div style={{
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-lg)',
          boxShadow: 'var(--stm-shadow-md)',
          padding: 'var(--stm-space-6)',
          marginBottom: 'var(--stm-space-6)',
        }}>
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-4)' }}>
            You don&apos;t have permission to access this page.
          </p>
          {profile && (
            <div style={{
              backgroundColor: 'var(--stm-muted)',
              borderRadius: 'var(--stm-radius-md)',
              padding: 'var(--stm-space-3) var(--stm-space-4)',
              fontSize: 'var(--stm-text-sm)',
              textAlign: 'left',
            }}>
              <p style={{ color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>
                <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>Role: </span>
                <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
              </p>
              <p style={{ color: 'var(--stm-muted-foreground)' }}>
                <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>Email: </span>
                {profile.email}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '100%',
              padding: 'var(--stm-space-3)',
              backgroundColor: 'var(--stm-muted-foreground)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--stm-radius-lg)',
              fontSize: 'var(--stm-text-sm)',
              fontWeight: 'var(--stm-font-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--stm-space-2)',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
            style={{ width: '100%', padding: 'var(--stm-space-3)', justifyContent: 'center' }}
          >
            <Home style={{ width: '16px', height: '16px' }} />
            Go to Home
          </button>
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

        <p style={{ marginTop: 'var(--stm-space-6)', fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
          Need different access?{' '}
          <a href="mailto:admin@example.com" style={{ color: 'var(--stm-primary)', fontWeight: 'var(--stm-font-medium)' }}>
            Contact your administrator
          </a>
        </p>
      </div>
    </div>
  );
}
