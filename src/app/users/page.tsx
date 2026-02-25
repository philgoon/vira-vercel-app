// [R-FOUNDATION] Sprint 2: User Management Page (Admin Only)
// Purpose: Admin interface to manage user accounts and roles

'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/types';
import { getRoleDisplayName } from '@/lib/auth';
import { Users, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const roleBadgeStyle = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'var(--stm-error)',
    team: 'var(--stm-primary)',
    vendor: 'var(--stm-success)',
  };
  const color = colors[role] || 'var(--stm-muted-foreground)';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--stm-space-1) var(--stm-space-2)',
    borderRadius: 'var(--stm-radius-full)',
    fontSize: 'var(--stm-text-xs)',
    fontWeight: 'var(--stm-font-medium)',
    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    color,
  };
};

const thStyle = {
  padding: 'var(--stm-space-3) var(--stm-space-4)',
  textAlign: 'left' as const,
  fontSize: 'var(--stm-text-xs)',
  fontWeight: 'var(--stm-font-semibold)',
  color: 'var(--stm-muted-foreground)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: 'var(--stm-space-3) var(--stm-space-4)',
  fontSize: 'var(--stm-text-sm)',
  color: 'var(--stm-foreground)',
  borderBottom: '1px solid var(--stm-border)',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update user status');
      fetchUsers();
    } catch (err: any) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ padding: 'var(--stm-space-8)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--stm-space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)', marginBottom: 'var(--stm-space-2)' }}>
            <Users style={{ width: '28px', height: '28px', color: 'var(--stm-primary)' }} />
            <h1 style={{ fontSize: 'var(--stm-text-3xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', margin: 0 }}>
              User Management
            </h1>
          </div>
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: 'var(--stm-space-4)',
            backgroundColor: 'color-mix(in srgb, var(--stm-error) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--stm-error) 30%, transparent)',
            borderRadius: 'var(--stm-radius-md)',
            marginBottom: 'var(--stm-space-6)',
            fontSize: 'var(--stm-text-sm)',
            color: 'var(--stm-error)',
          }}>
            {error}
          </div>
        )}

        {/* Table Card */}
        <div style={{
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-lg)',
          boxShadow: 'var(--stm-shadow-sm)',
          overflow: 'hidden',
          border: '1px solid var(--stm-border)',
        }}>
          {/* Table Header Bar */}
          <div style={{
            padding: 'var(--stm-space-4) var(--stm-space-6)',
            borderBottom: '1px solid var(--stm-border)',
            backgroundColor: 'var(--stm-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>
              All Users ({users.length})
            </h2>
            <button className="btn-primary" style={{ fontSize: 'var(--stm-text-sm)' }}>
              <Plus style={{ width: '14px', height: '14px' }} />
              Add User
            </button>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div style={{ padding: 'var(--stm-space-12)', textAlign: 'center' }}>
              <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-4)' }}>
                <span className="stm-loader-capsule stm-loader-dot" />
                <span className="stm-loader-capsule stm-loader-dot" />
                <span className="stm-loader-capsule stm-loader-dot" />
                <span className="stm-loader-capsule stm-loader-dash" />
                <span className="stm-loader-capsule stm-loader-dash" />
                <span className="stm-loader-capsule stm-loader-dash" />
              </div>
              <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 'var(--stm-space-12)', textAlign: 'center' }}>
              <Users style={{ width: '40px', height: '40px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-4)' }} />
              <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>No users found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--stm-muted)', borderBottom: '1px solid var(--stm-border)' }}>
                    {['User', 'Role', 'Status', 'Last Login', 'Created', ''].map((h, i) => (
                      <th key={i} style={{ ...thStyle, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      style={{ backgroundColor: 'var(--stm-card)', transition: 'background-color var(--stm-duration-fast)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--stm-card)')}
                    >
                      <td style={tdStyle}>
                        <p style={{ fontWeight: 'var(--stm-font-medium)', margin: 0 }}>{user.full_name || 'No name'}</p>
                        <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', margin: 0 }}>{user.email}</p>
                      </td>
                      <td style={tdStyle}>
                        <span style={roleBadgeStyle(user.role)}>{getRoleDisplayName(user.role)}</span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle style={{ width: '14px', height: '14px', color: 'var(--stm-success)' }} />
                              <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-success)', fontWeight: 'var(--stm-font-medium)' }}>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle style={{ width: '14px', height: '14px', color: 'var(--stm-error)' }} />
                              <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-error)', fontWeight: 'var(--stm-font-medium)' }}>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--stm-muted-foreground)' }}>
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--stm-muted-foreground)' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--stm-space-1)' }}>
                          <button style={{ padding: 'var(--stm-space-2)', color: 'var(--stm-primary)', background: 'none', border: 'none', borderRadius: 'var(--stm-radius-md)', cursor: 'pointer' }}>
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button style={{ padding: 'var(--stm-space-2)', color: 'var(--stm-error)', background: 'none', border: 'none', borderRadius: 'var(--stm-radius-md)', cursor: 'pointer' }}>
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: 'var(--stm-space-6)',
          padding: 'var(--stm-space-4)',
          backgroundColor: 'color-mix(in srgb, var(--stm-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
        }}>
          <h3 style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', marginBottom: 'var(--stm-space-2)' }}>
            User Management Notes
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)', fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', paddingLeft: 'var(--stm-space-4)' }}>
            <li><strong>Admin:</strong> Full access to all features and user management</li>
            <li><strong>Team:</strong> Can rate projects and view vendor ratings</li>
            <li><strong>Vendor:</strong> Can view their own ratings only</li>
            <li>Click status to toggle user active/inactive</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
