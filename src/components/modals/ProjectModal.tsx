'use client'

import { useState } from 'react' // [R-QW1] Added for timeline status state
import { Project } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, User, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react' // [R-QW1] Added Clock icon

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedProject: Partial<Project>) => void  // Made optional for read-only mode
  onDelete?: (projectId: string) => void  // Made optional for read-only mode
}

export default function ProjectModal({ project, isOpen, onClose, onSave, onDelete }: ProjectModalProps) {
  // [R-QW1] Timeline status state
  const [timelineStatus, setTimelineStatus] = useState<'Early' | 'On-Time' | 'Late' | null>(
    project?.timeline_status || null
  )
  const [hasChanges, setHasChanges] = useState(false)

  if (!isOpen || !project) {
    return null
  }

  // [R4] Determine if project is read-only (completed projects should not be editable)
  const isReadOnly = project.status === 'closed'

  // [R4] Calculate rating display
  const overallRating = project.project_overall_rating_calc
  const hasRatings = project.project_success_rating || project.quality_rating || project.communication_rating

  // [R4] Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // [R-QW1] Handle timeline status change
  const handleTimelineStatusChange = (newStatus: 'Early' | 'On-Time' | 'Late' | null) => {
    setTimelineStatus(newStatus)
    setHasChanges(true)
  }

  // [R-QW1] Save timeline status changes
  const handleSaveTimelineStatus = () => {
    if (onSave && hasChanges) {
      onSave({ timeline_status: timelineStatus })
      setHasChanges(false)
    }
  }

  // [R4] Rating component
  const RatingDisplay = ({ rating, label }: { rating: number | null, label: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="font-semibold text-gray-900">
          {rating ? `${Number(rating).toFixed(1)}/10` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isReadOnly ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600" />
              )}
              <span>{isReadOnly ? 'Project Details (Read-Only)' : 'Edit Project'}</span>
            </div>
            <Badge variant={project.status === 'closed' ? 'default' : 'secondary'}>
              {project.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          {/* Left Column - Project Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{project.project_title}</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{project.client_name || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vendor</p>
                    <p className="font-medium">{project.vendor_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Rating Date</p>
                    <p className="font-medium">{formatDate(project.rating_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Submitted By</p>
                    <p className="font-medium">{project.submitted_by || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Samples & Feedback */}
            {(project.what_went_well || project.areas_for_improvement) && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Project Feedback & Work Samples</h3>

                {project.what_went_well && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      What Went Well
                    </h4>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                      <p className="text-gray-700 whitespace-pre-wrap">{project.what_went_well}</p>
                    </div>
                  </div>
                )}

                {project.areas_for_improvement && (
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <p className="text-gray-700 whitespace-pre-wrap">{project.areas_for_improvement}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Ratings & Metrics */}
          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {overallRating ? Number(overallRating).toFixed(1) : '—'}
                </div>
                <div className="text-gray-500 mb-4">
                  {overallRating ? 'out of 10' : 'Not rated'}
                </div>
                <div className="flex justify-center">
                  {overallRating && (
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(Number(overallRating) / 2)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Ratings */}
            {hasRatings && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Ratings</h3>
                <div className="space-y-3">
                  <RatingDisplay rating={project.project_success_rating} label="Project Success" />
                  <RatingDisplay rating={project.quality_rating} label="Quality" />
                  <RatingDisplay rating={project.communication_rating} label="Communication" />
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recommendation</h3>
              <div className="flex items-center gap-2">
                {project.recommend_again ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : project.recommend_again === false ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">
                  {project.recommend_again === true
                    ? 'Would recommend again'
                    : project.recommend_again === false
                      ? 'Would not recommend again'
                      : 'No recommendation given'}
                </span>
              </div>
            </div>

            {/* [R-QW1] Timeline Status */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline Status
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTimelineStatusChange('Early')}
                    disabled={isReadOnly}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      timelineStatus === 'Early'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    Early
                  </button>
                  <button
                    onClick={() => handleTimelineStatusChange('On-Time')}
                    disabled={isReadOnly}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      timelineStatus === 'On-Time'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    On-Time
                  </button>
                  <button
                    onClick={() => handleTimelineStatusChange('Late')}
                    disabled={isReadOnly}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      timelineStatus === 'Late'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    Late
                  </button>
                </div>
                {hasChanges && !isReadOnly && (
                  <Button
                    onClick={handleSaveTimelineStatus}
                    className="w-full"
                    size="sm"
                  >
                    Save Timeline Status
                  </Button>
                )}
                {!timelineStatus && !isReadOnly && (
                  <p className="text-xs text-gray-500 text-center">
                    Select a timeline status for this project
                  </p>
                )}
              </div>
            </div>

            {/* Project Timestamps */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Project History</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                This completed project is protected from editing
              </span>
            ) : (
              <span>This project can be edited</span>
            )}
          </div>

          <div className="flex gap-3">
            {!isReadOnly && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                    onDelete(project.project_id)
                  }
                }}
              >
                Delete Project
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>

            {!isReadOnly && onSave && (
              <Button onClick={() => onSave({})}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
