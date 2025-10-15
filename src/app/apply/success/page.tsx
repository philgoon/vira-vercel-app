// [C1] Application Success Page
'use client'

import { CheckCircle } from 'lucide-react'

export default function ApplicationSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '32rem', textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <div style={{ width: '5rem', height: '5rem', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={48} color="#10b981" />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
          Application Submitted!
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Thank you for submitting your vendor application. Our team will review your information and get back to you shortly.
        </p>
        
        <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#075985', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            What happens next?
          </p>
          <ul style={{ color: '#0c4a6e', fontSize: '0.875rem', textAlign: 'left', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Our team will review your application</li>
            <li>You'll receive an email notification once approved</li>
            <li>After approval, you'll get your login credentials</li>
          </ul>
        </div>
        
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Questions? Contact us at{' '}
          <a href="mailto:support@singlethrow.com" style={{ color: '#1A5276', textDecoration: 'underline' }}>
            support@singlethrow.com
          </a>
        </p>
      </div>
    </div>
  )
}
