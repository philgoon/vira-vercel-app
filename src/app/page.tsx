// [R2.1] ViRA Dashboard - Prototype layout: KPI cards + performance bars + review queue
// [EPIC-002 M3] Dashboard redesign matching prototype spec exactly
// [C1] Sprint 4: vendors redirect to /vendor-portal
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, ExternalLink } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useViRAAuth } from '@/hooks/useViRAAuth';

interface DashboardData {
  stats: { vendors: number; projects: number; clients: number; ratings: number };
  topVendors: Array<{ vendor_id: string; vendor_name: string; avg_overall_rating: number; total_projects: number; rated_projects: number; recommendation_pct?: number; service_categories?: string[]; availability_status?: string }>;
  reviewStats: { total: number; completed: number; pending: number; completionRate: number };
  recentActivity: Array<{ project_id: string; project_title: string; vendor_name: string; project_overall_rating_calc: number; updated_at: string }>;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function dotUrgency(days: number): 'urgent' | 'pending' | 'new' {
  if (days > 10) return 'urgent';
  if (days > 3) return 'pending';
  return 'new';
}

const DOT_STYLES = {
  urgent:  { backgroundColor: 'var(--stm-error)',   boxShadow: '0 0 5px rgba(244,0,0,0.5)' },
  pending: { backgroundColor: 'var(--stm-warning)',  boxShadow: 'none' },
  new:     { backgroundColor: 'var(--stm-accent)',   boxShadow: 'none' },
} as const;

const AVAIL_COLOR: Record<string, string> = {
  Available:   'var(--stm-success)',
  Limited:     'var(--stm-warning)',
  'On Leave':  'var(--stm-warning)',
  Unavailable: 'var(--stm-error)',
};

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading: authLoading } = useViRAAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredKpi, setHoveredKpi] = useState<string | null>(null);

  // [C1] Redirect vendors to their portal
  useEffect(() => {
    if (!authLoading && profile?.role === 'vendor') router.push('/vendor-portal');
  }, [profile, authLoading, router]);

  const loadData = useCallback(() => {
    setLoading(true);
    fetch('/api/dashboard')
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(d => { setData(d); setError(null); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const avgScore = data?.topVendors?.length
    ? data.topVendors.reduce((s, v) => s + v.avg_overall_rating, 0) / data.topVendors.length
    : null;

  const kpiCards = data ? [
    { id: 'vendors',  label: 'Active Vendors',  value: String(data.stats.vendors),  color: 'var(--stm-primary)',    href: '/vendors' },
    { id: 'projects', label: 'Projects Rated',  value: String(data.stats.ratings),  color: 'var(--stm-foreground)', href: '/projects' },
    { id: 'score',    label: 'Avg Vendor Score', value: avgScore ? avgScore.toFixed(1) : '—', color: 'var(--stm-success)', href: '/vendors' },
    { id: 'pending',  label: 'Pending Reviews', value: String(data.reviewStats.pending), color: 'var(--stm-warning)', href: '/ratings' },
  ] : [];

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: 'var(--stm-radius)',
    fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-xs)',
    fontWeight: 'var(--stm-font-semibold)', cursor: 'pointer',
    border: '1px solid var(--stm-border)', background: 'var(--stm-background)',
    color: 'var(--stm-muted-foreground)', transition: 'all 0.14s',
  };

  const panel: React.CSSProperties = {
    backgroundColor: 'var(--stm-card)',
    border: '1px solid var(--stm-border)',
    borderRadius: 'var(--stm-radius-lg)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 3,
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--stm-space-5)' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em' }}>
              Dashboard
            </div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: 'var(--stm-muted-foreground)', marginTop: '4px' }}>
              Performance overview across all vendors and projects
            </div>
          </div>
          <button onClick={loadData} style={btnGhost}>
            <RotateCcw style={{ width: '13px', height: '13px' }} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--stm-space-16)' }}>
            <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center' }}>
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dash" />
              <span className="stm-loader-capsule stm-loader-dash" />
              <span className="stm-loader-capsule stm-loader-dash" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: 'var(--stm-space-4)', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 25%, transparent)', borderRadius: 'var(--stm-radius-md)', marginBottom: 'var(--stm-space-6)' }}>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-error)', margin: 0 }}>{error}</p>
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {kpiCards.map(({ id, label, value, color, href }) => {
                const isHovered = hoveredKpi === id;
                return (
                  <Link key={id} href={href} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        backgroundColor: 'var(--stm-card)',
                        border: `1px solid ${isHovered ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                        borderRadius: 'var(--stm-radius-lg)',
                        padding: '18px 20px',
                        position: 'relative',
                        zIndex: 3,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: isHovered ? '0 4px 20px rgba(26, 82, 118, 0.1)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredKpi(id)}
                      onMouseLeave={() => setHoveredKpi(null)}
                    >
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                        background: 'linear-gradient(90deg, var(--stm-primary), var(--stm-accent))',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.18s',
                      }} />
                      <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', margin: '0 0 12px' }}>
                        {label}
                      </p>
                      <p style={{ fontSize: '34px', fontWeight: '800', color, lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
                        {value}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Lower Grid — 1fr 320px matching prototype */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>

              {/* Vendor Performance */}
              <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--stm-border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-foreground)', letterSpacing: '0.01em' }}>Top Vendor Performance</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)' }}>6-Month Average</span>
                </div>
                <div style={{ padding: '18px' }}>
                  {data.topVendors.length === 0 ? (
                    <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', textAlign: 'center', padding: 'var(--stm-space-8) 0', margin: 0 }}>No rated vendors yet</p>
                  ) : (
                    data.topVendors.map((vendor, i) => {
                      const pct = (vendor.avg_overall_rating / 10) * 100;
                      return (
                        <Link key={vendor.vendor_id} href={`/vendors/${vendor.vendor_id}`} style={{ textDecoration: 'none' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i === data.topVendors.length - 1 ? 0 : '12px', borderRadius: 'var(--stm-radius-sm)', transition: 'background 0.12s', padding: '3px 4px' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span style={{ width: '120px', fontSize: '12px', fontWeight: '500', color: 'var(--stm-muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                              {vendor.vendor_name}
                            </span>
                            <div style={{ flex: 1, height: '5px', backgroundColor: 'var(--stm-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--stm-primary), var(--stm-accent))', borderRadius: '3px', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--stm-primary)', width: '30px', textAlign: 'right', flexShrink: 0 }}>
                              {vendor.avg_overall_rating.toFixed(1)}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Review Queue */}
              <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--stm-border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-foreground)', letterSpacing: '0.01em' }}>Review Queue</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)' }}>
                    {data.reviewStats.pending > 0 ? `${data.reviewStats.pending} Pending` : 'All Clear'}
                  </span>
                </div>
                {data.recentActivity.length === 0 ? (
                  <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', margin: 0 }}>No recent activity</p>
                  </div>
                ) : (
                  data.recentActivity.map((item, i) => {
                    const days = daysSince(item.updated_at);
                    const urgency = dotUrgency(days);
                    const dot = DOT_STYLES[urgency];
                    const ageLabel = days === 0 ? 'Today' : `${days}d`;
                    return (
                      <Link key={item.project_id} href="/ratings" style={{ textDecoration: 'none' }}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: i === data.recentActivity.length - 1 ? 'none' : '1px solid var(--stm-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, ...dot }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--stm-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.project_title}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '1px' }}>
                              {item.vendor_name}
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--stm-muted-foreground)', flexShrink: 0, letterSpacing: '0.04em' }}>
                            {ageLabel}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

            </div>

            {/* Vendor Directory Table */}
            {data.topVendors.length > 0 && (
              <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--stm-border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-foreground)', letterSpacing: '0.01em' }}>Vendor Directory — Top Performers</span>
                  <Link href="/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: 'var(--stm-muted-foreground)', textDecoration: 'none', padding: '7px 14px', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius)', background: 'var(--stm-background)', transition: 'all 0.14s' }}>
                    <ExternalLink style={{ width: '12px', height: '12px' }} />
                    View Full Roster
                  </Link>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--stm-border)' }}>
                      {['Vendor', 'Category', 'Score', 'Projects', 'Recommend', 'Availability'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', textAlign: h === 'Score' || h === 'Projects' || h === 'Recommend' ? 'center' : 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topVendors.map((vendor, i) => {
                      const initials = vendor.vendor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                      const category = vendor.service_categories?.length ? vendor.service_categories[0] : '—';
                      const avail = vendor.availability_status ?? '—';
                      const availColor = AVAIL_COLOR[avail] ?? 'var(--stm-muted-foreground)';
                      const recPct = vendor.recommendation_pct != null ? `${Math.round(vendor.recommendation_pct)}%` : '—';
                      return (
                        <tr
                          key={vendor.vendor_id}
                          style={{ borderBottom: i === data.topVendors.length - 1 ? 'none' : '1px solid var(--stm-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          onClick={() => router.push(`/vendors/${vendor.vendor_id}`)}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--stm-radius-full)', background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{initials}</span>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--stm-foreground)' }}>{vendor.vendor_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--stm-muted-foreground)' }}>{category}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-primary)' }}>{vendor.avg_overall_rating.toFixed(1)}</span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--stm-muted-foreground)' }}>{vendor.total_projects}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--stm-foreground)' }}>{recPct}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: availColor, padding: '3px 8px', backgroundColor: `color-mix(in srgb, ${availColor} 12%, transparent)`, borderRadius: 'var(--stm-radius-full)' }}>
                              {avail}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
