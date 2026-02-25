"use client"

import React, { useState, useEffect } from 'react'
import { SidePanel, SidePanelFooterAction } from '@/components/layout/SidePanel'
import {
  Star,
  Building2,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  HelpCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Project } from '@/types'

type ProjectWithRatings = Project & {
  project_success_rating?: number | null;
  quality_rating?: number | null;
  communication_rating?: number | null;
  what_went_well?: string | null;
  areas_for_improvement?: string | null;
  recommend_again?: boolean | null;
};

interface RatingSubmissionModalProps {
  project: ProjectWithRatings | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (ratings: RatingData) => Promise<void>
}

interface RatingData {
  project_id: string
  vendor_id: string
  project_success_rating: number
  quality_rating: number
  communication_rating: number
  positive_feedback: string
  improvement_feedback: string
  overall_rating: number
  vendor_recommendation: boolean
  timeline_status: 'Early' | 'On-Time' | 'Late' | null
}

type ProjectWithVendor = {
  vendor?: { vendor_name?: string };
  vendor_name?: string;
  vendors?: { vendor_name?: string };
};

const getVendorName = (project: ProjectWithVendor): string => {
  if (project.vendor?.vendor_name) return project.vendor.vendor_name;
  if (project.vendor_name) return project.vendor_name;
  if (project.vendors?.vendor_name) return project.vendors.vendor_name;
  return 'No vendor assigned';
};

const STEP_LABELS = ['Success', 'Quality', 'Comm.', 'Feedback', 'Review'];

// Step colors using STM semantic tokens
const STEP_COLORS: Record<number, string> = {
  1: 'var(--stm-primary)',
  2: 'var(--stm-secondary, var(--stm-primary))',
  3: 'var(--stm-success)',
  4: 'var(--stm-foreground)',
  5: 'var(--stm-primary)',
};

