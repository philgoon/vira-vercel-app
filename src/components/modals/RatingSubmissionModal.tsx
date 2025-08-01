"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Star,
  Building2,
  Users,
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { Project } from '@/types'

interface RatingSubmissionModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (ratings: RatingData) => Promise<void>
}

interface RatingData {
  project_id: string
  project_success_rating: number
  quality_rating: number
  communication_rating: number
  positive_feedback: string
  improvement_feedback: string
  overall_rating: number
}

export default function RatingSubmissionModal({
  project,
  isOpen,
  onClose,
  onSubmit
}: RatingSubmissionModalProps) {
  const [ratings, setRatings] = useState({
    project_success_rating: 0,
    quality_rating: 0,
    communication_rating: 0,
    positive_feedback: '',
    improvement_feedback: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!project) return null

  const handleRatingChange = (dimension: string, value: number) => {
    setRatings(prev => ({ ...prev, [dimension]: value }))
  }

  const calculateOverallRating = () => {
    const { project_success_rating, quality_rating, communication_rating } = ratings
    const total = project_success_rating + quality_rating + communication_rating
    return total > 0 ? Number((total / 3).toFixed(1)) : 0
  }

  const handleSubmit = async () => {
    const overall_rating = calculateOverallRating()

    if (overall_rating === 0) {
      alert('Please provide at least one rating before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        project_id: project.project_id,
        ...ratings,
        overall_rating
      })

      // Reset form
      setRatings({
        project_success_rating: 0,
        quality_rating: 0,
        communication_rating: 0,
        positive_feedback: '',
        improvement_feedback: ''
      })

      onClose()
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    dimension,
    value,
    onChange,
    label
  }: {
    dimension: string
    value: number
    onChange: (dimension: string, value: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(dimension, star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`w-5 h-5 ${star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
                }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/10` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {project.project_title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                Rate Project: {project.project_title}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {project.status}
                </Badge>
                {project.project_type && (
                  <Badge variant="outline">
                    {project.project_type}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-base">
                Please rate this project across the three core performance dimensions below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Project Context */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Vendor:</span>
            <span>{project.vendors?.vendor_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Category:</span>
            <span>{project.vendors?.service_categories || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Status:</span>
            <span>{project.status || 'N/A'}</span>
          </div>
        </div>

        {/* Rating Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StarRating
              dimension="project_success_rating"
              value={ratings.project_success_rating}
              onChange={handleRatingChange}
              label="Project Success"
            />

            <StarRating
              dimension="quality_rating"
              value={ratings.quality_rating}
              onChange={handleRatingChange}
              label="Quality of Work"
            />

            <StarRating
              dimension="communication_rating"
              value={ratings.communication_rating}
              onChange={handleRatingChange}
              label="Communication"
            />
          </div>

          <div className="space-y-6">
            {/* Overall Rating Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <label className="text-sm font-medium text-blue-900 mb-2 block">
                Overall Rating (Calculated)
              </label>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-600">
                  {calculateOverallRating()}/10
                </div>
                <div className="flex">
                  <Star className="w-6 h-6 fill-blue-400 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Feedback Text Areas */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What went well?
            </label>
            <textarea
              value={ratings.positive_feedback}
              onChange={(e) => setRatings(prev => ({ ...prev, positive_feedback: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Share what worked well in this project..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Areas for improvement
            </label>
            <textarea
              value={ratings.improvement_feedback}
              onChange={(e) => setRatings(prev => ({ ...prev, improvement_feedback: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Share areas that could be improved..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || calculateOverallRating() === 0}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
