'use client';

// Simple test page to check if vendor details routing works
export default function TestVendorPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Vendor Page</h1>
      <p>If you can see this, the routing is working.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/vendors/VEN-0007" 
          style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--stm-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.375rem'
          }}
        >
          Test Direct Link to VEN-0007
        </a>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <a 
          href="/vendors" 
          style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--stm-secondary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.375rem'
          }}
        >
          Back to Vendors List
        </a>
      </div>
    </div>
  );
}