'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Project, UserProfile } from '@/types'
import { UserPlus, X, CheckCircle } from 'lucide-react'

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

const STATUS_COLOR: Record<string, string> = {
  completed:   'var(--stm-success)',
  overdue:     'var(--stm-error)',
  in_progress: 'var(--stm-primary)',
}

const assignmentBadge = (status: string) => {
  const color = STATUS_COLOR[status] || 'var(--stm-muted-foreground)'
  return {
    padding: '2px 8px',
    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    color,
    borderRadius: 'var(--stm-radius-full)',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.04em',
  }
}

export default function ReviewAssignment() {
  const [projects, setProjects] = useState<Project[]>([])
  const [reviewers, setReviewers] = useState<UserProfile[]>([])
  const [assignments, setAssignments] = useState<Record<string, ReviewAssignment[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<string>('')
  const { user: clerkUser } = useUser()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const projectsRes = await fetch('/api/admin/table-data?table=projects')
      const projectsData = await projectsRes.json()
      const allProjects = (projectsData.data || []).filter((p: Project) =>
        !p.project_success_rating || !p.quality_rating || !p.communication_rating
      )

      const reviewersRes = await fetch('/api/admin/table-data?table=user_profiles')
      const reviewersData = await reviewersRes.json()
      const allReviewers = (reviewersData.data || []).filter(
        (u: UserProfile) => ['admin', 'team'].includes(u.role) && u.is_active
      )

      setProjects(allProjects)
      setReviewers(allReviewers)

      if (allProjects.length > 0) {
        const ids = allProjects.map((p: Project) => p.project_id).join(',')
        const assignRes = await fetch(`/api/admin/assign-reviewer?project_ids=${ids}`)
        const assignData = await assignRes.json()
        setAssignments(assignData.assignments_by_project || {})
      } else {
        setAssignments({})
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignReviewer = async (projectId: string) => {
    if (!selectedReviewer) return
    try {
      const response = await fetch('/api/admin/assign-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, reviewer_id: selectedReviewer, assigned_by: clerkUser?.id || null }),
      })
      if (response.ok) {
        await loadData()
        setSelectedProject(null)
        setSelectedReviewer('')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to assign reviewer')
      }
    } catch {
      alert('Failed to assign reviewer')
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Remove this reviewer assignment?')) return
    try {
      const response = await fetch(`/api/admin/assign-reviewer?assignment_id=${assignmentId}`, { method: 'DELETE' })
      if (response.ok) await loadData()
      else alert('Failed to remove assignment')
    } catch {
      alert('Failed to remove assignment')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--stm-space-12)' }}>
        <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center' }}>
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
        </div>
      </div>
    )
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aHas = (assignments[a.project_id]?.length || 0) > 0
    const bHas = (assignments[b.project_id]?.length || 0) > 0
    return aHas === bHas ? 0 : aHas ? 1 : -1
  })

  if (sortedProjects.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--stm-card)',
        border: '1px solid var(--stm-border)',
        borderRadius: 'var(--stm-radius-lg)',
        padding: 'var(--stm-space-8)',
        textAlign: 'center',
      }}>
        <CheckCircle style={{ width: '32px', height: '32px', color: 'var(--stm-success)', margin: '0 auto var(--stm-space-3)' }} />
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--stm-success)', marginBottom: '4px' }}>All projects reviewed</div>
        <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)' }}>No pending assignments.</div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--stm-card)',
      border: '1px solid var(--stm-border)',
      borderRadius: 'var(--stm-radius-lg)',
      overflow: 'hidden',
    }}>
      {sortedProjects.map((project, i) => {
        const projectAssignments = assignments[project.project_id] || []
        const hasReviewer = projectAssignments.length > 0
        const isAssigning = selectedProject === project.project_id
        const isLast = i === sortedProjects.length - 1

        return (
          <div
            key={project.project_id}
            style={{
              padding: '14px 18px',
              borderBottom: isLast ? 'none' : '1px solid var(--stm-border)',
              backgroundColor: !hasReviewer
                ? 'color-mix(in srgb, var(--stm-warning) 4%, var(--stm-card))'
                : 'var(--stm-card)',
            }}
          >
            {/* Project row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--stm-space-3)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--stm-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {project.project_title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '2px' }}>
                  {project.client_name} · {project.vendor_name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', flexShrink: 0 }}>
                {!hasReviewer && (
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: 'color-mix(in srgb, var(--stm-warning) 12%, transparent)',
                    color: 'var(--stm-warning)',
                    borderRadius: 'var(--stm-radius-full)',
                    fontSize: '10px',
                    fontWeight: '600',
                    letterSpacing: '0.04em',
                  }}>
                    Unassigned
                  </span>
                )}
                {!isAssigning && (
                  <button
                    onClick={() => setSelectedProject(project.project_id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 10px',
                      backgroundColor: 'var(--stm-background)',
                      border: '1px solid var(--stm-border)',
                      borderRadius: 'var(--stm-radius-sm)',
                      fontSize: '11px', fontWeight: '600',
                      color: 'var(--stm-foreground)',
                      cursor: 'pointer',
                      fontFamily: 'var(--stm-font-body)',
                    }}
                  >
                    <UserPlus style={{ width: '11px', height: '11px' }} />
                    {hasReviewer ? 'Add' : 'Assign'}
                  </button>
                )}
              </div>
            </div>

            {/* Assigned reviewer pills */}
            {projectAssignments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {projectAssignments.map(assignment => (
                  <div
                    key={assignment.assignment_id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px',
                      backgroundColor: 'color-mix(in srgb, var(--stm-success) 8%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--stm-success) 20%, transparent)',
                      borderRadius: 'var(--stm-radius-full)',
                    }}
                  >
                    <CheckCircle style={{ width: '11px', height: '11px', color: 'var(--stm-success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--stm-foreground)' }}>
                      {assignment.user_profiles.full_name || assignment.user_profiles.email}
                    </span>
                    <span style={assignmentBadge(assignment.status)}>{assignment.status}</span>
                    <button
                      onClick={() => handleRemoveAssignment(assignment.assignment_id)}
                      style={{ padding: '1px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stm-muted-foreground)', display: 'flex', lineHeight: 1 }}
                    >
                      <X style={{ width: '11px', height: '11px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Assign form */}
            {isAssigning && (
              <div style={{ display: 'flex', gap: 'var(--stm-space-2)', marginTop: '10px' }}>
                <select
                  value={selectedReviewer}
                  onChange={e => setSelectedReviewer(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px var(--stm-space-3)',
                    border: '1px solid var(--stm-border)',
                    borderRadius: 'var(--stm-radius-sm)',
                    fontSize: 'var(--stm-text-xs)',
                    color: 'var(--stm-foreground)',
                    backgroundColor: 'var(--stm-card)',
                    fontFamily: 'var(--stm-font-body)',
                  }}
                >
                  <option value="">Select a reviewer...</option>
                  {reviewers.map(reviewer => (
                    <option key={reviewer.user_id} value={reviewer.user_id}>
                      {reviewer.full_name || reviewer.email} ({reviewer.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignReviewer(project.project_id)}
                  disabled={!selectedReviewer}
                  style={{
                    padding: '6px var(--stm-space-3)',
                    backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none',
                    borderRadius: 'var(--stm-radius-sm)', fontSize: 'var(--stm-text-xs)',
                    fontWeight: 'var(--stm-font-medium)', cursor: 'pointer',
                    opacity: selectedReviewer ? 1 : 0.5,
                    fontFamily: 'var(--stm-font-body)',
                  }}
                >
                  Assign
                </button>
                <button
                  onClick={() => { setSelectedProject(null); setSelectedReviewer('') }}
                  style={{
                    padding: '6px var(--stm-space-3)',
                    backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)',
                    border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)',
                    fontSize: 'var(--stm-text-xs)', cursor: 'pointer',
                    fontFamily: 'var(--stm-font-body)',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
