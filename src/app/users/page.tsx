// [R-FOUNDATION] Sprint 2: User Management Page (Admin Only)
// Purpose: Admin interface to manage user accounts and roles

'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/types';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth';
import { Users, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

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
      console.error('Error updating user status:', err);
      alert('Failed to update user status: ' + err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users ({users.length})
            </h2>
            <button className="btn-primary" style={{ fontSize: '0.875rem' }}>
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                          className="flex items-center gap-1.5"
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600 font-medium">
                                Inactive
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            User Management Notes
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Admin:</strong> Full access to all features and user management</li>
            <li>• <strong>Team:</strong> Can rate projects and view vendor ratings</li>
            <li>• <strong>Vendor:</strong> Can view their own ratings only</li>
            <li>• Click status to toggle user active/inactive</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
