// [C1] Vendor Application Form - Multi-step wizard
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, CheckCircle, Building2, Briefcase, DollarSign, Calendar, Globe } from 'lucide-react'

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

  useEffect(() => {
    validateInvite()
  }, [token])

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
    } catch (err) {
      setError('Failed to validate invitation')
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Success - redirect to success page
      router.push('/apply/success')
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
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
          <p style={{ color: '#6b7280' }}>Validating invitation...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ maxWidth: '28rem', textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ fontSize: '2rem' }}>❌</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Invalid Invitation</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Please contact the administrator for a new invitation link.</p>
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A5276', marginBottom: '0.5rem' }}>
            Vendor Application
          </h1>
          <p style={{ color: '#6b7280' }}>
            Complete your profile to join our vendor network
          </p>
          {inviteData && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Applying as: <strong>{inviteData.email}</strong>
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.num === currentStep
              const isCompleted = step.num < currentStep
              
              return (
                <div key={step.num} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#6B8F71' : isActive ? '#1A5276' : '#f3f4f6',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isCompleted ? '#6B8F71' : isActive ? '#1A5276' : '#e5e7eb',
                      color: isCompleted || isActive ? 'white' : '#6E6F71',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      transition: 'all 300ms'
                    }}>
                      {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? '#1A5276' : '#6b7280',
                      textAlign: 'center'
                    }}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor: isCompleted ? '#6B8F71' : '#e5e7eb',
                      marginBottom: '2rem',
                      minWidth: '30px',
                      marginLeft: '0.5rem',
                      marginRight: '0.5rem'
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                Basic Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Company Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                    placeholder="Your Company LLC"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Contact Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => updateFormData('contact_name', e.target.value)}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                Services & Expertise
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    placeholder="e.g., Marketing, Technology, Healthcare"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Service Category
                  </label>
                  <select
                    value={formData.service_category}
                    onChange={(e) => updateFormData('service_category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
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
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Skills & Specialties
                  </label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => updateFormData('skills', e.target.value)}
                    placeholder="Describe your key skills and specialties..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                Pricing Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Pricing Structure
                  </label>
                  <select
                    value={formData.pricing_structure}
                    onChange={(e) => updateFormData('pricing_structure', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select pricing structure</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="project">Per Project</option>
                    <option value="retainer">Monthly Retainer</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Rate / Cost
                  </label>
                  <input
                    type="text"
                    value={formData.rate_cost}
                    onChange={(e) => updateFormData('rate_cost', e.target.value)}
                    placeholder="e.g., $100/hr or $5000/project"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                Availability
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Current Status
                  </label>
                  <select
                    value={formData.availability_status}
                    onChange={(e) => updateFormData('availability_status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Availability</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Available From Date
                  </label>
                  <input
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => updateFormData('available_from', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Availability Notes
                  </label>
                  <textarea
                    value={formData.availability_notes}
                    onChange={(e) => updateFormData('availability_notes', e.target.value)}
                    placeholder="Any additional details about your availability..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Portfolio */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                Portfolio & Samples
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => updateFormData('portfolio_url', e.target.value)}
                    placeholder="https://portfolio.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Sample Work URLs
                  </label>
                  <textarea
                    value={formData.sample_work_urls}
                    onChange={(e) => updateFormData('sample_work_urls', e.target.value)}
                    placeholder="Add links to your best work (one per line)"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    placeholder="Anything else you'd like us to know..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: currentStep === 1 ? '#f3f4f6' : 'white',
                color: currentStep === 1 ? '#9ca3af' : '#1A5276',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 150ms'
              }}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.company_name || !formData.contact_name}
                className="btn-success"
                style={{
                  opacity: (submitting || !formData.company_name || !formData.contact_name) ? 0.5 : 1,
                  cursor: (submitting || !formData.company_name || !formData.contact_name) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                <CheckCircle size={20} />
              </button>
            )}
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
  )
}
