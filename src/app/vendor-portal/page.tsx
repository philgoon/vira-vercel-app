// [C1] Vendor Portal - Siloed interface for vendors to manage their profile and view ratings
'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, Mail, Phone, Globe, Edit2, Save, X, BarChart3, Star, CheckCircle } from 'lucide-react'

interface VendorProfile {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  email: string
  primary_contact?: string
  phone?: string
  website?: string
  industry?: string
  service_categories: string[]
  skills?: string
  pricing_structure?: string
  rate_cost?: string
  availability_status?: string
  available_from?: string
  availability_notes?: string
  portfolio_url?: string
  sample_work_urls?: string
}

interface VendorRatings {
  total_projects: number
  average_rating: number
  ratings_by_category: {
    quality: number
    communication: number
    timeliness: number
    value: number
  }
  recent_feedback: string[]
}

export default function VendorPortal() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [ratings, setRatings] = useState<VendorRatings | null>(null)
  const [editData, setEditData] = useState<Partial<VendorProfile>>({})
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user) {
      loadVendorData()
    }
  }, [user])

  const loadVendorData = async () => {
    try {
      // Load vendor profile and ratings
      const [profileRes, ratingsRes] = await Promise.all([
        fetch('/api/vendor-portal/profile'),
        fetch('/api/vendor-portal/ratings')
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
        setEditData(profileData.profile)
      }

      if (ratingsRes.ok) {
        const ratingsData = await ratingsRes.json()
        setRatings(ratingsData.ratings)
      }
    } catch (error) {
      console.error('Error loading vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setEditData(profile || {})
  }

  const handleCancel = () => {
    setEditing(false)
    setEditData(profile || {})
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/vendor-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof VendorProfile, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid #1A5276',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading your portal...</p>
          </div>
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontFamily: 'var(--font-headline)', fontWeight: 'bold', color: '#1A5276', marginBottom: '0.5rem' }}>
                  Vendor Portal
                </h1>
                <p style={{ color: '#6b7280' }}>
                  Manage your profile and view your performance
                </p>
              </div>
              {profile && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Vendor Code</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1A5276' }}>{profile.vendor_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Tabs */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', padding: '0 0.5rem' }}>
              {[
                { id: 'profile', label: 'Profile', icon: Building2 },
                { id: 'ratings', label: 'Ratings', icon: BarChart3 }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 1.5rem',
                      borderBottom: activeTab === tab.id ? '2px solid #1A5276' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: activeTab === tab.id ? '#1A5276' : '#6b7280',
                      fontWeight: activeTab === tab.id ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 150ms'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div style={{ padding: '2rem' }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && profile && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                      Company Profile
                    </h2>
                    {!editing ? (
                      <button
                        onClick={handleEdit}
                        className="btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={handleCancel}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            backgroundColor: 'white',
                            color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-success"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <Save size={16} />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {/* Company Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Company Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={editData.vendor_name || ''}
                          onChange={(e) => updateField('vendor_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          {profile.vendor_name}
                        </p>
                      )}
                    </div>

                    {/* Primary Contact */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Primary Contact
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={editData.primary_contact || ''}
                          onChange={(e) => updateField('primary_contact', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          {profile.primary_contact || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        <Mail size={16} />
                        Email
                      </label>
                      <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                        {profile.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        <Phone size={16} />
                        Phone
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          {profile.phone || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        <Globe size={16} />
                        Website
                      </label>
                      {editing ? (
                        <input
                          type="url"
                          value={editData.website || ''}
                          onChange={(e) => updateField('website', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          {profile.website || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Availability Status */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        <CheckCircle size={16} />
                        Availability Status
                      </label>
                      {editing ? (
                        <select
                          value={editData.availability_status || 'Available'}
                          onChange={(e) => updateField('availability_status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Limited">Limited Availability</option>
                          <option value="Unavailable">Unavailable</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: profile.availability_status === 'Available' ? '#d1fae5' :
                                           profile.availability_status === 'Limited' ? '#fed7aa' :
                                           profile.availability_status === 'On Leave' ? '#dbeafe' : '#fee2e2',
                            color: profile.availability_status === 'Available' ? '#065f46' :
                                   profile.availability_status === 'Limited' ? '#92400e' :
                                   profile.availability_status === 'On Leave' ? '#1e40af' : '#991b1b'
                          }}>
                            {profile.availability_status || 'Available'}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Available From */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Available From
                      </label>
                      {editing ? (
                        <input
                          type="date"
                          value={editData.available_from || ''}
                          onChange={(e) => updateField('available_from', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827' }}>
                          {profile.available_from ? new Date(profile.available_from).toLocaleDateString() : 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Availability Notes */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Availability Notes
                      </label>
                      {editing ? (
                        <textarea
                          value={editData.availability_notes || ''}
                          onChange={(e) => updateField('availability_notes', e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      ) : (
                        <p style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#111827', minHeight: '3rem' }}>
                          {profile.availability_notes || 'No notes'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '2rem' }}>
                    Your Performance Ratings
                  </h2>

                  {ratings ? (
                    <div>
                      {/* Summary Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Projects</p>
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A5276' }}>{ratings.total_projects}</p>
                        </div>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Average Rating</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A5276' }}>{ratings.average_rating.toFixed(1)}</p>
                            <Star size={24} fill="#fbbf24" color="#fbbf24" />
                          </div>
                        </div>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Performance</p>
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: ratings.average_rating >= 4.5 ? '#10b981' : ratings.average_rating >= 4.0 ? '#f59e0b' : '#ef4444' }}>
                            {ratings.average_rating >= 4.5 ? 'Excellent' : ratings.average_rating >= 4.0 ? 'Good' : 'Fair'}
                          </p>
                        </div>
                      </div>

                      {/* Coming Soon Message */}
                      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                        <BarChart3 size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Detailed ratings coming soon</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          You'll be able to see detailed category ratings and client feedback here
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                      <Star size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ color: '#6b7280' }}>No ratings yet</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        Ratings will appear here once you complete projects
                      </p>
                    </div>
                  )}
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
    </ProtectedRoute>
  )
}
