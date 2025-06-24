// [R2.1] ViRA Dashboard - Main dashboard with navigation and system overview
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Building, 
  Star, 
  Search, 
  ChevronRight, 
  Database,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DatabaseStats {
  vendors: number;
  projects: number;
  clients: number;
  ratings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
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

    loadDashboardData();
  }, []);

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 'bold',
                color: '#1A5276'
              }}>ViRA Dashboard</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                Vendor Intelligence & Recommendation Assistant
              </p>
            </div>
            <Link
              href="/vira-match"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1A5276',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                transition: 'background-color 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#154466';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A5276';
              }}
            >
              <Search style={{ width: '1rem', height: '1rem' }} />
              ViRA Match
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          
          {/* System Status */}
          {loading && (
            <div className="professional-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: '2px solid #1A5276',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading dashboard data...</p>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>
                ❌ System Error
              </h3>
              <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {stats && (
            <>
              {/* Welcome Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#15803d',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Activity style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#15803d', fontWeight: '600', marginBottom: '0.25rem' }}>
                      System Online & Ready
                    </h3>
                    <p style={{ color: '#166534', fontSize: '0.875rem' }}>
                      All systems operational. Database connected with {stats.vendors + stats.projects + stats.clients + stats.ratings} total records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <Link href="/vendors" style={{ textDecoration: 'none' }}>
                  <div className="professional-card" style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 150ms, box-shadow 150ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  }}
                  >
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
                      <Users style={{ width: '1.5rem', height: '1.5rem', color: '#1A5276' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A5276', marginBottom: '0.5rem' }}>
                      {stats.vendors}
                    </h3>
                    <p style={{ color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Vendors</p>
                    <p style={{ color: '#1A5276', fontSize: '0.875rem', fontWeight: '500' }}>Manage →</p>
                  </div>
                </Link>

                <Link href="/projects" style={{ textDecoration: 'none' }}>
                  <div className="professional-card" style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 150ms, box-shadow 150ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  }}
                  >
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
                      <Briefcase style={{ width: '1.5rem', height: '1.5rem', color: '#6B8F71' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6B8F71', marginBottom: '0.5rem' }}>
                      {stats.projects}
                    </h3>
                    <p style={{ color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Projects</p>
                    <p style={{ color: '#6B8F71', fontSize: '0.875rem', fontWeight: '500' }}>Manage →</p>
                  </div>
                </Link>

                <Link href="/clients" style={{ textDecoration: 'none' }}>
                  <div className="professional-card" style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 150ms, box-shadow 150ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  }}
                  >
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
                      <Building style={{ width: '1.5rem', height: '1.5rem', color: '#6E6F71' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6E6F71', marginBottom: '0.5rem' }}>
                      {stats.clients}
                    </h3>
                    <p style={{ color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Clients</p>
                    <p style={{ color: '#6E6F71', fontSize: '0.875rem', fontWeight: '500' }}>Manage →</p>
                  </div>
                </Link>

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
                    <Star style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} />
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706', marginBottom: '0.5rem' }}>
                    {stats.ratings}
                  </h3>
                  <p style={{ color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Ratings</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Data source</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <Link href="/vira-match" style={{ textDecoration: 'none' }}>
                  <div className="professional-card" style={{ 
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 150ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#E8F4F8',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Search style={{ width: '1.5rem', height: '1.5rem', color: '#1A5276' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                          ViRA Match
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Find the perfect vendor for your next project
                        </p>
                      </div>
                      <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                    </div>
                  </div>
                </Link>

                <Link href="/rate-project" style={{ textDecoration: 'none' }}>
                  <div className="professional-card" style={{ 
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 150ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Star style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                          Rate Project
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Submit ratings for completed projects
                        </p>
                      </div>
                      <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                    </div>
                  </div>
                </Link>

                {/* Add Sample Data Button - For Testing */}
                {stats && (stats.vendors + stats.projects + stats.clients) === 0 && (
                  <div className="professional-card" style={{ 
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 150ms',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde047'
                  }}
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/add-sample-data', {
                        method: 'POST'
                      });
                      if (response.ok) {
                        window.location.reload();
                      } else {
                        alert('Failed to add sample data');
                      }
                    } catch (error) {
                      alert('Error adding sample data');
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#fbbf24',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Database style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>
                          Add Sample Data
                        </h3>
                        <p style={{ color: '#a16207', fontSize: '0.875rem' }}>
                          Click to add test vendors, projects, and clients
                        </p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Setup
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="professional-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Database style={{ width: '1.25rem', height: '1.25rem', color: '#1A5276' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                    System Status
                  </h3>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Database:</span>
                    <span style={{ fontWeight: '500', color: '#15803d', marginLeft: '0.5rem' }}>Connected ✓</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Total Records:</span>
                    <span style={{ fontWeight: '500', color: '#374151', marginLeft: '0.5rem' }}>
                      {stats.vendors + stats.projects + stats.clients + stats.ratings}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>AI Matching:</span>
                    <span style={{ fontWeight: '500', color: '#15803d', marginLeft: '0.5rem' }}>Ready ✓</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Last Updated:</span>
                    <span style={{ fontWeight: '500', color: '#374151', marginLeft: '0.5rem' }}>
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
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
