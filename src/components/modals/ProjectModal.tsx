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
  CheckCircle
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {project.project_title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{project.project_title}</DialogTitle>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {project.project_type && (
                  <Badge variant="outline">
                    {project.project_type}
                  </Badge>
                )}
              </div>
              {project.project_description && (
                <DialogDescription className="text-base">
                  {project.project_description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Project Information */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Project Details
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Title:</span>
                <div className="text-gray-900 mt-1">{project.project_title}</div>
              </div>
              {project.project_type && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Type:</span>
                  <div className="text-gray-900 mt-1">{project.project_type}</div>
                </div>
              )}
              {project.project_description && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Description:</span>
                  <div className="text-gray-900 mt-1">{project.project_description}</div>
                </div>
              )}
              {project.vendors?.vendor_name && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Vendor:</span>
                  <div className="text-gray-900 mt-1">{project.vendors.vendor_name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Information */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Timeline
            </h3>
            <div className="space-y-3">
              {project.contact_date && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Contact Date:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(project.contact_date).toLocaleDateString()}
                  </div>
                </div>
              )}
              {project.expected_deadline && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Expected Deadline:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(project.expected_deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
              {project.updated_at && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Last Updated:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Overview */}
          <div className="p-6 bg-white rounded-lg border shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Project Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{project.status}</div>
                <div className="text-sm text-gray-600">Current Status</div>
              </div>
              {project.project_type && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{project.project_type}</div>
                  <div className="text-sm text-gray-600">Project Type</div>
                </div>
              )}
              {project.contact_date && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor((new Date().getTime() - new Date(project.contact_date).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Since Contact</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ID: {project.project_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Contact: {project.contact_date ? new Date(project.contact_date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Updated: {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            {project.expected_deadline && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>Deadline: {new Date(project.expected_deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
