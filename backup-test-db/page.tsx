// [R6.1] Updated database connection test page with correct schema
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DatabaseStats {
  vendors: number;
  projects: number;
  clients: number;
  ratings: number;
}

export default function DatabaseTestPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test each table with correct names
        const [vendorsResult, projectsResult, clientsResult, ratingsResult] = await Promise.all([
          supabase.from('vendors').select('vendor_id', { count: 'exact', head: true }),
          supabase.from('projects').select('project_id', { count: 'exact', head: true }),
          supabase.from('clients').select('client_id', { count: 'exact', head: true }),
          supabase.from('ratings').select('rating_id', { count: 'exact', head: true }),
        ]);

        // Check for errors
        if (vendorsResult.error) throw new Error(`Vendors table: ${vendorsResult.error.message}`);
        if (projectsResult.error) throw new Error(`Projects table: ${projectsResult.error.message}`);
        if (clientsResult.error) throw new Error(`Clients table: ${clientsResult.error.message}`);
        if (ratingsResult.error) throw new Error(`Ratings table: ${ratingsResult.error.message}`);

        setStats({
          vendors: vendorsResult.count || 0,
          projects: projectsResult.count || 0,
          clients: clientsResult.count || 0,
          ratings: ratingsResult.count || 0,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276'
          }}>Database Connection Test</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Verifying Supabase integration and data migration
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          
          {loading && (
            <div className="professional-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: '2px solid #1A5276',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280' }}>Testing database connection...</p>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>
                ❌ Connection Error
              </h3>
              <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{error}</p>
              
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '0.375rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Troubleshooting Steps:</h4>
                <ul style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                  <li>• Check your .env.local file has correct Supabase credentials</li>
                  <li>• Verify tables exist in your Supabase dashboard</li>
                  <li>• Ensure Row Level Security policies allow access</li>
                  <li>• Restart your development server: npm run dev</li>
                </ul>
              </div>
            </div>
          )}

          {stats && (
            <>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#15803d', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ✅ Connection Successful!
                </h3>
                <p style={{ color: '#166534', fontSize: '0.875rem' }}>
                  All tables are accessible and contain data.
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#E8F4F8',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem', color: '#1A5276' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A5276', marginBottom: '0.5rem' }}>
                    {stats.vendors}
                  </h3>
                  <p style={{ color: '#6b7280', fontWeight: '500' }}>Vendors</p>
                </div>

                <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#F0F4F1',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem', color: '#6B8F71' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6B8F71', marginBottom: '0.5rem' }}>
                    {stats.projects}
                  </h3>
                  <p style={{ color: '#6b7280', fontWeight: '500' }}>Projects</p>
                </div>

                <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#F1F1F1',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem', color: '#6E6F71' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6E6F71', marginBottom: '0.5rem' }}>
                    {stats.clients}
                  </h3>
                  <p style={{ color: '#6b7280', fontWeight: '500' }}>Clients</p>
                </div>

                <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#FEF3C7',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706', marginBottom: '0.5rem' }}>
                    {stats.ratings}
                  </h3>
                  <p style={{ color: '#6b7280', fontWeight: '500' }}>Ratings</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="professional-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  🎉 Ready for Next Steps!
                </h3>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Your Supabase integration is working perfectly! Here's what you can do now:</p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>• Visit <strong>/vendors</strong> to see your vendor database with real data</li>
                    <li>• Visit <strong>/projects</strong> to see your project management system</li>
                    <li>• Visit <strong>/clients</strong> to see your client management system</li>
                    <li>• Test the AI vendor matching on the homepage with real vendor data</li>
                    <li>• API endpoints are ready for additional UI development</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
