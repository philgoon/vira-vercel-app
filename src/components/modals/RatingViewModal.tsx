"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Star,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  Save,
  X,
  Loader2
} from 'lucide-react'

interface RatingWithDetails {
  rating_id: number;
  project_success_rating: number;
  vendor_quality_rating: number;
  vendor_communication_rating: number;
  what_went_well?: string;
  areas_for_improvement?: string;
  vendor_overall_rating: number;
  rating_date: string;
}

type ProjectWithRating = {
  project_id: string;
  project_title: string;
  status: string;
  project_type?: string;
  vendor: {
    vendor_name: string;
    service_categories?: string;
  } | null;
  client: {
    client_name: string;
  } | null;
  rating: RatingWithDetails | null;
  rating_status: 'Complete' | 'Incomplete' | 'Needs Review';
};

interface RatingViewModalProps {
  project: ProjectWithRating | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingUpdated?: () => void; // Callback to refresh parent data
}

export default function RatingViewModal({
  project,
  isOpen,
  onClose,
  onRatingUpdated
}: RatingViewModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedRating, setEditedRating] = useState({
    project_success_rating: 0,
    quality_rating: 0,
    communication_rating: 0,
    positive_feedback: '',
    improvement_feedback: ''
  });

  if (!project || !project.rating) return null;
  const { rating } = project;

  // Initialize edit form when entering edit mode
  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditedRating({
        project_success_rating: rating.project_success_rating,
        quality_rating: rating.vendor_quality_rating,
        communication_rating: rating.vendor_communication_rating,
        positive_feedback: rating.what_went_well || '',
        improvement_feedback: rating.areas_for_improvement || ''
      });
    }
    setIsEditMode(!isEditMode);
  };

  // Handle rating changes in edit mode
  const handleRatingChange = (dimension: string, value: number) => {
    setEditedRating(prev => ({ ...prev, [dimension]: value }));
  };

  // Calculate overall rating
  const calculateOverallRating = () => {
    const { project_success_rating, quality_rating, communication_rating } = editedRating;
    const total = project_success_rating + quality_rating + communication_rating;
    return total > 0 ? Number((total / 3).toFixed(1)) : 0;
  };

  // Handle save
  const handleSave = async () => {
    const overall_rating = calculateOverallRating();

    if (overall_rating === 0) {
      alert('Please provide at least one rating before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rate-project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.project_id,
          vendor_id: (rating as any).vendor_id, // TODO: Fix type - runtime data includes vendor_id
          rater_email: 'admin@temp.com', // Temporary for cleanup
          project_success_rating: editedRating.project_success_rating,
          quality_rating: editedRating.quality_rating,
          communication_rating: editedRating.communication_rating,
          positive_feedback: editedRating.positive_feedback,
          improvement_feedback: editedRating.improvement_feedback,
          overall_rating
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      setIsEditMode(false);
      onRatingUpdated?.(); // Trigger parent refresh

    } catch (error) {
      console.error('Failed to update rating:', error);
      alert('Failed to update rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditMode(false);
    setEditedRating({
      project_success_rating: rating.project_success_rating,
      quality_rating: rating.vendor_quality_rating,
      communication_rating: rating.vendor_communication_rating,
      positive_feedback: rating.what_went_well || '',
      improvement_feedback: rating.areas_for_improvement || ''
    });
  };

  const StarDisplay = ({
    value,
    label,
    dimension,
    editable = false
  }: {
    value: number,
    label: string,
    dimension?: string,
    editable?: boolean
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">
          {editable && dimension ? editedRating[dimension as keyof typeof editedRating] as number : value}/10
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
          const currentValue = editable && dimension ? editedRating[dimension as keyof typeof editedRating] as number : value;
          return (
            <Star
              key={star}
              className={`w-4 h-4 transition-colors ${editable ? 'cursor-pointer hover:text-yellow-300' : ''
                } ${star <= currentValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
                }`}
              onClick={() => editable && dimension && handleRatingChange(dimension, star)}
            />
          );
        })}
      </div>
    </div>
  )

  const getOverallRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (rating >= 6) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (rating >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {project.project_title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                Rating: {project.project_title}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {project.status}
                </Badge>
                {project.project_type && (
                  <Badge variant="outline">
                    {project.project_type}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-base">
                Detailed rating breakdown and feedback for this project.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Project Context */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Vendor:</span>
            <span>{project.vendor?.vendor_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Category:</span>
            <span>{project.vendor?.service_categories || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" style={{ color: '#1A5276' }} />
            <span className="font-medium">Rated:</span>
            <span>{new Date(rating.rating_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Overall Rating Highlight */}
        <div className={`p-6 rounded-lg border-2 mb-6 ${isEditMode
          ? getOverallRatingColor(calculateOverallRating())
          : getOverallRatingColor(rating.vendor_overall_rating)
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Overall Rating {isEditMode && <span className="text-sm opacity-75">(Live Preview)</span>}
              </h3>
              <p className="text-sm opacity-75">Average across all dimensions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isEditMode ? calculateOverallRating() : rating.vendor_overall_rating}/10
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Rating Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: '#1A5276' }} />
              Performance Ratings
            </h3>
            <div className="space-y-4">
              <StarDisplay
                value={rating.project_success_rating}
                label="Project Success"
                dimension="project_success_rating"
                editable={isEditMode}
              />
              <StarDisplay
                value={rating.vendor_quality_rating}
                label="Quality of Work"
                dimension="quality_rating"
                editable={isEditMode}
              />
              <StarDisplay
                value={rating.vendor_communication_rating}
                label="Communication"
                dimension="communication_rating"
                editable={isEditMode}
              />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: '#1A5276' }} />
              Project Feedback
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">What Went Well</h4>
                {isEditMode ? (
                  <textarea
                    value={editedRating.positive_feedback}
                    onChange={(e) => setEditedRating(prev => ({ ...prev, positive_feedback: e.target.value }))}
                    className="w-full p-3 text-sm border rounded-md min-h-[80px] resize-none bg-green-50 border-green-200 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="Describe what went well with this project..."
                  />
                ) : (
                  <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                    {rating.what_went_well || 'No feedback provided'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">Areas for Improvement</h4>
                {isEditMode ? (
                  <textarea
                    value={editedRating.improvement_feedback}
                    onChange={(e) => setEditedRating(prev => ({ ...prev, improvement_feedback: e.target.value }))}
                    className="w-full p-3 text-sm border rounded-md min-h-[80px] resize-none bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    placeholder="Describe areas that could be improved..."
                  />
                ) : (
                  <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                    {rating.areas_for_improvement || 'No feedback provided'}
                  </div>
                )}
              </div>
              {!rating.what_went_well && !rating.areas_for_improvement && (
                <div className="text-center text-gray-500 py-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No structured feedback available</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Quick Stats Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Rating ID: {rating.rating_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Submitted: {new Date(rating.rating_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: '#1A5276' }} />
              <span>Overall Rating: {rating.vendor_overall_rating}/10</span>
            </div>
          </div>
        </div>

        {/* Save/Cancel Buttons for Edit Mode */}
        {isEditMode && (
          <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
