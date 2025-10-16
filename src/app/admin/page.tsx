// [R-ADMIN] Admin Dashboard - Unified management interface with professional design
'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Vendor, Project, VendorInvite, UserProfile, VendorApplication } from '@/types'
import VendorModal from '@/components/modals/VendorModal'
import ProjectModal from '@/components/modals/ProjectModal'
import SendInviteModal from '@/components/modals/SendInviteModal'
import CSVImport from '@/components/admin/CSVImport'
import ReviewAssignment from '@/components/admin/ReviewAssignment'
import ReviewMonitoringDashboard from '@/components/admin/ReviewMonitoringDashboard'
import { supabase } from '@/lib/supabase'
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth'
import {
  Mail,
  Users,
  FolderKanban,
  Upload,
  RefreshCw,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Shield,
  Edit,
  Trash2,
  UserCog,
  Plus,
  Settings
} from 'lucide-react'

interface TableData {
  vendors: Vendor[]
  projects: Project[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<TableData>({ vendors: [], projects: [] })
  const [invites, setInvites] = useState<VendorInvite[]>([])
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [vendorModalOpen, setVendorModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [sendInviteModalOpen, setSendInviteModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('invites')

  useEffect(() => {
    loadData()
    loadInvites()
    loadApplications()
    loadUsers()
  }, [])

  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  const loadData = async () => {
    setLoading(true)
    try {
      const [vendorsRes, projectsRes] = await Promise.all([
        fetch('/api/admin/table-data?table=vendors'),
        fetch('/api/admin/table-data?table=projects')
      ])

      const vendorsData = await vendorsRes.json()
      const projectsData = await projectsRes.json()

      setData({
        vendors: vendorsData.data || [],
        projects: projectsData.data || []
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvites = async () => {
    setLoadingInvites(true)
    try {
      const response = await fetch('/api/vendor-invites')
      const data = await response.json()
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
      const response = await fetch('/api/vendor-applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId)

      if (error) throw error

      // Refresh users list
      loadUsers()
    } catch (err: any) {
      console.error('Error updating user status:', err)
      alert('Failed to update user status: ' + err.message)
    }
  }

  const openVendorModal = async (vendor: Vendor | null) => {
    if (vendor) {
      setSelectedVendor(vendor);
      setVendorModalOpen(true);
    } else {
      const response = await fetch('/api/admin/get-next-vendor-code');
      const data = await response.json();
      setSelectedVendor({ vendor_code: data.nextVendorCode } as Vendor);
      setVendorModalOpen(true);
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project)
    setProjectModalOpen(true)
  }

  const handleVendorModalSave = async (updatedVendorData: Partial<Vendor>) => {
    if (!selectedVendor) return;

    try {
      if (selectedVendor.vendor_id) {
        // Update existing vendor
        const changes = Object.entries(updatedVendorData).filter(([key, value]) => {
          return value !== selectedVendor[key as keyof Vendor];
        });

        for (const [field, value] of changes) {
          await fetch('/api/admin/update-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'vendors',
              id: selectedVendor.vendor_id,
              field,
              value: value || '',
            }),
          });
        }

        setData(prev => ({
          ...prev,
          vendors: prev.vendors.map(vendor =>
            vendor.vendor_id === selectedVendor.vendor_id
              ? { ...vendor, ...updatedVendorData }
              : vendor
          ),
        }));

      } else {
        // Create new vendor
        const response = await fetch('/api/admin/create-vendor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedVendorData),
        });
        const newVendor = await response.json();
        setData(prev => ({ ...prev, vendors: [...prev.vendors, newVendor] }));
      }

      setVendorModalOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed - please try again');
    }
  };

  const handleProjectModalSave = async (updatedProjectData: Partial<Project>) => {
    if (!selectedProject) return

    try {
      const changes = Object.entries(updatedProjectData).filter(([key, value]) => {
        return value !== selectedProject[key as keyof Project]
      })

      for (const [field, value] of changes) {
        const response = await fetch('/api/admin/update-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'projects',
            id: selectedProject.project_id,
            field,
            value: value || ''
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to update ${field}`)
        }
      }

      setData(prev => ({
        ...prev,
        projects: prev.projects.map(project =>
          project.project_id === selectedProject.project_id
            ? { ...project, ...updatedProjectData }
            : project
        )
      }))

      setProjectModalOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Modal save failed:', error)
      alert('Save failed - please try again')
    }
  }

  const handleProjectDelete = async (projectId: string) => {
    try {
      const response = await fetch('/api/admin/delete-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'projects',
          id: projectId,
        }),
      });

      if (response.ok) {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.project_id !== projectId),
        }));
        setProjectModalOpen(false);
        setSelectedProject(null);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed - please try again');
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch('/api/vendor-invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invite')
      }

      // Reload invites to show updated expiration
      await loadInvites()
      alert('Invite resent successfully!')
    } catch (error: any) {
      console.error('Failed to resend invite:', error)
      alert(error.message || 'Failed to resend invite')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to cancel this invite?')) {
      return
    }

    try {
      const response = await fetch('/api/vendor-invites/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel invite')
      }

      // Reload invites to show updated status
      await loadInvites()
      alert('Invite cancelled successfully')
    } catch (error: any) {
      console.error('Failed to cancel invite:', error)
      alert(error.message || 'Failed to cancel invite')
    }
  }

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Approve this vendor application? This will create a vendor account and user login.')) {
      return
    }

    try {
      const response = await fetch('/api/vendor-applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve application')
      }

      await loadApplications()
      await loadData() // Refresh vendors list
      alert('Application approved successfully! Vendor and user account created.')
    } catch (error: any) {
      console.error('Failed to approve application:', error)
      alert(error.message || 'Failed to approve application')
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Enter rejection reason (optional):')
    if (reason === null) return // User clicked cancel

    try {
      const response = await fetch('/api/vendor-applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          application_id: applicationId,
          rejection_reason: reason || 'Application did not meet requirements'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application')
      }

      await loadApplications()
      alert('Application rejected successfully')
    } catch (error: any) {
      console.error('Failed to reject application:', error)
      alert(error.message || 'Failed to reject application')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid #1A5276',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Settings style={{ width: '2rem', height: '2rem', color: '#1A5276' }} />
                  <h1 style={{
                    fontSize: '1.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 'bold',
                    color: '#1A5276'
                  }}>Admin Dashboard</h1>
                </div>
                <p style={{ color: '#6b7280' }}>
                  Manage vendors, projects, users, and invitations
                </p>
              </div>
              <button
                onClick={() => { loadData(); loadInvites(); loadApplications(); loadUsers(); }}
                className="btn-outline"
                style={{ fontSize: '0.875rem' }}
              >
                <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                Refresh All
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

            {/* Tabs */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              {/* Tab List */}
              <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', padding: '0 0.5rem' }}>
                {[
                  { id: 'invites', label: 'Invites', icon: Mail, count: invites.length },
                  { id: 'applications', label: 'Applications', icon: UserPlus, count: applications.length },
                  { id: 'vendors', label: 'Vendors', icon: Users, count: filteredData.vendors.length },
                  { id: 'projects', label: 'Projects', icon: FolderKanban, count: filteredData.projects.length },
                  { id: 'reviews', label: 'Reviews', icon: CheckCircle, count: null },
                  { id: 'users', label: 'Users', icon: UserCog, count: users.length },
                  { id: 'import', label: 'Import', icon: Upload, count: null }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 1.5rem',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid #1A5276' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: activeTab === tab.id ? '#1A5276' : '#6b7280',
                      fontWeight: activeTab === tab.id ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 150ms'
                    }}
                  >
                    <tab.icon style={{ width: '1.125rem', height: '1.125rem' }} />
                    {tab.label}
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: activeTab === tab.id ? '#E8F4F8' : '#f3f4f6',
                      color: activeTab === tab.id ? '#1A5276' : '#6b7280',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {tab.count !== null ? tab.count : ''}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: '1.5rem' }}>
                {/* Invites Tab */}
                {activeTab === 'invites' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Vendor Invitations
                      </h3>
                      <button
                        onClick={() => setSendInviteModalOpen(true)}
                        className="btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <Mail style={{ width: '1rem', height: '1rem' }} />
                        Send Invite
                      </button>
                    </div>

                    {loadingInvites ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{
                          width: '2rem',
                          height: '2rem',
                          border: '2px solid #1A5276',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          margin: '0 auto 1rem',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: '#6b7280' }}>Loading invites...</p>
                      </div>
                    ) : invites.length === 0 ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <Mail style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No pending invites</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          Click "Send Invite" to invite vendors to the platform
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {invites.map((invite) => (
                          <div
                            key={invite.invite_id}
                            style={{
                              padding: '1rem',
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <Mail style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                                  <span style={{ fontWeight: '500', color: '#111827' }}>{invite.email}</span>
                                  <span style={{
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: invite.status === 'pending' ? '#dbeafe' :
                                                   invite.status === 'accepted' ? '#d1fae5' : '#f3f4f6',
                                    color: invite.status === 'pending' ? '#1e40af' :
                                          invite.status === 'accepted' ? '#065f46' : '#6b7280',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                  }}>
                                    {invite.status}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                                    Expires: {new Date(invite.expires_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleResendInvite(invite.invite_id)}
                                  disabled={invite.status !== 'pending' && invite.status !== 'expired'}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: invite.status === 'pending' || invite.status === 'expired' ? '#1A5276' : '#9ca3af',
                                    cursor: invite.status === 'pending' || invite.status === 'expired' ? 'pointer' : 'not-allowed',
                                    opacity: invite.status === 'pending' || invite.status === 'expired' ? '1' : '0.5'
                                  }}
                                >
                                  <Send style={{ width: '0.875rem', height: '0.875rem' }} />
                                  Resend
                                </button>
                                <button
                                  onClick={() => handleCancelInvite(invite.invite_id)}
                                  disabled={invite.status === 'accepted' || invite.status === 'cancelled'}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: invite.status !== 'accepted' && invite.status !== 'cancelled' ? '#dc2626' : '#9ca3af',
                                    cursor: invite.status !== 'accepted' && invite.status !== 'cancelled' ? 'pointer' : 'not-allowed',
                                    opacity: invite.status !== 'accepted' && invite.status !== 'cancelled' ? '1' : '0.5'
                                  }}
                                >
                                  <XCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Vendor Applications
                      </h3>
                    </div>

                    {loadingApplications ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{
                          width: '2rem',
                          height: '2rem',
                          border: '2px solid #1A5276',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          margin: '0 auto 1rem',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: '#6b7280' }}>Loading applications...</p>
                      </div>
                    ) : applications.length === 0 ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <UserPlus style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No vendor applications</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          Applications will appear here when vendors respond to invitations
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {applications.map((app) => (
                          <div
                            key={app.application_id}
                            style={{
                              padding: '1.5rem',
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                                    {app.vendor_name}
                                  </h4>
                                  <span style={{
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: app.status === 'pending' ? '#fef3c7' :
                                                   app.status === 'approved' ? '#d1fae5' : '#fee2e2',
                                    color: app.status === 'pending' ? '#92400e' :
                                          app.status === 'approved' ? '#065f46' : '#991b1b',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                  }}>
                                    {app.status}
                                  </span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                  <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Contact: </span>
                                    <span style={{ color: '#111827', fontWeight: '500' }}>{app.primary_contact || 'N/A'}</span>
                                  </div>
                                  <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Email: </span>
                                    <span style={{ color: '#111827', fontWeight: '500' }}>{app.email}</span>
                                  </div>
                                  <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Service: </span>
                                    <span style={{ color: '#111827', fontWeight: '500' }}>{app.service_category || 'N/A'}</span>
                                  </div>
                                  <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Phone: </span>
                                    <span style={{ color: '#111827', fontWeight: '500' }}>{app.phone || 'N/A'}</span>
                                  </div>
                                </div>

                                {app.website && (
                                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280' }}>Website: </span>
                                    <a href={app.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1A5276', textDecoration: 'underline' }}>
                                      {app.website}
                                    </a>
                                  </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.75rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                                    Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {app.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                  <button
                                    onClick={() => handleApproveApplication(app.application_id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.625rem 1rem',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      transition: 'background-color 150ms'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#059669';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#10b981';
                                    }}
                                  >
                                    <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(app.application_id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.625rem 1rem',
                                      backgroundColor: 'white',
                                      color: '#dc2626',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      transition: 'all 150ms'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fee2e2';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                  >
                                    <XCircle style={{ width: '1rem', height: '1rem' }} />
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
                )}

                {/* Vendors Tab */}
                {activeTab === 'vendors' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Vendor Management
                      </h3>
                      <button
                        onClick={() => openVendorModal(null)}
                        className="btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        Add Vendor
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1rem'
                    }}>
                      {filteredData.vendors.map((vendor) => (
                        <div
                          key={vendor.vendor_id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span style={{ fontWeight: '500', color: '#111827' }}>{vendor.vendor_name}</span>
                          <button
                            onClick={() => openVendorModal(vendor)}
                            className="btn-outline"
                            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Project Management
                      </h3>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: '1rem'
                    }}>
                      {filteredData.projects.map((project) => (
                        <div
                          key={project.project_id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                                {project.project_title}
                              </h4>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {project.client_name} • {project.vendor_name}
                              </p>
                            </div>
                            <button
                              onClick={() => { setSelectedProject(project); setProjectModalOpen(true); }}
                              className="btn-outline"
                              style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                      Review Management
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
                      gap: '1.5rem' 
                    }}>
                      {/* Monitoring Dashboard */}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                          Workflow Monitoring
                        </h4>
                        <ReviewMonitoringDashboard />
                      </div>

                      {/* Assignment Management */}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                          Assign Reviewers
                        </h4>
                        <ReviewAssignment />
                      </div>
                    </div>
                  </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Import Data
                      </h3>
                    </div>
                    <CSVImport />
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        User Management
                      </h3>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        Add User
                      </button>
                    </div>

                    {loadingUsers ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{
                          width: '2rem',
                          height: '2rem',
                          border: '2px solid #1A5276',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          margin: '0 auto 1rem',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: '#6b7280' }}>Loading users...</p>
                      </div>
                    ) : users.length === 0 ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <UserCog style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6b7280' }}>No users found</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                User
                              </th>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                Role
                              </th>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                Status
                              </th>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                Last Login
                              </th>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                Created
                              </th>
                              <th style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'right',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.user_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem' }}>
                                  <div>
                                    <p style={{ fontWeight: '500', color: '#111827' }}>
                                      {user.full_name || 'No name'}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                      {user.email}
                                    </p>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <span className={getRoleBadgeColor(user.role)} style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                  }}>
                                    {getRoleDisplayName(user.role)}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <button
                                    onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.375rem',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {user.is_active ? (
                                      <>
                                        <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                                          Active
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '500' }}>
                                          Inactive
                                        </span>
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                  {user.last_login_at
                                    ? new Date(user.last_login_at).toLocaleDateString()
                                    : 'Never'}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button style={{
                                      padding: '0.5rem',
                                      backgroundColor: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      transition: 'all 150ms'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#dbeafe';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}>
                                      <Edit style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                                    </button>
                                    <button style={{
                                      padding: '0.5rem',
                                      backgroundColor: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      transition: 'all 150ms'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fee2e2';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}>
                                      <Trash2 style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Info Box */}
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      backgroundColor: '#dbeafe',
                      border: '1px solid #93c5fd',
                      borderRadius: '0.5rem'
                    }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                        User Management Notes
                      </h4>
                      <ul style={{ fontSize: '0.875rem', color: '#1e40af', paddingLeft: '1rem' }}>
                        <li>• <strong>Admin:</strong> Full access to all features and user management</li>
                        <li>• <strong>Team:</strong> Can rate projects and view vendor ratings</li>
                        <li>• <strong>Vendor:</strong> Can view their own ratings only</li>
                        <li>• Click status to toggle user active/inactive</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Modals */}
      <VendorModal
        vendor={selectedVendor}
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onSave={handleVendorModalSave}
      />

      <ProjectModal
        project={selectedProject}
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleProjectModalSave}
        onDelete={handleProjectDelete}
      />

      <SendInviteModal
        isOpen={sendInviteModalOpen}
        onClose={() => setSendInviteModalOpen(false)}
        onSuccess={() => {
          loadInvites()
          setSendInviteModalOpen(false)
        }}
      />
    </ProtectedRoute>
  )
}