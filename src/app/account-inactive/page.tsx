// [R-FOUNDATION] Sprint 2: Account Inactive Page
// Purpose: Display when user account is deactivated

'use client';

import { useRouter } from 'next/navigation';
import { UserX, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountInactivePage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-600 rounded-full mb-6">
          <UserX className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Account Inactive
        </h1>

        {/* Message */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Your account has been deactivated. Please contact your administrator
            to reactivate your access.
          </p>
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:admin@example.com"
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
          >
            <Mail className="w-5 h-5" />
            Contact Administrator
          </a>
          <button
            onClick={() => signOut()}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
