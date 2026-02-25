"use client"

import React, { useState } from 'react'
import { SidePanel, SidePanelSection, SidePanelFooterAction } from '@/components/layout/SidePanel'
import { Star, Building2, Users, Calendar, MessageSquare, CheckCircle } from 'lucide-react'

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
  onRatingUpdated?: () => void;
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

  const handleRatingChange = (dimension: string, value: number) => {
    setEditedRating(prev => ({ ...prev, [dimension]: value }));
  };

  const calculateOverallRating = () => {
    const { project_success_rating, quality_rating, communication_rating } = editedRating;
    const total = project_success_rating + quality_rating + communication_rating;
    return total > 0 ? Number((total / 3).toFixed(1)) : 0;
  };

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
          vendor_id: (rating as any).vendor_id,
          rater_email: 'admin@temp.com',
          project_success_rating: editedRating.project_success_rating,
          quality_rating: editedRating.quality_rating,
          communication_rating: editedRating.communication_rating,
          positive_feedback: editedRating.positive_feedback,
          improvement_feedback: editedRating.improvement_feedback,
          overall_rating
        })
      });
      if (!response.ok) throw new Error('Failed to update rating');
      setIsEditMode(false);
      onRatingUpdated?.();
    } catch (error) {
      console.error('Failed to update rating:', error);
      alert('Failed to update rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Overall rating color
  const getOverallColor = (r: number) => {
    if (r >= 8) return 'var(--stm-success)';
    if (r >= 6) return 'var(--stm-primary)';
    if (r >= 4) return 'var(--stm-warning)';
    return 'var(--stm-error)';
  };

  const displayOverall = isEditMode ? calculateOverallRating() : rating.vendor_overall_rating;
  const overallColor = getOverallColor(displayOverall);

  // Star display/edit component
  const StarRow = ({
    value,
    label,
    dimension,
    editable = false
  }: {
    value: number,
    label: string,
    dimension?: string,
    editable?: boolean
  }) => {
    const currentValue = editable && dimension
      ? editedRating[dimension as keyof typeof editedRating] as number
      : value;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
            {label}
          </span>
          <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>
            {currentValue}/10
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <Star
              key={star}
              style={{
                width: '16px',
                height: '16px',
                cursor: editable ? 'pointer' : 'default',
                color: star <= currentValue ? 'var(--stm-warning)' : 'var(--stm-border)',
                fill: star <= currentValue ? 'var(--stm-warning)' : 'transparent',
                transition: 'color var(--stm-duration-fast) var(--stm-ease-out)',
              }}
              onClick={() => editable && dimension && handleRatingChange(dimension, star)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Rating: ${project.project_title}`}
      footer={
        isEditMode ? (
          <>
            <SidePanelFooterAction onClick={handleCancel} label="Cancel" disabled={isSubmitting} />
            <SidePanelFooterAction
              onClick={handleSave}
              label={isSubmitting ? 'Saving...' : 'Save Changes'}
              variant="primary"
              disabled={isSubmitting}
            />
          </>
        ) : (
          <>
            <SidePanelFooterAction onClick={handleEditToggle} label="Edit Rating" />
            <SidePanelFooterAction onClick={onClose} label="Close" variant="primary" />
          </>
        )
      }
    >
      {/* Project Context */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--stm-space-3)',
        padding: 'var(--stm-space-4)',
        backgroundColor: 'var(--stm-muted)',
        borderRadius: 'var(--stm-radius-md)',
        marginBottom: 'var(--stm-space-6)',
        fontSize: 'var(--stm-text-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <Building2 style={{ width: '16px', height: '16px', color: 'var(--stm-primary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>Vendor:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
            {project.vendor?.vendor_name || 'N/A'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <Users style={{ width: '16px', height: '16px', color: 'var(--stm-primary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>Category:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
            {project.vendor?.service_categories || 'N/A'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <Calendar style={{ width: '16px', height: '16px', color: 'var(--stm-primary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>Rated:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
            {new Date(rating.rating_date).toLocaleDateString()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--stm-primary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--stm-muted-foreground)' }}>ID:</span>
          <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
            #{rating.rating_id}
          </span>
        </div>
      </div>

      {/* Overall Rating */}
      <div style={{
        padding: 'var(--stm-space-6)',
        borderRadius: 'var(--stm-radius-md)',
        border: `2px solid ${overallColor}`,
        backgroundColor: `color-mix(in srgb, ${overallColor} 10%, transparent)`,
        marginBottom: 'var(--stm-space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: overallColor, marginBottom: 'var(--stm-space-1)' }}>
              Overall Rating {isEditMode && <span style={{ opacity: 0.75, fontSize: 'var(--stm-text-sm)' }}>(Live Preview)</span>}
            </h3>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
              Average across all dimensions
            </p>
          </div>
          <div style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: overallColor }}>
            {displayOverall}/10
          </div>
        </div>
      </div>

      {/* Performance Ratings */}
      <SidePanelSection title="Performance Ratings">
        <StarRow
          value={rating.project_success_rating}
          label="Project Success"
          dimension="project_success_rating"
          editable={isEditMode}
        />
        <StarRow
          value={rating.vendor_quality_rating}
          label="Quality of Work"
          dimension="quality_rating"
          editable={isEditMode}
        />
        <StarRow
          value={rating.vendor_communication_rating}
          label="Communication"
          dimension="communication_rating"
          editable={isEditMode}
        />
      </SidePanelSection>

      {/* Feedback */}
      <SidePanelSection title="Project Feedback">
        <div>
          <p style={{ fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--stm-space-2)' }}>
            What Went Well
          </p>
          {isEditMode ? (
            <textarea
              value={editedRating.positive_feedback}
              onChange={(e) => setEditedRating(prev => ({ ...prev, positive_feedback: e.target.value }))}
              placeholder="Describe what went well..."
              style={{
                width: '100%',
                padding: 'var(--stm-space-3)',
                fontSize: 'var(--stm-text-sm)',
                border: `1px solid var(--stm-success)`,
                borderRadius: 'var(--stm-radius-md)',
                minHeight: '80px',
                resize: 'vertical' as const,
                backgroundColor: `color-mix(in srgb, var(--stm-success) 8%, transparent)`,
                color: 'var(--stm-foreground)',
                fontFamily: 'inherit',
                boxSizing: 'border-box' as const,
              }}
            />
          ) : (
            <div style={{
              fontSize: 'var(--stm-text-sm)',
              color: 'var(--stm-foreground)',
              backgroundColor: `color-mix(in srgb, var(--stm-success) 8%, transparent)`,
              padding: 'var(--stm-space-3)',
              borderRadius: 'var(--stm-radius-md)',
              borderLeft: '3px solid var(--stm-success)',
            }}>
              {rating.what_went_well || 'No feedback provided'}
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--stm-space-2)' }}>
            Areas for Improvement
          </p>
          {isEditMode ? (
            <textarea
              value={editedRating.improvement_feedback}
              onChange={(e) => setEditedRating(prev => ({ ...prev, improvement_feedback: e.target.value }))}
              placeholder="Describe areas for improvement..."
              style={{
                width: '100%',
                padding: 'var(--stm-space-3)',
                fontSize: 'var(--stm-text-sm)',
                border: `1px solid var(--stm-primary)`,
                borderRadius: 'var(--stm-radius-md)',
                minHeight: '80px',
                resize: 'vertical' as const,
                backgroundColor: `color-mix(in srgb, var(--stm-primary) 8%, transparent)`,
                color: 'var(--stm-foreground)',
                fontFamily: 'inherit',
                boxSizing: 'border-box' as const,
              }}
            />
          ) : (
            <div style={{
              fontSize: 'var(--stm-text-sm)',
              color: 'var(--stm-foreground)',
              backgroundColor: `color-mix(in srgb, var(--stm-primary) 8%, transparent)`,
              padding: 'var(--stm-space-3)',
              borderRadius: 'var(--stm-radius-md)',
              borderLeft: '3px solid var(--stm-primary)',
            }}>
              {rating.areas_for_improvement || 'No feedback provided'}
            </div>
          )}
        </div>

        {!rating.what_went_well && !rating.areas_for_improvement && !isEditMode && (
          <div style={{ textAlign: 'center', color: 'var(--stm-muted-foreground)', padding: 'var(--stm-space-4)' }}>
            <MessageSquare style={{ width: '32px', height: '32px', margin: '0 auto var(--stm-space-2)', color: 'var(--stm-border)' }} />
            <p style={{ fontSize: 'var(--stm-text-sm)' }}>No structured feedback available</p>
          </div>
        )}
      </SidePanelSection>
    </SidePanel>
  )
}
