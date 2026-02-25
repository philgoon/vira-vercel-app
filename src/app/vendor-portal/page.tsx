// [C1] Vendor Portal - Siloed interface for vendors to manage their profile and view ratings
'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useViRAAuth } from '@/hooks/useViRAAuth'
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

const AVAIL_STYLES: Record<string, { bg: string; color: string }> = {
  Available:   { bg: 'color-mix(in srgb, var(--stm-success) 12%, transparent)', color: 'var(--stm-success)' },
  Limited:     { bg: 'color-mix(in srgb, var(--stm-warning) 12%, transparent)', color: 'var(--stm-warning)' },
  'On Leave':  { bg: 'color-mix(in srgb, var(--stm-primary) 12%, transparent)', color: 'var(--stm-primary)' },
  Unavailable: { bg: 'color-mix(in srgb, var(--stm-error) 12%, transparent)',   color: 'var(--stm-error)' },
}

const inputStyle = {
  width: '100%',
  padding: 'var(--stm-space-3)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-md)',
  outline: 'none',
  backgroundColor: 'var(--stm-background)',
  color: 'var(--stm-foreground)',
  fontSize: 'var(--stm-text-sm)',
  fontFamily: 'var(--stm-font-body)',
}

const fieldValueStyle = {
  padding: 'var(--stm-space-3)',
  backgroundColor: 'var(--stm-muted)',
  borderRadius: 'var(--stm-radius-md)',
  color: 'var(--stm-foreground)',
  fontSize: 'var(--stm-text-sm)',
  fontFamily: 'var(--stm-font-body)',
  minHeight: '40px',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: 'var(--stm-text-xs)',
  fontWeight: 'var(--stm-font-semibold)',
  color: 'var(--stm-muted-foreground)',
  marginBottom: 'var(--stm-space-2)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  fontFamily: 'var(--stm-font-body)',
}

