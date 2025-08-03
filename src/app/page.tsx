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
  TrendingUp
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
          supabase.from('clients_summary').select('*', { count: 'exact', head: true }),
          supabase.from('projects_with_vendor').select('*', { count: 'exact', head: true }).eq('rating_status', 'Complete'),
        ]);

        // Debug logging
        console.log('Dashboard data results:', {
          vendors: { count: vendorsResult.count, error: vendorsResult.error },
          projects: { count: projectsResult.count, error: projectsResult.error },
          clients: { count: clientsResult.count, error: clientsResult.error },
          ratings: { count: ratingsResult.count, error: ratingsResult.error }
        });

        // Check for errors
        if (vendorsResult.error) throw new Error(`Vendors table: ${vendorsResult.error.message}`);
        if (projectsResult.error) throw new Error(`Projects table: ${projectsResult.error.message}`);
        if (clientsResult.error) throw new Error(`Clients summary table: ${clientsResult.error.message}`);
        if (ratingsResult.error) throw new Error(`Completed ratings query: ${ratingsResult.error.message}`);

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
              {/* Stats Overview - Dashboard Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
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

                <Link href="/ratings" style={{ textDecoration: 'none' }}>
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
                    <p style={{ color: '#D97706', fontSize: '0.875rem', fontWeight: '500' }}>Review →</p>
                  </div>
                </Link>
              </div>

              {/* Hero Section - Primary Business Actions */}
              <div style={{ marginBottom: '2rem' }}>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2rem',
                  maxWidth: '1000px',
                  margin: '0 auto'
                }}>
                  {/* ViRA Match - Primary CTA */}
                  <Link href="/vira-match" style={{ textDecoration: 'none' }}>
                    <div className="professional-card" style={{
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      backgroundColor: '#1A5276',
                      color: 'white',
                      border: 'none'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.backgroundColor = '#154466';
                        e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(26, 82, 118, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.backgroundColor = '#1A5276';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                      }}
                    >
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                      }}>
                        <Search style={{ width: '2rem', height: '2rem', color: 'white' }} />
                      </div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                        ViRA Match
                      </h3>
                      <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '1rem' }}>
                        Find the perfect vendor for your next project using AI-powered matching
                      </p>
                      <div style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        Start Matching →
                      </div>
                    </div>
                  </Link>

                  {/* Rate Project - Data Collection CTA */}
                  <Link href="/rate-project" style={{ textDecoration: 'none' }}>
                    <div className="professional-card" style={{
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      backgroundColor: '#6B8F71',
                      color: 'white',
                      border: 'none'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.backgroundColor = '#5a7a60';
                        e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(107, 143, 113, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.backgroundColor = '#6B8F71';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                      }}
                    >
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                      }}>
                        <TrendingUp style={{ width: '2rem', height: '2rem', color: 'white' }} />
                      </div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                        Rate Project
                      </h3>
                      <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '1rem' }}>
                        Submit ratings for completed projects to improve vendor intelligence
                      </p>
                      <div style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        Rate Project →
                      </div>
                    </div>
                  </Link>
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
