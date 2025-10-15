// [C1] Vendor Application Form - Multi-step wizard
"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  DollarSign, 
  Calendar,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface VendorApplicationData {
  // Basic Info
  company_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  
  // Services
  industry: string
  service_category: string
  skills: string
  
  // Pricing
  pricing_structure: string
  rate_cost: string
  
  // Availability
  availability: string
  availability_status: string
  available_from: string
  availability_notes: string
  
  // Portfolio
  portfolio_url: string
  sample_work_urls: string
  
  // Notes
  notes: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Services', icon: Briefcase },
  { id: 3, title: 'Pricing', icon: DollarSign },
  { id: 4, title: 'Availability', icon: Calendar },
  { id: 5, title: 'Portfolio', icon: FileText },
  { id: 6, title: 'Review', icon: CheckCircle }
]

export default function VendorApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [inviteValid, setInviteValid] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  
  const [formData, setFormData] = useState<VendorApplicationData>({
    company_name: '',
    contact_name: '',
    email: '',
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
      const response = await fetch(`/api/vendor-invites/validate/${token}`)
      const data = await response.json()
      
      if (!response.ok || !data.valid) {
        setError(data.error || 'Invalid or expired invitation')
        setInviteValid(false)
      } else {
        setInviteValid(true)
        setInviteEmail(data.email)
        setFormData(prev => ({ ...prev, email: data.email }))
      }
    } catch (err) {
      setError('Failed to validate invitation')
      setInviteValid(false)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof VendorApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Success! Show confirmation
      setCurrentStep(STEPS.length + 1) // Move to success screen
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This invitation may have expired or been cancelled. Please contact STM for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success screen
  if (currentStep > STEPS.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for applying to join the STM Vendor Network.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What's next?</strong><br/>
                Our team will review your application and contact you within 3-5 business days.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              You can close this window now.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">STM Vendor Application</h1>
          <p className="text-gray-600">Complete your profile to join our vendor network</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-400'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs text-center ${isActive ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => updateField('contact_name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the email from your invitation</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="e.g., Marketing, Design, Development"
                  />
                </div>
                <div>
                  <Label htmlFor="service_category">Service Category *</Label>
                  <Input
                    id="service_category"
                    value={formData.service_category}
                    onChange={(e) => updateField('service_category', e.target.value)}
                    placeholder="e.g., Web Development, Graphic Design"
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills & Expertise *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    placeholder="List your key skills, technologies, or areas of expertise..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pricing_structure">Pricing Structure *</Label>
                  <select
                    id="pricing_structure"
                    value={formData.pricing_structure}
                    onChange={(e) => updateField('pricing_structure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select pricing structure</option>
                    <option value="Hourly">Hourly Rate</option>
                    <option value="Project-Based">Project-Based</option>
                    <option value="Retainer">Retainer</option>
                    <option value="Mixed">Mixed/Flexible</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="rate_cost">Rate/Cost *</Label>
                  <Input
                    id="rate_cost"
                    value={formData.rate_cost}
                    onChange={(e) => updateField('rate_cost', e.target.value)}
                    placeholder="e.g., $75/hour, $5,000-$10,000 per project"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide your typical rates or project costs</p>
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="availability_status">Current Status *</Label>
                  <select
                    id="availability_status"
                    value={formData.availability_status}
                    onChange={(e) => updateField('availability_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Availability</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => updateField('available_from', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Typical Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => updateField('availability', e.target.value)}
                    placeholder="e.g., 20 hours/week, Full-time"
                  />
                </div>
                <div>
                  <Label htmlFor="availability_notes">Availability Notes</Label>
                  <Textarea
                    id="availability_notes"
                    value={formData.availability_notes}
                    onChange={(e) => updateField('availability_notes', e.target.value)}
                    placeholder="Any additional details about your availability..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Portfolio */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="portfolio_url">Portfolio Website</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => updateField('portfolio_url', e.target.value)}
                    placeholder="https://portfolio.com"
                  />
                </div>
                <div>
                  <Label htmlFor="sample_work_urls">Sample Work URLs</Label>
                  <Textarea
                    id="sample_work_urls"
                    value={formData.sample_work_urls}
                    onChange={(e) => updateField('sample_work_urls', e.target.value)}
                    placeholder="Paste links to your best work (one per line)..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Include links to projects, case studies, or samples</p>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Anything else you'd like us to know..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Review your information before submitting</strong><br/>
                    Make sure all details are accurate. You can go back to edit any section.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Basic Information</h3>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <p><strong>Company:</strong> {formData.company_name || 'Not provided'}</p>
                      <p><strong>Contact:</strong> {formData.contact_name || 'Not provided'}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
                      <p><strong>Website:</strong> {formData.website || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Services</h3>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <p><strong>Industry:</strong> {formData.industry || 'Not provided'}</p>
                      <p><strong>Category:</strong> {formData.service_category || 'Not provided'}</p>
                      <p><strong>Skills:</strong> {formData.skills || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Pricing & Availability</h3>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <p><strong>Pricing:</strong> {formData.pricing_structure || 'Not provided'}</p>
                      <p><strong>Rate:</strong> {formData.rate_cost || 'Not provided'}</p>
                      <p><strong>Status:</strong> {formData.availability_status}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || submitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