export default function VendorPortal() {
  const { user } = useViRAAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [ratings, setRatings] = useState<VendorRatings | null>(null)
  const [editData, setEditData] = useState<Partial<VendorProfile>>({})
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user) loadVendorData()
  }, [user])

  const loadVendorData = async () => {
    try {
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

  const handleEdit = () => { setEditing(true); setEditData(profile || {}) }
  const handleCancel = () => { setEditing(false); setEditData(profile || {}) }

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

  const updateField = (field: keyof VendorProfile, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--stm-page-background)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-4)' }}>
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dot" />
              <span className="stm-loader-capsule stm-loader-dash" />
              <span className="stm-loader-capsule stm-loader-dash" />
              <span className="stm-loader-capsule stm-loader-dash" />
            </div>
            <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
              Loading your portal...
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const availStyle = AVAIL_STYLES[profile?.availability_status || 'Available'] || AVAIL_STYLES['Available']

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-6)' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
              Vendor Portal
            </div>
            <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
              Manage your profile and view your performance
            </div>
          </div>
          {profile && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--stm-space-1)' }}>
                Vendor Code
              </div>
              <div style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', fontFamily: 'var(--stm-font-body)' }}>
                {profile.vendor_code}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Card */}
        <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', overflow: 'hidden' }}>
          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--stm-border)', padding: '0 var(--stm-space-2)' }}>
            {[
              { id: 'profile', label: 'Profile',  icon: Building2 },
              { id: 'ratings', label: 'Ratings',  icon: BarChart3 },
            ].map(tab => {
              const isActive = activeTab === tab.id
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
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 'var(--stm-space-6)' }}>

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && profile && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--stm-space-6)' }}>
                  <div style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                    Company Profile
                  </div>
                  {!editing ? (
                    <button
                      onClick={handleEdit}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                        padding: 'var(--stm-space-2) var(--stm-space-4)',
                        background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))',
                        color: 'white', border: 'none',
                        borderRadius: 'var(--stm-radius-md)',
                        fontSize: 'var(--stm-text-sm)',
                        fontWeight: 'var(--stm-font-semibold)',
                        cursor: 'pointer',
                        fontFamily: 'var(--stm-font-body)',
                      }}
                    >
                      <Edit2 style={{ width: '14px', height: '14px' }} />
                      Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
                      <button
                        onClick={handleCancel}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                          padding: 'var(--stm-space-2) var(--stm-space-4)',
                          backgroundColor: 'var(--stm-card)',
                          color: 'var(--stm-muted-foreground)',
                          border: '1px solid var(--stm-border)',
                          borderRadius: 'var(--stm-radius-md)',
                          fontWeight: 'var(--stm-font-medium)',
                          fontSize: 'var(--stm-text-sm)',
                          fontFamily: 'var(--stm-font-body)',
                          cursor: 'pointer',
                        }}
                      >
                        <X style={{ width: '14px', height: '14px' }} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                          padding: 'var(--stm-space-2) var(--stm-space-4)',
                          backgroundColor: 'var(--stm-success)',
                          color: 'white', border: 'none',
                          borderRadius: 'var(--stm-radius-md)',
                          fontSize: 'var(--stm-text-sm)',
                          fontWeight: 'var(--stm-font-semibold)',
                          fontFamily: 'var(--stm-font-body)',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        <Save style={{ width: '14px', height: '14px' }} />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--stm-space-5)' }}>

                  {/* Company Name */}
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    {editing ? (
                      <input type="text" value={editData.vendor_name || ''} onChange={e => updateField('vendor_name', e.target.value)} style={inputStyle} />
                    ) : (
                      <div style={fieldValueStyle}>{profile.vendor_name}</div>
                    )}
                  </div>

                  {/* Primary Contact */}
                  <div>
                    <label style={labelStyle}>Primary Contact</label>
                    {editing ? (
                      <input type="text" value={editData.primary_contact || ''} onChange={e => updateField('primary_contact', e.target.value)} style={inputStyle} />
                    ) : (
                      <div style={fieldValueStyle}>{profile.primary_contact || 'Not set'}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
                      <Mail style={{ width: '12px', height: '12px' }} />
                      Email
                    </label>
                    <div style={fieldValueStyle}>{profile.email}</div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
                      <Phone style={{ width: '12px', height: '12px' }} />
                      Phone
                    </label>
                    {editing ? (
                      <input type="tel" value={editData.phone || ''} onChange={e => updateField('phone', e.target.value)} style={inputStyle} />
                    ) : (
                      <div style={fieldValueStyle}>{profile.phone || 'Not set'}</div>
                    )}
                  </div>

                  {/* Website */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
                      <Globe style={{ width: '12px', height: '12px' }} />
                      Website
                    </label>
                    {editing ? (
                      <input type="url" value={editData.website || ''} onChange={e => updateField('website', e.target.value)} style={inputStyle} />
                    ) : (
                      <div style={fieldValueStyle}>{profile.website || 'Not set'}</div>
                    )}
                  </div>

                  {/* Availability Status */}
                  <div>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      Availability Status
                    </label>
                    {editing ? (
                      <select value={editData.availability_status || 'Available'} onChange={e => updateField('availability_status', e.target.value)} style={inputStyle}>
                        <option value="Available">Available</option>
                        <option value="Limited">Limited Availability</option>
                        <option value="Unavailable">Unavailable</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    ) : (
                      <div style={fieldValueStyle}>
                        <span style={{
                          padding: 'var(--stm-space-1) var(--stm-space-3)',
                          borderRadius: 'var(--stm-radius-full)',
                          fontSize: 'var(--stm-text-xs)',
                          fontWeight: 'var(--stm-font-semibold)',
                          fontFamily: 'var(--stm-font-body)',
                          backgroundColor: availStyle.bg,
                          color: availStyle.color,
                        }}>
                          {profile.availability_status || 'Available'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Available From */}
                  <div>
                    <label style={labelStyle}>Available From</label>
                    {editing ? (
                      <input type="date" value={editData.available_from || ''} onChange={e => updateField('available_from', e.target.value)} style={inputStyle} />
                    ) : (
                      <div style={fieldValueStyle}>
                        {profile.available_from ? new Date(profile.available_from).toLocaleDateString() : 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Availability Notes */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Availability Notes</label>
                    {editing ? (
                      <textarea
                        value={editData.availability_notes || ''}
                        onChange={e => updateField('availability_notes', e.target.value)}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    ) : (
                      <div style={{ ...fieldValueStyle, minHeight: 'var(--stm-space-12)' }}>
                        {profile.availability_notes || 'No notes'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── RATINGS TAB ── */}
            {activeTab === 'ratings' && (
              <div>
                <div style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-6)' }}>
                  Your Performance Ratings
                </div>

                {ratings ? (
                  <div>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--stm-space-5)', marginBottom: 'var(--stm-space-6)' }}>
                      {[
                        { label: 'Total Projects', value: ratings.total_projects.toString() },
                        { label: 'Average Rating',  value: ratings.average_rating.toFixed(1), suffix: <Star style={{ width: '18px', height: '18px' }} fill="var(--stm-warning)" color="var(--stm-warning)" /> },
                        { label: 'Performance',     value: ratings.average_rating >= 4.5 ? 'Excellent' : ratings.average_rating >= 4.0 ? 'Good' : 'Fair', color: ratings.average_rating >= 4.5 ? 'var(--stm-success)' : ratings.average_rating >= 4.0 ? 'var(--stm-warning)' : 'var(--stm-error)' },
                      ].map(card => (
                        <div key={card.label} style={{ padding: 'var(--stm-space-5)', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-lg)', border: '1px solid var(--stm-border)' }}>
                          <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--stm-space-2)' }}>
                            {card.label}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
                            <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', color: card.color || 'var(--stm-primary)', fontFamily: 'var(--stm-font-body)', lineHeight: 1 }}>
                              {card.value}
                            </div>
                            {card.suffix}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coming Soon */}
                    <div style={{ padding: 'var(--stm-space-12)', textAlign: 'center', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-lg)', border: '1px solid var(--stm-border)' }}>
                      <BarChart3 style={{ width: '40px', height: '40px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-3)' }} />
                      <div style={{ color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)', marginBottom: 'var(--stm-space-2)' }}>
                        Detailed ratings coming soon
                      </div>
                      <div style={{ color: 'var(--stm-border)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-xs)' }}>
                        You'll be able to see detailed category ratings and client feedback here
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 'var(--stm-space-12)', textAlign: 'center', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-lg)', border: '1px solid var(--stm-border)' }}>
                    <Star style={{ width: '40px', height: '40px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-3)' }} />
                    <div style={{ color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)', marginBottom: 'var(--stm-space-2)' }}>
                      No ratings yet
                    </div>
                    <div style={{ color: 'var(--stm-border)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-xs)' }}>
                      Ratings will appear here once you complete projects
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
