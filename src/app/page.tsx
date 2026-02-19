// [R2.1] ViRA Dashboard - Main dashboard with navigation and system overview
// [C1] Sprint 4: Added vendor redirect - vendors see /vendor-portal instead
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Building,
  Star,
  Search,
  TrendingUp
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useViRAAuth } from '@/hooks/useViRAAuth';

interface DatabaseStats {
  vendors: number;
  projects: number;
  clients: number;
  ratings: number;
}

interface TopVendor {
  vendor_id: string;
  vendor_name: string;
  avg_overall_rating: number;
  total_projects: number;
  rated_projects: number;
}

interface ReviewStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

interface AnalyticsData {
  topVendors: TopVendor[];
  reviewStats: ReviewStats;
  recentActivity: Array<{
    project_id: string;
    project_title: string;
    vendor_name: string;
    project_overall_rating_calc: number;
    updated_at: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading: authLoading } = useViRAAuth();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // [C1] Redirect vendors to their portal
  useEffect(() => {
    if (!authLoading && profile?.role === 'vendor') {
      router.push('/vendor-portal');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();

        setStats(data.stats);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <ProtectedRoute>
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

                <Link href="/rate-project" style={{ textDecoration: 'none' }}>
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
                    <p style={{ color: '#D97706', fontSize: '0.875rem', fontWeight: '500' }}>Rate →</p>
                  </div>
                </Link>
              </div>

              {/* Analytics Sections */}
              {analytics && (
                <div style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                  
                  {/* Review Progress */}
                  {analytics.reviewStats.total > 0 && (
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Review Progress</h3>
                        <Link href="/admin?tab=reviews" className="text-primary hover:underline text-sm font-medium">
                          Manage →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-bold text-foreground">{analytics.reviewStats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-success h-full rounded-full transition-all duration-500"
                            style={{ width: `${analytics.reviewStats.completionRate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-success rounded-full" />
                            <span className="text-muted-foreground">{analytics.reviewStats.completed} Complete</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-warning rounded-full" />
                            <span className="text-muted-foreground">{analytics.reviewStats.pending} Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Performers */}
                  {analytics.topVendors.length > 0 && (
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Top Performers
                        </h3>
                        <Link href="/vendors" className="text-primary hover:underline text-sm font-medium">
                          View All →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {analytics.topVendors.slice(0, 5).map((vendor, index) => (
                          <Link
                            key={vendor.vendor_id}
                            href={`/vendors/${vendor.vendor_id}`}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                  {vendor.vendor_name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {vendor.rated_projects} rated project{vendor.rated_projects !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-warning fill-warning" />
                              <span className="font-bold text-foreground">{vendor.avg_overall_rating.toFixed(1)}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

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
    </ProtectedRoute>
  );
}
