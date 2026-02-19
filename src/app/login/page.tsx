// [R-FOUNDATION] Sprint 2: Login Page
// Purpose: User authentication interface with email/password login

// [R-CLERK-5]: Login page - Clerk embedded SignIn
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{
            fontSize: '2.25rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276',
            marginBottom: '0.5rem'
          }}>
            Welcome to ViRA
          </h1>
          <p style={{ color: '#6b7280' }}>
            Sign in to access vendor ratings and analytics
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn fallbackRedirectUrl="/" />
        </div>
      </div>
    </div>
  );
}
