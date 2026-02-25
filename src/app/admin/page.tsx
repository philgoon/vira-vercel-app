// [R-ADMIN] Admin Dashboard - Platform operations: Vendor Portal, Reviews, Import
// [EPIC-002 M2] Decomposed from 7-tab monolith to 3 focused tabs
'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { VendorInvite, VendorApplication } from '@/types'
import SendInviteModal from '@/components/modals/SendInviteModal'
import CSVImport from '@/components/admin/CSVImport'
import ReviewAssignment from '@/components/admin/ReviewAssignment'
import ReviewMonitoringDashboard from '@/components/admin/ReviewMonitoringDashboard'
import VendorSyncPanel from '@/components/admin/VendorSyncPanel'
import {
  Mail,
  UserPlus,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Settings,
  Copy,
  Database,
} from 'lucide-react'

const card = {
  backgroundColor: 'var(--stm-card)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-lg)',
  padding: 'var(--stm-space-6)',
}

const thStyle = {
  padding: 'var(--stm-space-3) var(--stm-space-4)',
  textAlign: 'left' as const,
  fontSize: 'var(--stm-text-xs)',
  fontWeight: 'var(--stm-font-semibold)',
  color: 'var(--stm-muted-foreground)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--stm-border)',
}

const statusBadge = (status: string) => {
  const map: Record<string, { color: string }> = {
    pending:   { color: 'var(--stm-warning)' },
    accepted:  { color: 'var(--stm-success)' },
    approved:  { color: 'var(--stm-success)' },
    expired:   { color: 'var(--stm-muted-foreground)' },
    cancelled: { color: 'var(--stm-muted-foreground)' },
    rejected:  { color: 'var(--stm-error)' },
  }
  const { color } = map[status] || { color: 'var(--stm-muted-foreground)' }
  return {
    padding: 'var(--stm-space-1) var(--stm-space-2)',
    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    color,
    borderRadius: 'var(--stm-radius-full)',
    fontSize: 'var(--stm-text-xs)',
    fontWeight: 'var(--stm-font-semibold)',
    textTransform: 'uppercase' as const,
  }
}

// [BETA] Set to true when Vendor Portal is ready to launch
const VENDOR_PORTAL_ENABLED = false

const TABS = [
  { id: 'vendor-portal', label: 'Vendor Portal', icon: Mail },
  { id: 'reviews',       label: 'Reviews',       icon: CheckCircle },
  { id: 'import',        label: 'Import & Sync',  icon: Upload },
].filter(tab => tab.id !== 'vendor-portal' || VENDOR_PORTAL_ENABLED)

