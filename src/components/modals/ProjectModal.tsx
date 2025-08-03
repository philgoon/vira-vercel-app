"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import {
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  Star,
  User,
  MessageSquare,
  TrendingUp,
  Users
} from 'lucide-react'
import { Project } from '@/types'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
      case 'in progress':
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on-hold':
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingStatusColor = (status: string | null) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800 border-green-200'
      case 'Incomplete': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Needs Review': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRating = (rating: number | null) => {
    return rating ? `${rating.toFixed(1)}/10` : 'Not rated'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {project.project_title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{project.project_title}</DialogTitle>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {project.rating_status && (
                  <Badge className={getRatingStatusColor(project.rating_status)}>
                    Rating: {project.rating_status}
                  </Badge>
                )}
                {project.project_overall_rating_calc && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                    ⭐ {formatRating(project.project_overall_rating_calc)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {project.client_name || 'No Client'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {project.vendor_name || 'No Vendor'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Project Overview */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Project Overview
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Client:</span>
                <div className="text-gray-900 mt-1 font-medium">{project.client_name || 'Not specified'}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Vendor:</span>
                <div className="text-gray-900 mt-1">{project.vendor_name || 'Not assigned'}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Status:</span>
                <div className="text-gray-900 mt-1">{project.status}</div>
              </div>
              {project.submitted_by && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Submitted By:</span>
                  <div className="text-gray-900 mt-1">{project.submitted_by}</div>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Performance */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rating & Performance
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Overall Rating:</span>
                <div className="text-gray-900 mt-1 font-semibold text-lg">
                  {formatRating(project.project_overall_rating_calc)}
                </div>
              </div>

              {(project.project_success_rating || project.quality_rating || project.communication_rating) && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Success</div>
                    <div className="font-medium">{formatRating(project.project_success_rating)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Quality</div>
                    <div className="font-medium">{formatRating(project.quality_rating)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Communication</div>
                    <div className="font-medium">{formatRating(project.communication_rating)}</div>
                  </div>
                </div>
              )}

              {project.recommend_again !== null && (
                <div className="text-sm mt-3">
                  <span className="text-gray-600 font-medium">Recommend Again:</span>
                  <div className="text-gray-900 mt-1">
                    <Badge className={project.recommend_again ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {project.recommend_again ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Dates */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Timeline & Dates
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Created:</span>
                <div className="text-gray-900 mt-1">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <div className="text-gray-900 mt-1">
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
              {project.rating_date && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Rating Date:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(project.rating_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Insights */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Feedback & Insights
            </h3>
            <div className="space-y-4">
              {project.what_went_well && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium flex items-center gap-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    What Went Well:
                  </span>
                  <div className="text-gray-900 p-3 bg-green-50 rounded border-l-4 border-green-400">
                    {project.what_went_well}
                  </div>
                </div>
              )}

              {project.areas_for_improvement && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium flex items-center gap-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Areas for Improvement:
                  </span>
                  <div className="text-gray-900 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                    {project.areas_for_improvement}
                  </div>
                </div>
              )}

              {!project.what_went_well && !project.areas_for_improvement && (
                <div className="text-sm text-gray-500 italic">
                  No feedback provided yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Administrative Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Project ID: {project.project_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Vendor ID: {project.vendor_id}</span>
            </div>
            {project.submitted_by && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>Submitted by: {project.submitted_by}</span>
              </div>
            )}
            {project.rating_status && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <span>Rating Status: {project.rating_status}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