export default function RatingSubmissionModal({
  project,
  isOpen,
  onClose,
  onSubmit
}: RatingSubmissionModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [ratings, setRatings] = useState({
    project_success_rating: 0,
    quality_rating: 0,
    communication_rating: 0,
    positive_feedback: '',
    improvement_feedback: '',
    vendor_recommendation: false,
    timeline_status: null as 'Early' | 'On-Time' | 'Late' | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canProceed = () => {
    switch (currentStep) {
      case 1: return ratings.project_success_rating > 0
      case 2: return ratings.quality_rating > 0
      case 3: return ratings.communication_rating > 0
      case 4: return ratings.positive_feedback.length >= 20 || ratings.improvement_feedback.length >= 20
      case 5: return true
      default: return false
    }
  }

  const nextStep = () => { if (canProceed() && currentStep < totalSteps) setCurrentStep(s => s + 1) }
  const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1) }

  useEffect(() => {
    if (isOpen) setCurrentStep(1)
  }, [isOpen])

  useEffect(() => {
    if (project && typeof project.project_success_rating !== 'undefined') {
      const existing: Partial<typeof ratings> = {};
      if (typeof project.project_success_rating === 'number') existing.project_success_rating = project.project_success_rating;
      if (typeof project.quality_rating === 'number') existing.quality_rating = project.quality_rating;
      if (typeof project.communication_rating === 'number') existing.communication_rating = project.communication_rating;
      if (project.what_went_well) existing.positive_feedback = project.what_went_well;
      if (project.areas_for_improvement) existing.improvement_feedback = project.areas_for_improvement;
      if (typeof project.recommend_again === 'boolean') existing.vendor_recommendation = project.recommend_again;
      setRatings(prev => ({ ...prev, ...existing }));
    }
  }, [project]);

  const handleRatingChange = (dimension: string, value: number) => {
    setRatings(prev => ({ ...prev, [dimension]: value }))
  }

  const calculateOverall = () => {
    const { project_success_rating, quality_rating, communication_rating } = ratings
    if (!project_success_rating || !quality_rating || !communication_rating) return 0
    return Math.round((project_success_rating + quality_rating + communication_rating) / 3)
  }

  const handleSubmit = async () => {
    const overall_rating = calculateOverall()
    if (overall_rating === 0) { alert('Please provide ratings for all dimensions.'); return }
    if (!project) { alert('Project data is missing.'); return }
    if (!project.vendor_id) { alert('Cannot submit rating: No vendor assigned to this project.'); return }

    setIsSubmitting(true)
    try {
      await onSubmit({ project_id: project.project_id, vendor_id: project.vendor_id, ...ratings, overall_rating })
      onClose()
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !project) return null

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A'

  // Shared star row
  const StarPicker = ({ dimension, value }: { dimension: string; value: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--stm-space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--stm-space-1)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(dimension, star)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--stm-space-1)', transition: 'transform var(--stm-duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Star style={{
              width: '32px',
              height: '32px',
              color: star <= value ? 'var(--stm-warning)' : 'var(--stm-border)',
              fill: star <= value ? 'var(--stm-warning)' : 'transparent',
            }} />
          </button>
        ))}
      </div>
      <span style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>
        {value > 0 ? `${value}/10` : 'Select a rating'}
      </span>
    </div>
  )

  const GuidanceBox = ({ items, color }: { items: string[]; color: string }) => (
    <div style={{
      padding: 'var(--stm-space-4)',
      backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      borderRadius: 'var(--stm-radius-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-3)' }}>
        <HelpCircle style={{ width: '16px', height: '16px', color }} />
        <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color }}>What to consider</span>
      </div>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)', paddingLeft: 'var(--stm-space-4)' }}>
        {items.map(item => (
          <li key={item} style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>{item}</li>
        ))}
      </ul>
    </div>
  )

  const TimelineBtn = ({ label, value, color }: { label: string; value: 'Early' | 'On-Time' | 'Late'; color: string }) => {
    const active = ratings.timeline_status === value
    return (
      <button
        type="button"
        onClick={() => setRatings(prev => ({ ...prev, timeline_status: value }))}
        style={{
          flex: 1,
          padding: 'var(--stm-space-2) var(--stm-space-3)',
          fontSize: 'var(--stm-text-sm)',
          fontWeight: 'var(--stm-font-medium)',
          borderRadius: 'var(--stm-radius-md)',
          border: `2px solid ${active ? color : 'var(--stm-border)'}`,
          backgroundColor: active ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--stm-card)',
          color: active ? color : 'var(--stm-muted-foreground)',
          cursor: 'pointer',
          transition: 'all var(--stm-duration-fast)',
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Rate Project: ${project.project_title}`}
      footer={
        <>
          <SidePanelFooterAction
            onClick={currentStep === 1 ? onClose : prevStep}
            label={currentStep === 1 ? 'Cancel' : 'Back'}
            disabled={isSubmitting}
          />
          {currentStep < totalSteps ? (
            <SidePanelFooterAction
              onClick={nextStep}
              label="Next"
              variant="primary"
              disabled={!canProceed()}
            />
          ) : (
            <SidePanelFooterAction
              onClick={handleSubmit}
              label={isSubmitting ? 'Submitting...' : 'Submit Rating'}
              variant="primary"
              disabled={isSubmitting}
            />
          )}
        </>
      }
    >
      {/* Progress Bar */}
      <div style={{ marginBottom: 'var(--stm-space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--stm-space-2)' }}>
          <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
            Step {currentStep} of {totalSteps}
          </span>
          <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--stm-border)', borderRadius: 'var(--stm-radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(currentStep / totalSteps) * 100}%`,
            backgroundColor: 'var(--stm-primary)',
            borderRadius: 'var(--stm-radius-full)',
            transition: 'width var(--stm-duration-normal) var(--stm-ease-out)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--stm-space-3)' }}>
          {[1,2,3,4,5].map(step => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--stm-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--stm-text-xs)',
                fontWeight: 'var(--stm-font-medium)',
                backgroundColor: step < currentStep ? 'var(--stm-success)' : step === currentStep ? 'var(--stm-primary)' : 'var(--stm-muted)',
                color: step <= currentStep ? 'white' : 'var(--stm-muted-foreground)',
                transition: 'background-color var(--stm-duration-fast)',
              }}>
                {step < currentStep ? '✓' : step}
              </div>
              <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
                {STEP_LABELS[step - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Context */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--stm-space-3)',
        padding: 'var(--stm-space-3) var(--stm-space-4)',
        backgroundColor: 'color-mix(in srgb, var(--stm-primary) 6%, transparent)',
        borderLeft: '3px solid var(--stm-primary)',
        borderRadius: 'var(--stm-radius-sm)',
        marginBottom: 'var(--stm-space-6)',
        fontSize: 'var(--stm-text-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <Building2 style={{ width: '14px', height: '14px', color: 'var(--stm-primary)' }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>Vendor:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{getVendorName(project)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <Calendar style={{ width: '14px', height: '14px', color: 'var(--stm-primary)' }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>Date:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{formatDate(project.rating_date)}</span>
        </div>
      </div>

      {/* Step 1: Project Success */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>Project Success</h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>Did this project meet its goals and objectives?</p>
          </div>
          <GuidanceBox color="var(--stm-primary)" items={[
            'Were all deliverables completed as specified?',
            'Did the project achieve its intended objectives?',
            'Were stakeholders satisfied with the outcome?',
          ]} />
          <StarPicker dimension="project_success_rating" value={ratings.project_success_rating} />
        </div>
      )}

      {/* Step 2: Quality */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>Quality of Work</h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>How would you rate the quality of the final deliverables?</p>
          </div>
          <GuidanceBox color="var(--stm-primary)" items={[
            'Attention to detail and thoroughness',
            'Professional finish and polish',
            'Adherence to standards and best practices',
          ]} />
          <StarPicker dimension="quality_rating" value={ratings.quality_rating} />
        </div>
      )}

      {/* Step 3: Communication */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>Communication</h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>How well did the vendor communicate throughout the project?</p>
          </div>
          <GuidanceBox color="var(--stm-success)" items={[
            'Responsiveness to emails and messages',
            'Clarity and frequency of updates',
            'Proactive communication about issues',
          ]} />
          <StarPicker dimension="communication_rating" value={ratings.communication_rating} />
        </div>
      )}

      {/* Step 4: Feedback */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-5)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>Detailed Feedback</h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>Share specific examples to help improve future projects</p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--stm-space-2)' }}>
              <label style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>What went well?</label>
              <span style={{
                fontSize: 'var(--stm-text-xs)',
                color: ratings.positive_feedback.length >= 50 ? 'var(--stm-success)' : 'var(--stm-muted-foreground)',
              }}>
                {ratings.positive_feedback.length} chars {ratings.positive_feedback.length >= 50 ? '✓' : '(50+ recommended)'}
              </span>
            </div>
            <textarea
              value={ratings.positive_feedback}
              onChange={(e) => setRatings(prev => ({ ...prev, positive_feedback: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--stm-space-3)',
                fontSize: 'var(--stm-text-sm)',
                border: '1px solid var(--stm-success)',
                borderRadius: 'var(--stm-radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--stm-success) 6%, transparent)',
                color: 'var(--stm-foreground)',
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                boxSizing: 'border-box' as const,
                outline: 'none',
              }}
              placeholder="Example: 'Vendor delivered all features on time with excellent quality...'"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--stm-space-2)' }}>
              <label style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>Areas for improvement</label>
              <span style={{
                fontSize: 'var(--stm-text-xs)',
                color: ratings.improvement_feedback.length >= 30 ? 'var(--stm-success)' : 'var(--stm-muted-foreground)',
              }}>
                {ratings.improvement_feedback.length} chars {ratings.improvement_feedback.length >= 30 ? '✓' : '(30+ recommended)'}
              </span>
            </div>
            <textarea
              value={ratings.improvement_feedback}
              onChange={(e) => setRatings(prev => ({ ...prev, improvement_feedback: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--stm-space-3)',
                fontSize: 'var(--stm-text-sm)',
                border: '1px solid var(--stm-primary)',
                borderRadius: 'var(--stm-radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--stm-primary) 6%, transparent)',
                color: 'var(--stm-foreground)',
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                boxSizing: 'border-box' as const,
                outline: 'none',
              }}
              placeholder="Example: 'Response times could be faster - sometimes 48+ hours...'"
            />
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-5)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>Review & Submit</h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>Review your ratings and add final details</p>
          </div>

          {/* Summary */}
          <div style={{
            padding: 'var(--stm-space-5)',
            backgroundColor: 'var(--stm-muted)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
              Rating Summary
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--stm-space-4)', marginBottom: 'var(--stm-space-4)' }}>
              {[
                { label: 'Success', value: ratings.project_success_rating },
                { label: 'Quality', value: ratings.quality_rating },
                { label: 'Communication', value: ratings.communication_rating },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>{label}</div>
                  <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>{value}/10</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', paddingTop: 'var(--stm-space-4)', borderTop: '1px solid var(--stm-border)' }}>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>Overall Rating</div>
              <div style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>{calculateOverall()}/10</div>
            </div>
          </div>

          {/* Recommendation */}
          <div style={{
            padding: 'var(--stm-space-4)',
            backgroundColor: 'color-mix(in srgb, var(--stm-warning) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--stm-warning) 25%, transparent)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-3)' }}>
              Would you recommend this vendor?
            </p>
            <div style={{ display: 'flex', gap: 'var(--stm-space-3)' }}>
              {[
                { label: 'Yes, Recommend', value: true, color: 'var(--stm-success)' },
                { label: "Don't Recommend", value: false, color: 'var(--stm-error)' },
              ].map(({ label, value, color }) => {
                const active = ratings.vendor_recommendation === value
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, vendor_recommendation: value }))}
                    style={{
                      flex: 1,
                      padding: 'var(--stm-space-3)',
                      borderRadius: 'var(--stm-radius-md)',
                      border: `2px solid ${active ? color : 'var(--stm-border)'}`,
                      backgroundColor: active ? `color-mix(in srgb, ${color} 10%, transparent)` : 'var(--stm-card)',
                      color: active ? color : 'var(--stm-muted-foreground)',
                      cursor: 'pointer',
                      fontSize: 'var(--stm-text-sm)',
                      fontWeight: 'var(--stm-font-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--stm-space-2)',
                      transition: 'all var(--stm-duration-fast)',
                    }}
                  >
                    {value ? <CheckCircle style={{ width: '16px', height: '16px' }} /> : null}
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Timeline Status */}
          <div style={{
            padding: 'var(--stm-space-4)',
            backgroundColor: 'color-mix(in srgb, var(--stm-primary) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-3)' }}>
              <Clock style={{ width: '14px', height: '14px', color: 'var(--stm-primary)' }} />
              <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
                Project Timeline Status
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
              <TimelineBtn label="Early" value="Early" color="var(--stm-success)" />
              <TimelineBtn label="On-Time" value="On-Time" color="var(--stm-primary)" />
              <TimelineBtn label="Late" value="Late" color="var(--stm-error)" />
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  )
}
