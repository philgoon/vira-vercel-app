// [C1] Vendor Application Form - Multi-step wizard
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, CheckCircle, Building2, Briefcase, DollarSign, Calendar, Globe, XCircle } from 'lucide-react'

interface InviteData {
  email: string
  invite_id: string
  status: string
  expires_at: string
}

interface FormData {
  company_name: string
  contact_name: string
  phone: string
  website: string
  industry: string
  service_category: string
  skills: string
  pricing_structure: string
  rate_cost: string
  availability: string
  availability_status: string
  available_from: string
  availability_notes: string
  portfolio_url: string
  sample_work_urls: string
  notes: string
}

const inputStyle = {
  width: '100%',
  padding: 'var(--stm-space-3)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-md)',
  fontSize: 'var(--stm-text-base)',
  fontFamily: 'var(--stm-font-body)',
  backgroundColor: 'var(--stm-background)',
  color: 'var(--stm-foreground)',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--stm-text-sm)',
  fontWeight: 'var(--stm-font-medium)',
  color: 'var(--stm-foreground)',
  marginBottom: 'var(--stm-space-2)',
  fontFamily: 'var(--stm-font-body)',
}

export default function VendorApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_name: '',
    phone: '',
    website: '',
    industry: '',
    service_category: '',
    skills: '',
    pricing_structure: '',
    rate_cost: '',
    availability: '',
    availability_status: 'Available',
    available_from: '',
    availability_notes: '',
    portfolio_url: '',
    sample_work_urls: '',
    notes: ''
  })

  useEffect(() => { validateInvite() }, [token])

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/vendor-invites/validate?token=${token}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Invalid invitation link')
        setLoading(false)
        return
      }
      setInviteData(data.invite)
      setLoading(false)
    } catch {
      setError('Failed to validate invitation')
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => { if (currentStep < 5) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/vendor-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          vendor_name: formData.company_name,
          primary_contact: formData.contact_name,
          phone: formData.phone,
          website: formData.website,
          industry: formData.industry,
          service_category: formData.service_category,
          skills: formData.skills,
          pricing_structure: formData.pricing_structure,
          rate_cost: formData.rate_cost,
          availability: formData.availability,
          availability_status: formData.availability_status,
          available_from: formData.available_from,
          availability_notes: formData.availability_notes,
          portfolio_url: formData.portfolio_url,
          sample_work_urls: formData.sample_work_urls,
          notes: formData.notes
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit application')
      router.push('/apply/success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
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
          <div style={{ color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)' }}>
            Validating invitation...
          </div>
        </div>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--stm-page-background)', padding: 'var(--stm-space-8)' }}>
        <div style={{ maxWidth: '28rem', textAlign: 'center', backgroundColor: 'var(--stm-card)', padding: 'var(--stm-space-8)', borderRadius: 'var(--stm-radius-lg)', boxShadow: 'var(--stm-shadow-md)', border: '1px solid var(--stm-border)' }}>
          <div style={{
            width: '64px', height: '64px',
            backgroundColor: 'color-mix(in srgb, var(--stm-error) 12%, transparent)',
            borderRadius: 'var(--stm-radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--stm-space-4)',
          }}>
            <XCircle style={{ width: '32px', height: '32px', color: 'var(--stm-error)' }} />
          </div>
          <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)', fontFamily: 'var(--stm-font-body)' }}>
            Invalid Invitation
          </div>
          <div style={{ color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)' }}>
            {error}
          </div>
          <div style={{ color: 'var(--stm-muted-foreground)', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)' }}>
            Please contact the administrator for a new invitation link.
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1, title: 'Basic Info', icon: Building2 },
    { num: 2, title: 'Services', icon: Briefcase },
    { num: 3, title: 'Pricing', icon: DollarSign },
    { num: 4, title: 'Availability', icon: Calendar },
    { num: 5, title: 'Portfolio', icon: Globe }
  ]

  const canSubmit = !submitting && formData.company_name && formData.contact_name

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--stm-page-background)', padding: 'var(--stm-space-8)' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--stm-space-8)' }}>
          <div style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)', marginBottom: 'var(--stm-space-2)', fontFamily: 'var(--stm-font-body)' }}>
            Vendor Application
          </div>
          <div style={{ color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
            Complete your profile to join our vendor network
          </div>
          {inviteData && (
            <div style={{ color: 'var(--stm-muted-foreground)', fontSize: 'var(--stm-text-sm)', marginTop: 'var(--stm-space-2)', fontFamily: 'var(--stm-font-body)' }}>
              Applying as: <strong>{inviteData.email}</strong>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{ backgroundColor: 'var(--stm-card)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-6)', marginBottom: 'var(--stm-space-8)', boxShadow: 'var(--stm-shadow-sm)', border: '1px solid var(--stm-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.num === currentStep
              const isCompleted = step.num < currentStep

              return (
                <div key={step.num} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: 'var(--stm-radius-full)',
                      backgroundColor: isCompleted
                        ? 'color-mix(in srgb, var(--stm-success) 12%, transparent)'
                        : isActive
                          ? 'var(--stm-primary)'
                          : 'var(--stm-muted)',
                      border: isCompleted
                        ? '2px solid var(--stm-success)'
                        : isActive
                          ? '2px solid var(--stm-primary)'
                          : '2px solid var(--stm-border)',
                      color: isCompleted ? 'var(--stm-success)' : isActive ? 'white' : 'var(--stm-muted-foreground)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 'var(--stm-space-3)',
                      transition: 'all 300ms',
                    }}>
                      {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                    </div>
                    <span style={{
                      fontSize: 'var(--stm-text-xs)',
                      fontWeight: isActive ? 'var(--stm-font-semibold)' : 'var(--stm-font-normal)',
                      color: isActive ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
                      textAlign: 'center',
                      fontFamily: 'var(--stm-font-body)',
                    }}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: '2px',
                      backgroundColor: isCompleted ? 'var(--stm-success)' : 'var(--stm-border)',
                      marginBottom: 'var(--stm-space-8)',
                      minWidth: '30px',
                      marginLeft: 'var(--stm-space-2)',
                      marginRight: 'var(--stm-space-2)',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: 'var(--stm-card)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-8)', boxShadow: 'var(--stm-shadow-md)', border: '1px solid var(--stm-border)' }}>
          {error && (
            <div style={{
              backgroundColor: 'color-mix(in srgb, var(--stm-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--stm-error) 30%, transparent)',
              borderRadius: 'var(--stm-radius-md)',
              padding: 'var(--stm-space-4)',
              marginBottom: 'var(--stm-space-6)',
            }}>
              <div style={{ color: 'var(--stm-error)', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)' }}>{error}</div>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)' }}>
                Basic Information
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
                <div>
                  <label style={labelStyle}>Company Name <span style={{ color: 'var(--stm-error)' }}>*</span></label>
                  <input type="text" value={formData.company_name} onChange={(e) => updateFormData('company_name', e.target.value)} placeholder="Your Company LLC" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Name <span style={{ color: 'var(--stm-error)' }}>*</span></label>
                  <input type="text" value={formData.contact_name} onChange={(e) => updateFormData('contact_name', e.target.value)} placeholder="John Doe" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} placeholder="+1 (555) 123-4567" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input type="url" value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} placeholder="https://yourcompany.com" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)' }}>
                Services &amp; Expertise
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <input type="text" value={formData.industry} onChange={(e) => updateFormData('industry', e.target.value)} placeholder="e.g., Marketing, Technology, Healthcare" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Service Category</label>
                  <select value={formData.service_category} onChange={(e) => updateFormData('service_category', e.target.value)} style={inputStyle}>
                    <option value="">Select a category</option>
                    <option value="content">Content Creation</option>
                    <option value="seo">SEO</option>
                    <option value="copywriting">Copywriting</option>
                    <option value="social-media">Social Media</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="marketing">Marketing</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Skills &amp; Specialties</label>
                  <textarea value={formData.skills} onChange={(e) => updateFormData('skills', e.target.value)} placeholder="Describe your key skills and specialties..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)' }}>
                Pricing Information
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
                <div>
                  <label style={labelStyle}>Pricing Structure</label>
                  <select value={formData.pricing_structure} onChange={(e) => updateFormData('pricing_structure', e.target.value)} style={inputStyle}>
                    <option value="">Select pricing structure</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="project">Per Project</option>
                    <option value="retainer">Monthly Retainer</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Rate / Cost</label>
                  <input type="text" value={formData.rate_cost} onChange={(e) => updateFormData('rate_cost', e.target.value)} placeholder="e.g., $100/hr or $5000/project" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)' }}>
                Availability
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
                <div>
                  <label style={labelStyle}>Current Status</label>
                  <select value={formData.availability_status} onChange={(e) => updateFormData('availability_status', e.target.value)} style={inputStyle}>
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Availability</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Available From Date</label>
                  <input type="date" value={formData.available_from} onChange={(e) => updateFormData('available_from', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Availability Notes</label>
                  <textarea value={formData.availability_notes} onChange={(e) => updateFormData('availability_notes', e.target.value)} placeholder="Any additional details about your availability..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Portfolio */}
          {currentStep === 5 && (
            <div>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-6)', fontFamily: 'var(--stm-font-body)' }}>
                Portfolio &amp; Samples
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
                <div>
                  <label style={labelStyle}>Portfolio URL</label>
                  <input type="url" value={formData.portfolio_url} onChange={(e) => updateFormData('portfolio_url', e.target.value)} placeholder="https://portfolio.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sample Work URLs</label>
                  <textarea value={formData.sample_work_urls} onChange={(e) => updateFormData('sample_work_urls', e.target.value)} placeholder="Add links to your best work (one per line)" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Additional Notes</label>
                  <textarea value={formData.notes} onChange={(e) => updateFormData('notes', e.target.value)} placeholder="Anything else you'd like us to know..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--stm-space-8)', paddingTop: 'var(--stm-space-6)', borderTop: '1px solid var(--stm-border)' }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                padding: 'var(--stm-space-3) var(--stm-space-6)',
                backgroundColor: currentStep === 1 ? 'var(--stm-muted)' : 'var(--stm-card)',
                color: currentStep === 1 ? 'var(--stm-muted-foreground)' : 'var(--stm-primary)',
                border: '1px solid var(--stm-border)',
                borderRadius: 'var(--stm-radius-md)',
                fontWeight: 'var(--stm-font-medium)',
                fontFamily: 'var(--stm-font-body)',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                  padding: 'var(--stm-space-3) var(--stm-space-6)',
                  backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none',
                  borderRadius: 'var(--stm-radius-md)', cursor: 'pointer',
                  fontWeight: 'var(--stm-font-medium)', fontFamily: 'var(--stm-font-body)',
                }}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
                  padding: 'var(--stm-space-3) var(--stm-space-6)',
                  backgroundColor: 'var(--stm-success)', color: 'white', border: 'none',
                  borderRadius: 'var(--stm-radius-md)',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  opacity: canSubmit ? 1 : 0.5,
                  fontWeight: 'var(--stm-font-medium)', fontFamily: 'var(--stm-font-body)',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                <CheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
