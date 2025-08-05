'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: Partial<Project>) => void
  onDelete: (projectId: string) => void
}

export default function ProjectModal({ project, isOpen, onClose, onSave, onDelete }: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({})

  useEffect(() => {
    if (project) {
      setFormData(project)
    }
  }, [project])

  if (!isOpen || !project) {
    return null
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.project_title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 p-4">
          {/* Project Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Project Details</h3>
            <div className="space-y-2">
              <Label htmlFor="project_title">Project Title</Label>
              <Input id="project_title" value={formData.project_title || ''} onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input id="client_name" value={formData.client_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input id="vendor_name" value={formData.vendor_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={formData.status || ''} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating_status">Rating Status</Label>
              <select
                id="rating_status"
                value={formData.rating_status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rating_status: e.target.value as 'Needs Review' | 'Incomplete' | 'Complete' | null }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Status</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Ratings</h3>
            <div className="space-y-2">
              <Label htmlFor="project_success_rating">Success Rating</Label>
              <Input id="project_success_rating" type="number" value={formData.project_success_rating || ''} onChange={(e) => setFormData(prev => ({ ...prev, project_success_rating: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality_rating">Quality Rating</Label>
              <Input id="quality_rating" type="number" value={formData.quality_rating || ''} onChange={(e) => setFormData(prev => ({ ...prev, quality_rating: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communication_rating">Communication Rating</Label>
              <Input id="communication_rating" type="number" value={formData.communication_rating || ''} onChange={(e) => setFormData(prev => ({ ...prev, communication_rating: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_overall_rating_input">Overall Rating (Input)</Label>
              <Input id="project_overall_rating_input" type="number" value={formData.project_overall_rating_input || ''} onChange={(e) => setFormData(prev => ({ ...prev, project_overall_rating_input: parseFloat(e.target.value) || null }))} />
            </div>
          </div>

          {/* Feedback Section */}
          <div className="col-span-2 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Feedback</h3>
            <div className="space-y-2">
              <Label htmlFor="what_went_well">What Went Well</Label>
              <Textarea id="what_went_well" value={formData.what_went_well || ''} onChange={(e) => setFormData(prev => ({ ...prev, what_went_well: e.target.value }))} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
              <Textarea id="areas_for_improvement" value={formData.areas_for_improvement || ''} onChange={(e) => setFormData(prev => ({ ...prev, areas_for_improvement: e.target.value }))} rows={4} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-between items-center pt-4 border-t">
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
