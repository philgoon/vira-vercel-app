// [R-FOUNDATION] Sprint 2: User Header Component
// Purpose: Display user info and logout button in navigation

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName, getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth';
import { LogOut, User, ChevronDown } from 'lucide-react';

export function UserHeader() {
  const { profile, signOut } = useAuth();
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
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors"
      >
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-100 truncate">
              {getUserDisplayName(profile)}
            </p>
            <p className="text-xs text-gray-300 truncate">{profile.email}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-300 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {getUserDisplayName(profile)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{profile.email}</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  profile.role
                )}`}
              >
                {getRoleDisplayName(profile.role)}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Click Outside to Close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
