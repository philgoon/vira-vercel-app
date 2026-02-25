'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ReviewStats {
  total_assignments: number;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
  overdue_count: number;
  completion_rate: number;
  average_completion_days: number;
}

interface OverdueAssignment {
  assignment_id: string;
  project_title: string;
  reviewer_name: string;
  reviewer_email: string;
  due_date: string;
  days_overdue: number;
}

const panel = {
  backgroundColor: 'var(--stm-card)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-lg)',
  overflow: 'hidden',
} as const;

const panelHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: '1px solid var(--stm-border)',
} as const;

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left' as const,
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--stm-muted-foreground)',
  borderBottom: '1px solid var(--stm-border)',
};

export default function ReviewMonitoringDashboard() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [overdueAssignments, setOverdueAssignments] = useState<OverdueAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/review-stats');
      if (!response.ok) { setStats(null); return; }
      const data = await response.json();
      setStats(data.stats);
      setOverdueAssignments(data.overdue_assignments || []);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--stm-space-12)' }}>
        <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center' }}>
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        padding: 'var(--stm-space-4)',
        backgroundColor: 'color-mix(in srgb, var(--stm-warning) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--stm-warning) 25%, transparent)',
        borderRadius: 'var(--stm-radius-md)',
        fontSize: 'var(--stm-text-sm)',
        color: 'var(--stm-warning)',
        fontFamily: 'var(--stm-font-body)',
      }}>
        Failed to load review statistics
      </div>
    );
  }

  const statCards = [
    { id: 'total',      label: 'Total Assignments', value: String(stats.total_assignments),               color: 'var(--stm-primary)' },
    { id: 'completion', label: 'Completion Rate',   value: `${stats.completion_rate.toFixed(0)}%`,        color: 'var(--stm-success)' },
    { id: 'overdue',    label: 'Overdue',           value: String(stats.overdue_count),                   color: stats.overdue_count > 0 ? 'var(--stm-error)' : 'var(--stm-foreground)' },
    { id: 'avg',        label: 'Avg Completion',    value: `${stats.average_completion_days.toFixed(1)}d`, color: 'var(--stm-foreground)' },
  ];

  const statusRows = [
    { label: 'Pending',     value: stats.pending_count,     color: 'var(--stm-warning)' },
    { label: 'In Progress', value: stats.in_progress_count, color: 'var(--stm-primary)' },
    { label: 'Completed',   value: stats.completed_count,   color: 'var(--stm-success)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Stat Cards — match main dashboard KPI style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {statCards.map(({ id, label, value, color }) => {
          const isHovered = hoveredCard === id;
          return (
            <div
              key={id}
              style={{
                backgroundColor: 'var(--stm-card)',
                border: `1px solid ${isHovered ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: 'var(--stm-radius-lg)',
                padding: '18px 20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.18s ease',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 4px 20px rgba(26, 82, 118, 0.1)' : 'none',
              }}
              onMouseEnter={() => setHoveredCard(id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, var(--stm-primary), var(--stm-accent))',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.18s',
              }} />
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', margin: '0 0 12px' }}>
                {label}
              </div>
              <div style={{ fontSize: '34px', fontWeight: '800', color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown — panel style */}
      <div style={panel}>
        <div style={panelHeader}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-foreground)', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp style={{ width: '13px', height: '13px', color: 'var(--stm-muted-foreground)' }} />
            Assignment Status
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '18px', gap: '12px' }}>
          {statusRows.map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {value}
              </div>
              <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Table */}
      {overdueAssignments.length > 0 && (
        <div style={panel}>
          <div style={panelHeader}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-foreground)', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle style={{ width: '13px', height: '13px', color: 'var(--stm-error)' }} />
              Overdue Reviews
            </span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-error)' }}>
              {overdueAssignments.length} overdue
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project', 'Reviewer', 'Due Date', 'Days Overdue'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueAssignments.map((a, i) => (
                  <tr
                    key={a.assignment_id}
                    style={{ borderBottom: i === overdueAssignments.length - 1 ? 'none' : '1px solid var(--stm-border)', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--stm-foreground)' }}>{a.project_title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--stm-foreground)' }}>{a.reviewer_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)' }}>{a.reviewer_email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--stm-muted-foreground)' }}>
                      {new Date(a.due_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        color: 'var(--stm-error)',
                        backgroundColor: 'color-mix(in srgb, var(--stm-error) 12%, transparent)',
                        padding: '3px 8px', borderRadius: 'var(--stm-radius-full)',
                      }}>
                        {a.days_overdue}d overdue
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All clear */}
      {overdueAssignments.length === 0 && (
        <div style={{ ...panel, textAlign: 'center', padding: 'var(--stm-space-8)' }}>
          <CheckCircle style={{ width: '32px', height: '32px', color: 'var(--stm-success)', margin: '0 auto var(--stm-space-3)' }} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-success)', marginBottom: '4px' }}>All reviews on track</div>
          <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)' }}>No overdue assignments.</div>
        </div>
      )}

    </div>
  );
}
