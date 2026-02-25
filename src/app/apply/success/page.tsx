// [C1] Application Success Page
'use client'

import { CheckCircle } from 'lucide-react'

export default function ApplicationSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--stm-page-background)', padding: 'var(--stm-space-8)' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center', backgroundColor: 'var(--stm-card)', padding: 'var(--stm-space-12)', borderRadius: 'var(--stm-radius-lg)', boxShadow: 'var(--stm-shadow-md)', border: '1px solid var(--stm-border)' }}>
        <div style={{
          width: '80px', height: '80px',
          backgroundColor: 'color-mix(in srgb, var(--stm-success) 12%, transparent)',
          borderRadius: 'var(--stm-radius-full)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--stm-space-6)',
        }}>
          <CheckCircle style={{ width: '40px', height: '40px', color: 'var(--stm-success)' }} />
        </div>

        <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-4)' }}>
          Application Submitted!
        </div>

        <div style={{ color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-6)', lineHeight: '1.6', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)' }}>
          Thank you for submitting your vendor application. Our team will review your information and get back to you shortly.
        </div>

        <div style={{
          backgroundColor: 'color-mix(in srgb, var(--stm-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          padding: 'var(--stm-space-4)', marginBottom: 'var(--stm-space-6)',
        }}>
          <div style={{ color: 'var(--stm-primary)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', marginBottom: 'var(--stm-space-2)', fontFamily: 'var(--stm-font-body)' }}>
            What happens next?
          </div>
          <ul style={{ color: 'var(--stm-primary)', fontSize: 'var(--stm-text-sm)', textAlign: 'left', paddingLeft: 'var(--stm-space-5)', lineHeight: '1.8', fontFamily: 'var(--stm-font-body)', margin: 0 }}>
            <li>Our team will review your application</li>
            <li>You'll receive an email notification once approved</li>
            <li>After approval, you'll get your login credentials</li>
          </ul>
        </div>

        <div style={{ color: 'var(--stm-muted-foreground)', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)' }}>
          Questions? Contact us at{' '}
          <a href="mailto:support@singlethrow.com" style={{ color: 'var(--stm-primary)', textDecoration: 'underline' }}>
            support@singlethrow.com
          </a>
        </div>
      </div>
    </div>
  )
}
