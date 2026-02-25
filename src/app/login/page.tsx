// [R-FOUNDATION] Sprint 2: Login Page
// [R-CLERK-5]: Login page - STM split-screen layout with Clerk embedded SignIn

import { SignIn } from '@clerk/nextjs';
import { MorseAnimation } from '@/components/brand/MorseAnimation';

export default function LoginPage() {
  return (
    <div className="stm-login">
      {/* Brand Panel (Left) */}
      <div className="stm-login-brand stm-surface-morse stm-surface-morse-light">
        <div className="stm-login-brand-dot-grid" />
        <div className="stm-login-brand-content">
          <MorseAnimation />

          <div className="stm-login-tagline">
            <h1>Vendor Intelligence,<br />Recommendation Agent</h1>
            <p>
              Data-driven vendor matching and performance analytics
              for strategic partnership decisions.
            </p>
          </div>

          <div className="stm-login-divider" />
          <div className="stm-login-attribution">A Single Throw Tool</div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="stm-login-form stm-watermark stm-watermark-auth">
        <div className="stm-login-form-inner">
          {/* VIRA Product Logo */}
          <div className="stm-login-product-logo">
            <div className="stm-tool-wordmark stm-tool-wordmark-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/icons/stm-morse-code-color.svg"
                alt="STM"
                className="stm-tool-wordmark-icon"
              />
              <span className="stm-tool-wordmark-name">VIRA</span>
            </div>
          </div>

          {/* Clerk SignIn */}
          <div className="flex justify-center">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 w-full',
                  headerTitle: 'font-sans',
                  headerSubtitle: 'font-sans',
                  formButtonPrimary: 'bg-[var(--stm-primary)] hover:opacity-90',
                  footerActionLink: 'text-[var(--stm-primary)]',
                }
              }}
            />
          </div>

          <div className="stm-login-form-footer">
            Powered by Single Throw
          </div>
        </div>
      </div>
    </div>
  );
}
