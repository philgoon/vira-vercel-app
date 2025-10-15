"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { Button } from '../ui/button'
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

// Extended project type that matches actual database schema
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

// Union type to handle different vendor data structures from API
type ProjectWithVendor = {
  vendor?: { vendor_name?: string };
  vendor_name?: string;
  vendors?: { vendor_name?: string };
};

// Helper function to safely get vendor name from different project structures
const getVendorName = (project: ProjectWithVendor): string => {
  if (project.vendor?.vendor_name) return project.vendor.vendor_name;
  if (project.vendor_name) return project.vendor_name;
  if (project.vendors?.vendor_name) return project.vendors.vendor_name;
  return 'No vendor assigned';
};

export default function RatingSubmissionModal({
  project,
  isOpen,
  onClose,
  onSubmit
}: RatingSubmissionModalProps) {
  // [M4] Multi-step wizard state
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

  // [M4] Step validation and navigation
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return ratings.project_success_rating > 0
      case 2: return ratings.quality_rating > 0
      case 3: return ratings.communication_rating > 0
      case 4: return ratings.positive_feedback.length >= 20 || ratings.improvement_feedback.length >= 20 // At least one
      case 5: return true
      default: return false
    }
  }

  const nextStep = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Reset to step 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
    }
  }, [isOpen])

  // Pre-populate with existing data for incomplete ratings
  useEffect(() => {
    if (project && typeof project.project_success_rating !== 'undefined') {
      const existingData: Partial<typeof ratings> = {};

      if (typeof project.project_success_rating === 'number') {
        existingData.project_success_rating = project.project_success_rating;
      }
      if (typeof project.quality_rating === 'number') {
        existingData.quality_rating = project.quality_rating;
      }
      if (typeof project.communication_rating === 'number') {
        existingData.communication_rating = project.communication_rating;
      }
      if (project.what_went_well) {
        existingData.positive_feedback = project.what_went_well;
      }
      if (project.areas_for_improvement) {
        existingData.improvement_feedback = project.areas_for_improvement;
      }
      if (typeof project.recommend_again === 'boolean') {
        existingData.vendor_recommendation = project.recommend_again;
      }

      setRatings(prev => ({ ...prev, ...existingData }));
    }
  }, [project]);

  const handleRatingChange = (dimension: string, value: number) => {
    setRatings(prev => ({ ...prev, [dimension]: value }))
  }

  const calculateOverallRating = () => {
    const { project_success_rating, quality_rating, communication_rating } = ratings
    if (project_success_rating === 0 || quality_rating === 0 || communication_rating === 0) {
      return 0
    }
    return Math.round((project_success_rating + quality_rating + communication_rating) / 3)
  }

  const handleSubmit = async () => {
    const overall_rating = calculateOverallRating()

    if (overall_rating === 0) {
      alert('Please provide ratings for all dimensions.')
      return
    }

    if (!project) {
      alert('Project data is missing.')
      return
    }

    if (!project.vendor_id) {
      alert('Cannot submit rating: No vendor assigned to this project.')
      return
    }

    const submissionData = {
      project_id: project.project_id,
      vendor_id: project.vendor_id,
      ...ratings,
      overall_rating
    }

    setIsSubmitting(true)
    try {
      await onSubmit(submissionData)
      onClose()
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !project) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Rate Project
          </DialogTitle>
          <DialogDescription className="text-base">
            <strong>Project:</strong> {project.project_title}
          </DialogDescription>
        </DialogHeader>

        {/* [M4] Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs mt-1 text-gray-600">
                  {step === 1 ? 'Success' : step === 2 ? 'Quality' : step === 3 ? 'Comm.' : step === 4 ? 'Feedback' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Context Card - Shows on all steps */}
        <div className="px-6 py-3 bg-blue-50 border-l-4 border-blue-500">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span><strong>Vendor:</strong> {getVendorName(project)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span><strong>Date:</strong> {formatDate(project.rating_date)}</span>
            </div>
          </div>
        </div>

        {/* [M4] Step Content */}
        <div className="px-6 py-6 min-h-[400px]">
          
          {/* Step 1: Project Success Rating */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Success</h3>
                <p className="text-gray-600">Did this project meet its goals and objectives?</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  What to consider:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Were all deliverables completed as specified?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Did the project achieve its intended objectives?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Were stakeholders satisfied with the outcome?</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange('project_success_rating', star)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`w-10 h-10 ${star <= ratings.project_success_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {ratings.project_success_rating > 0 ? `${ratings.project_success_rating}/10` : 'Select a rating'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Quality Rating */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Quality of Work</h3>
                <p className="text-gray-600">How would you rate the quality of the final deliverables?</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  What to consider:
                </h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Attention to detail and thoroughness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Professional finish and polish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Adherence to standards and best practices</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange('quality_rating', star)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`w-10 h-10 ${star <= ratings.quality_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-purple-600">
                      {ratings.quality_rating > 0 ? `${ratings.quality_rating}/10` : 'Select a rating'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Communication Rating */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Communication</h3>
                <p className="text-gray-600">How well did the vendor communicate throughout the project?</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  What to consider:
                </h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Responsiveness to emails and messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Clarity and frequency of updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Proactive communication about issues</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange('communication_rating', star)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`w-10 h-10 ${star <= ratings.communication_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-600">
                      {ratings.communication_rating > 0 ? `${ratings.communication_rating}/10` : 'Select a rating'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Detailed Feedback */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Detailed Feedback</h3>
                <p className="text-gray-600">Share specific examples to help improve future projects</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    What went well? ✓
                  </label>
                  <span className={`text-xs ${
                    ratings.positive_feedback.length >= 50 ? 'text-green-600 font-medium' : 'text-gray-400'
                  }`}>
                    {ratings.positive_feedback.length} chars {ratings.positive_feedback.length >= 50 ? '✓' : '(50+ recommended)'}
                  </span>
                </div>
                <textarea
                  value={ratings.positive_feedback}
                  onChange={(e) => setRatings(prev => ({ ...prev, positive_feedback: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Example: 'Vendor delivered all features on time with excellent quality. Communication was proactive with daily updates...'"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Areas for improvement ⚠
                  </label>
                  <span className={`text-xs ${
                    ratings.improvement_feedback.length >= 30 ? 'text-green-600 font-medium' : 'text-gray-400'
                  }`}>
                    {ratings.improvement_feedback.length} chars {ratings.improvement_feedback.length >= 30 ? '✓' : '(30+ recommended)'}
                  </span>
                </div>
                <textarea
                  value={ratings.improvement_feedback}
                  onChange={(e) => setRatings(prev => ({ ...prev, improvement_feedback: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Example: 'Response times could be faster - sometimes 48+ hours. More frequent status updates would help track progress...'"
                />
              </div>
            </div>
          )}

          {/* Step 5: Final Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h3>
                <p className="text-gray-600">Review your ratings and add final details</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Rating Summary</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Success</p>
                    <p className="text-2xl font-bold text-blue-600">{ratings.project_success_rating}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Quality</p>
                    <p className="text-2xl font-bold text-purple-600">{ratings.quality_rating}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Communication</p>
                    <p className="text-2xl font-bold text-green-600">{ratings.communication_rating}/10</p>
                  </div>
                </div>
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">Overall Rating</p>
                  <p className="text-4xl font-bold text-blue-600">{calculateOverallRating()}/10</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <label className="text-sm font-medium text-amber-900 mb-3 block">
                  Would you recommend this vendor? 🤝
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, vendor_recommendation: true }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${ratings.vendor_recommendation
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Yes, Recommend</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, vendor_recommendation: false }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${!ratings.vendor_recommendation
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 text-center">❌</span>
                      <span className="font-medium">No, Don&apos;t Recommend</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Timeline Status */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="text-sm font-medium text-purple-900 mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Project Timeline Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, timeline_status: 'Early' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      ratings.timeline_status === 'Early'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    Early
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, timeline_status: 'On-Time' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      ratings.timeline_status === 'On-Time'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    On-Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, timeline_status: 'Late' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      ratings.timeline_status === 'Late'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
                    }`}
                  >
                    Late
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : prevStep}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
