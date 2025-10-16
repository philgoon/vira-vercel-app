'use client'

import { useState, useEffect } from 'react'
import { Project, UserProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, X, CheckCircle, Clock } from 'lucide-react'

interface ReviewAssignment {
  assignment_id: string
  reviewer_id: string
  assigned_at: string
  status: string
  due_date: string | null
  completed_at: string | null
  user_profiles: {
    user_id: string
    email: string
    full_name: string | null
  }
}

export default function ReviewAssignment() {
  const [projects, setProjects] = useState<Project[]>([])
  const [reviewers, setReviewers] = useState<UserProfile[]>([])
  const [assignments, setAssignments] = useState<Record<string, ReviewAssignment[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load projects (only those without reviews - need ratings)
      const projectsRes = await fetch('/api/admin/table-data?table=projects')
      const projectsData = await projectsRes.json()
      const allProjects = (projectsData.data || []).filter((p: Project) => {
        // Only show projects that DON'T have a review yet
        // A project has a review if it has all three rating fields filled
        return !p.project_success_rating || !p.quality_rating || !p.communication_rating
      })

      // Load reviewers (admin + team roles)
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser()
      const reviewersRes = await fetch('/api/admin/table-data?table=user_profiles')
      const reviewersData = await reviewersRes.json()
      const allReviewers = (reviewersData.data || []).filter(
        (u: UserProfile) => ['admin', 'team'].includes(u.role) && u.is_active
      )

      setProjects(allProjects)
      setReviewers(allReviewers)

      // Load assignments for all projects
      const assignmentsMap: Record<string, ReviewAssignment[]> = {}
      for (const project of allProjects) {
        const assignRes = await fetch(`/api/admin/assign-reviewer?project_id=${project.project_id}`)
        const assignData = await assignRes.json()
        assignmentsMap[project.project_id] = assignData.assignments || []
      }
      setAssignments(assignmentsMap)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignReviewer = async (projectId: string) => {
    if (!selectedReviewer) return

    try {
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser()
      
      const response = await fetch('/api/admin/assign-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          reviewer_id: selectedReviewer,
          assigned_by: user?.id || null
        })
      })

      if (response.ok) {
        await loadData() // Reload to show updated assignments
        setSelectedProject(null)
        setSelectedReviewer('')
        alert('Reviewer assigned successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to assign reviewer')
      }
    } catch (error) {
      console.error('Error assigning reviewer:', error)
      alert('Failed to assign reviewer')
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Remove this reviewer assignment?')) return

    try {
      const response = await fetch(`/api/admin/assign-reviewer?assignment_id=${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
        alert('Reviewer assignment removed')
      } else {
        alert('Failed to remove assignment')
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Failed to remove assignment')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Sort projects: unassigned first
  const sortedProjects = [...projects].sort((a, b) => {
    const aHasReviewer = (assignments[a.project_id]?.length || 0) > 0
    const bHasReviewer = (assignments[b.project_id]?.length || 0) > 0
    if (aHasReviewer === bHasReviewer) return 0
    return aHasReviewer ? 1 : -1
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {sortedProjects.map((project) => {
          const projectAssignments = assignments[project.project_id] || []
          const hasReviewer = projectAssignments.length > 0
          const isAssigning = selectedProject === project.project_id

          return (
            <Card key={project.project_id} className={!hasReviewer ? 'border' : ''} style={!hasReviewer ? { borderColor: '#F59E0B', backgroundColor: '#fffbeb' } : {}}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.project_title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.client_name} • {project.vendor_name}
                    </p>
                  </div>
                  {!hasReviewer && (
                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{ color: '#92400e', backgroundColor: '#fef3c7' }}>
                      No Reviewer
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current Assignments */}
                {projectAssignments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Assigned Reviewers:</h4>
                    {projectAssignments.map((assignment) => (
                      <div key={assignment.assignment_id} className="flex items-center justify-between border rounded p-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{ color: '#6B8F71' }} />
                          <span className="text-sm font-medium">
                            {assignment.user_profiles.full_name || assignment.user_profiles.email}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            assignment.status === 'completed' ? 'bg-green-200 text-green-800' :
                            assignment.status === 'overdue' ? 'bg-red-200 text-red-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.assignment_id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assign Reviewer Form */}
                {isAssigning ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedReviewer}
                      onChange={(e) => setSelectedReviewer(e.target.value)}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select a reviewer...</option>
                      {reviewers.map((reviewer) => (
                        <option key={reviewer.user_id} value={reviewer.user_id}>
                          {reviewer.full_name || reviewer.email} ({reviewer.role})
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => handleAssignReviewer(project.project_id)}
                      disabled={!selectedReviewer}
                      size="sm"
                    >
                      Assign
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProject(null)
                        setSelectedReviewer('')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedProject(project.project_id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {hasReviewer ? 'Add Another Reviewer' : 'Assign Reviewer'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
