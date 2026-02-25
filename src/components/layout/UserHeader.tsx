// [R-FOUNDATION] Sprint 2: User Header Component
// Purpose: Display user info and logout button in navigation

'use client';

import { useState } from 'react';
import { useViRAAuth } from '@/hooks/useViRAAuth';
import { getUserDisplayName, getRoleDisplayName } from '@/lib/auth';
import { LogOut, User, ChevronDown } from 'lucide-react';

export function UserHeader() {
  const { profile, signOut } = useViRAAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!profile) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--stm-space-3)',
          padding: 'var(--stm-space-3) var(--stm-space-4)',
          background: 'none',
          border: 'none',
          borderRadius: 'var(--stm-radius-md)',
          cursor: 'pointer',
          transition: 'background-color var(--stm-duration-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          backgroundColor: 'var(--stm-primary)',
          borderRadius: 'var(--stm-radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <User style={{ width: '16px', height: '16px', color: 'white' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <p style={{
            fontSize: 'var(--stm-text-sm)',
            fontWeight: 'var(--stm-font-medium)',
            color: 'rgba(255,255,255,0.9)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {getUserDisplayName(profile)}
          </p>
          <p style={{
            fontSize: 'var(--stm-text-xs)',
            color: 'rgba(255,255,255,0.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {profile.email}
          </p>
        </div>
        <ChevronDown style={{
          width: '14px',
          height: '14px',
          color: 'rgba(255,255,255,0.55)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--stm-duration-fast)',
          flexShrink: 0,
        }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: 'var(--stm-space-2)',
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-md)',
          boxShadow: 'var(--stm-shadow-lg)',
          border: '1px solid var(--stm-border)',
          overflow: 'hidden',
          zIndex: 50,
        }}>
          {/* User Info */}
          <div style={{
            padding: 'var(--stm-space-3) var(--stm-space-4)',
            borderBottom: '1px solid var(--stm-border)',
          }}>
            <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)', margin: 0 }}>
              {getUserDisplayName(profile)}
            </p>
            <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-1)', marginBottom: 'var(--stm-space-2)' }}>
              {profile.email}
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--stm-space-1) var(--stm-space-2)',
              borderRadius: 'var(--stm-radius-full)',
              fontSize: 'var(--stm-text-xs)',
              fontWeight: 'var(--stm-font-medium)',
              backgroundColor: 'color-mix(in srgb, var(--stm-primary) 12%, transparent)',
              color: 'var(--stm-primary)',
            }}>
              {getRoleDisplayName(profile.role)}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: 'var(--stm-space-3) var(--stm-space-4)',
              textAlign: 'left',
              fontSize: 'var(--stm-text-sm)',
              color: 'var(--stm-error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--stm-space-2)',
              transition: 'background-color var(--stm-duration-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--stm-error) 8%, transparent)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Sign Out
          </button>
        </div>
      )}

      {/* Click Outside to Close */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: -1 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
