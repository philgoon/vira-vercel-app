// [R-FOUNDATION] Sprint 2: Unauthorized Access Page
// Purpose: Display when user doesn't have required role for a page

'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            You don't have permission to access this page.
          </p>
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Your Role:</span>{' '}
                <span className="capitalize">{profile.role}</span>
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
          <button
            onClick={() => signOut()}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
          >
            Sign Out
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-600">
          Need different access?{' '}
          <a
            href="mailto:admin@example.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact your administrator
          </a>
        </p>
      </div>
    </div>
  );
}