export default function AdminDashboard() {
  const [invites, setInvites] = useState<VendorInvite[]>([])
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [sendInviteModalOpen, setSendInviteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(VENDOR_PORTAL_ENABLED ? 'vendor-portal' : 'reviews')

  useEffect(() => {
    loadInvites()
    loadApplications()
  }, [])

  const loadInvites = async () => {
    setLoadingInvites(true)
    try {
      const res = await fetch('/api/vendor-invites')
      const data = await res.json()
      setInvites(data.invites || [])
    } catch (error) {
      console.error('Failed to load invites:', error)
    } finally {
      setLoadingInvites(false)
    }
  }

  const loadApplications = async () => {
    setLoadingApplications(true)
    try {
      const res = await fetch('/api/vendor-applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch('/api/vendor-invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend invite')
      await loadInvites()
      alert('Invite resent successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to resend invite')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Cancel this invite?')) return
    try {
      const res = await fetch('/api/vendor-invites/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel invite')
      await loadInvites()
    } catch (error: any) {
      alert(error.message || 'Failed to cancel invite')
    }
  }

  const handleCopyInviteLink = async (inviteToken: string) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/vendor/apply/${inviteToken}`
    try {
      await navigator.clipboard.writeText(url)
      alert('Invite link copied!')
    } catch {
      alert('Copy failed. URL: ' + url)
    }
  }

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Approve this vendor application? This will create a vendor account and user login.')) return
    try {
      const res = await fetch('/api/vendor-applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to approve application')
      await loadApplications()
      alert('Application approved! Vendor and user account created.')
    } catch (error: any) {
      alert(error.message || 'Failed to approve application')
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return
    try {
      const res = await fetch('/api/vendor-applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, rejection_reason: reason || 'Application did not meet requirements' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reject application')
      await loadApplications()
    } catch (error: any) {
      alert(error.message || 'Failed to reject application')
    }
  }

  const pendingApplications = applications.filter(a => a.status === 'pending')

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ padding: 'var(--stm-space-8)' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 'var(--stm-space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)' }}>
              <Settings style={{ width: '28px', height: '28px', color: 'var(--stm-primary)' }} />
              <div>
                <h1 style={{ fontSize: 'var(--stm-text-3xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', margin: 0 }}>
                  Admin
                </h1>
                <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', margin: 0, fontFamily: 'var(--stm-font-body)' }}>
                  Vendor onboarding, review management, and data operations
                </div>
              </div>
            </div>
            <button
              onClick={() => { loadInvites(); loadApplications(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                padding: 'var(--stm-space-2) var(--stm-space-4)',
                border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
                backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)',
                fontSize: 'var(--stm-text-sm)', cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--stm-border)', padding: '0 var(--stm-space-2)' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              // Show badge count for vendor-portal
              const count = tab.id === 'vendor-portal' ? pendingApplications.length : null
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                    padding: 'var(--stm-space-4) var(--stm-space-5)',
                    background: 'none',
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    borderBottom: isActive ? '2px solid var(--stm-primary)' : '2px solid transparent',
                    color: isActive ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
                    fontWeight: isActive ? 'var(--stm-font-semibold)' : 'var(--stm-font-medium)',
                    fontSize: 'var(--stm-text-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--stm-font-body)',
                    transition: 'color 150ms',
                  }}
                >
                  <tab.icon style={{ width: '15px', height: '15px' }} />
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span style={{
                      ...statusBadge('pending'),
                      fontSize: 'var(--stm-text-xs)',
                      padding: 'var(--stm-space-1) var(--stm-space-2)',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 'var(--stm-space-6)' }}>

            {/* ── VENDOR PORTAL ── */}
            {activeTab === 'vendor-portal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-8)' }}>

                {/* Invites Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--stm-space-4)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>
                        Invitations
                      </h3>
                      <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', margin: 0, fontFamily: 'var(--stm-font-body)' }}>
                        Send invite links to prospective vendors
                      </div>
                    </div>
                    <button
                      onClick={() => setSendInviteModalOpen(true)}
                      className="btn-primary"
                      style={{ fontSize: 'var(--stm-text-sm)' }}
                    >
                      <Mail style={{ width: '14px', height: '14px' }} />
                      Send Invite
                    </button>
                  </div>

                  {loadingInvites ? (
                    <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
                      <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-3)' }}>
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                      </div>
                      <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading invites...</div>
                    </div>
                  ) : invites.length === 0 ? (
                    <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-md)' }}>
                      <Mail style={{ width: '32px', height: '32px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-3)' }} />
                      <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>No invites sent yet</div>
                    </div>
                  ) : (
                    <div style={{ border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Email', 'Status', 'Expires', 'Actions'].map(h => (
                              <th key={h} style={{ ...thStyle, textAlign: h === 'Actions' ? 'right' as const : 'left' as const }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {invites.map(invite => (
                            <tr
                              key={invite.invite_id}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <td style={{ padding: 'var(--stm-space-3) var(--stm-space-4)', fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', borderBottom: '1px solid var(--stm-border)', fontWeight: 'var(--stm-font-medium)' }}>
                                {invite.email}
                              </td>
                              <td style={{ padding: 'var(--stm-space-3) var(--stm-space-4)', borderBottom: '1px solid var(--stm-border)' }}>
                                <span style={statusBadge(invite.status)}>{invite.status}</span>
                              </td>
                              <td style={{ padding: 'var(--stm-space-3) var(--stm-space-4)', fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', borderBottom: '1px solid var(--stm-border)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
                                  <Clock style={{ width: '12px', height: '12px' }} />
                                  {new Date(invite.expires_at).toLocaleDateString()}
                                </span>
                              </td>
                              <td style={{ padding: 'var(--stm-space-3) var(--stm-space-4)', borderBottom: '1px solid var(--stm-border)', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--stm-space-2)' }}>
                                  <button
                                    onClick={() => handleCopyInviteLink(invite.invite_token)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', padding: 'var(--stm-space-1) var(--stm-space-2)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)', background: 'none', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-primary)', cursor: 'pointer' }}
                                  >
                                    <Copy style={{ width: '11px', height: '11px' }} />
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => handleResendInvite(invite.invite_id)}
                                    disabled={invite.status !== 'pending' && invite.status !== 'expired'}
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', padding: 'var(--stm-space-1) var(--stm-space-2)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)', background: 'none', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-foreground)', cursor: 'pointer', opacity: invite.status === 'pending' || invite.status === 'expired' ? 1 : 0.4 }}
                                  >
                                    <Send style={{ width: '11px', height: '11px' }} />
                                    Resend
                                  </button>
                                  <button
                                    onClick={() => handleCancelInvite(invite.invite_id)}
                                    disabled={invite.status === 'accepted' || invite.status === 'cancelled'}
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', padding: 'var(--stm-space-1) var(--stm-space-2)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)', background: 'none', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-error)', cursor: 'pointer', opacity: invite.status !== 'accepted' && invite.status !== 'cancelled' ? 1 : 0.4 }}
                                  >
                                    <XCircle style={{ width: '11px', height: '11px' }} />
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--stm-border)' }} />

                {/* Applications Section */}
                <div>
                  <div style={{ marginBottom: 'var(--stm-space-4)' }}>
                    <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>
                      Applications
                      {pendingApplications.length > 0 && (
                        <span style={{ ...statusBadge('pending'), marginLeft: 'var(--stm-space-2)', verticalAlign: 'middle' }}>
                          {pendingApplications.length} pending
                        </span>
                      )}
                    </h3>
                    <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', margin: 0, fontFamily: 'var(--stm-font-body)' }}>
                      Review and approve vendor applications
                    </div>
                  </div>

                  {loadingApplications ? (
                    <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
                      <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-3)' }}>
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dot" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                        <span className="stm-loader-capsule stm-loader-dash" />
                      </div>
                      <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading applications...</div>
                    </div>
                  ) : applications.length === 0 ? (
                    <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-md)' }}>
                      <UserPlus style={{ width: '32px', height: '32px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-3)' }} />
                      <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>No applications yet</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
                      {applications.map(app => (
                        <div
                          key={app.application_id}
                          style={{
                            padding: 'var(--stm-space-5)',
                            backgroundColor: 'var(--stm-muted)',
                            border: '1px solid var(--stm-border)',
                            borderRadius: 'var(--stm-radius-md)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)', marginBottom: 'var(--stm-space-3)' }}>
                                <h4 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>
                                  {app.vendor_name}
                                </h4>
                                <span style={statusBadge(app.status)}>{app.status}</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--stm-space-2)' }}>
                                {[
                                  { label: 'Contact', value: app.primary_contact },
                                  { label: 'Email', value: app.email },
                                  { label: 'Service', value: app.service_category },
                                  { label: 'Phone', value: app.phone },
                                  { label: 'Website', value: app.website },
                                  { label: 'Submitted', value: new Date(app.submitted_at).toLocaleDateString() },
                                ].map(({ label, value }) => (
                                  <div key={label} style={{ fontSize: 'var(--stm-text-sm)' }}>
                                    <span style={{ color: 'var(--stm-muted-foreground)' }}>{label}: </span>
                                    <span style={{ color: 'var(--stm-foreground)', fontWeight: 'var(--stm-font-medium)' }}>{value || 'N/A'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {app.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 'var(--stm-space-2)', marginLeft: 'var(--stm-space-4)', flexShrink: 0 }}>
                                <button
                                  onClick={() => handleApproveApplication(app.application_id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-success)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer' }}
                                >
                                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(app.application_id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-error)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer' }}
                                >
                                  <XCircle style={{ width: '14px', height: '14px' }} />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 'var(--stm-space-6)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
                    Workflow Monitoring
                  </h3>
                  <ReviewMonitoringDashboard />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
                    Assign Reviewers
                  </h3>
                  <ReviewAssignment />
                </div>
              </div>
            )}

            {/* ── IMPORT & SYNC ── */}
            {activeTab === 'import' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 'var(--stm-space-6)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)', display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
                    <Upload style={{ width: '16px', height: '16px', color: 'var(--stm-primary)' }} />
                    CSV Import
                  </h3>
                  <CSVImport />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)', display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
                    <Database style={{ width: '16px', height: '16px', color: 'var(--stm-primary)' }} />
                    Vendor Sync
                  </h3>
                  <VendorSyncPanel />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {sendInviteModalOpen && (
        <SendInviteModal
          onClose={() => setSendInviteModalOpen(false)}
          onSuccess={() => { setSendInviteModalOpen(false); loadInvites(); }}
        />
      )}
    </ProtectedRoute>
  )
}
