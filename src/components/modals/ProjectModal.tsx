'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { SidePanel, SidePanelTabs, SidePanelSection, SidePanelField, SidePanelFooterAction } from '@/components/layout/SidePanel'
import { Star, User, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedProject: Partial<Project>) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectModal({ project, isOpen, onClose, onSave, onDelete }: ProjectModalProps) {
  // [M1] Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'feedback' | 'context'>('overview')

  // [R-QW1] Timeline status state
  const [timelineStatus, setTimelineStatus] = useState<'Early' | 'On-Time' | 'Late' | null>(
    project?.timeline_status || null
  )
  const [hasChanges, setHasChanges] = useState(false)

  if (!isOpen || !project) return null

  // [R4] Determine if project is read-only
  const isReadOnly = project.status === 'closed'
  const overallRating = project.project_overall_rating_calc
  const hasRatings = project.project_success_rating || project.quality_rating || project.communication_rating

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleTimelineStatusChange = (newStatus: 'Early' | 'On-Time' | 'Late' | null) => {
    setTimelineStatus(newStatus)
    setHasChanges(true)
  }

  const handleSaveTimelineStatus = () => {
    if (onSave && hasChanges) {
      onSave({ timeline_status: timelineStatus })
      setHasChanges(false)
    }
  }

  // [R4] Rating row component
  const RatingRow = ({ rating, label }: { rating: number | null, label: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--stm-space-3)',
      backgroundColor: 'var(--stm-muted)',
      borderRadius: 'var(--stm-radius-md)',
    }}>
      <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
        <Star style={{ width: '16px', height: '16px', color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
        <span style={{ fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
          {rating ? `${Number(rating).toFixed(1)}/10` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  // Timeline status button helper
  const TimelineButton = ({ value, color }: { value: 'Early' | 'On-Time' | 'Late', color: string }) => (
    <button
      onClick={() => handleTimelineStatusChange(value)}
      disabled={isReadOnly}
      style={{
        flex: 1,
        padding: 'var(--stm-space-2) var(--stm-space-3)',
        borderRadius: 'var(--stm-radius-md)',
        border: `2px solid ${timelineStatus === value ? color : 'var(--stm-border)'}`,
        backgroundColor: timelineStatus === value ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--stm-background)',
        color: timelineStatus === value ? color : 'var(--stm-muted-foreground)',
        fontSize: 'var(--stm-text-sm)',
        fontWeight: 'var(--stm-font-medium)',
        cursor: isReadOnly ? 'not-allowed' : 'pointer',
        opacity: isReadOnly ? 0.5 : 1,
        transition: 'all var(--stm-duration-fast) var(--stm-ease-out)',
      }}
    >
      {value}
    </button>
  )

  // Status badge
  const statusColor = project.status === 'closed' ? 'var(--stm-success)' : 'var(--stm-primary)'

  const tabs = [
    { id: 'overview', label: 'Overview', content: renderOverviewTab() },
    { id: 'ratings', label: 'Ratings', content: renderRatingsTab() },
    { id: 'feedback', label: 'Feedback', content: renderFeedbackTab() },
    { id: 'context', label: 'Context', content: renderContextTab() },
  ]

  const panelTitle = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
      {project.project_title}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px var(--stm-space-2)',
        borderRadius: 'var(--stm-radius-full)',
        backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
        color: statusColor,
        fontSize: 'var(--stm-text-xs)',
        fontWeight: 'var(--stm-font-semibold)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {project.status?.toUpperCase() || 'UNKNOWN'}
      </span>
    </span>
  )

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={project.project_title}
      footer={
        <>
          {!isReadOnly && onDelete && (
            <SidePanelFooterAction
              onClick={() => {
                if (window.confirm('Delete this project? This cannot be undone.')) {
                  onDelete(project.project_id)
                }
              }}
              label="Delete"
            />
          )}
          <SidePanelFooterAction
            onClick={onClose}
            label={isReadOnly ? 'Close' : 'Cancel'}
            variant={isReadOnly ? 'primary' : undefined}
          />
          {!isReadOnly && onSave && (
            <SidePanelFooterAction onClick={() => onSave({})} label="Save Changes" variant="primary" />
          )}
        </>
      }
    >
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-4)' }}>
        {isReadOnly ? (
          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--stm-success)' }} />
        ) : (
          <AlertCircle style={{ width: '16px', height: '16px', color: 'var(--stm-primary)' }} />
        )}
        <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
          {isReadOnly ? 'Completed project — read only' : 'This project can be edited'}
        </span>
        <span style={{
          marginLeft: 'auto',
          padding: '2px var(--stm-space-2)',
          borderRadius: 'var(--stm-radius-full)',
          backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
          color: statusColor,
          fontSize: 'var(--stm-text-xs)',
          fontWeight: 'var(--stm-font-semibold)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
        }}>
          {project.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      <SidePanelTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'overview' | 'ratings' | 'feedback' | 'context')}
      />
    </SidePanel>
  )

  function renderOverviewTab() {
    if (!project) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <SidePanelSection title="Project Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-2)' }}>
              <User style={{ width: '16px', height: '16px', color: 'var(--stm-muted-foreground)', marginTop: '2px', flexShrink: 0 }} />
              <SidePanelField label="Client" value={project.client_name || 'Not specified'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-2)' }}>
              <User style={{ width: '16px', height: '16px', color: 'var(--stm-muted-foreground)', marginTop: '2px', flexShrink: 0 }} />
              <SidePanelField label="Vendor" value={project.vendor_name || 'Not assigned'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-2)' }}>
              <Calendar style={{ width: '16px', height: '16px', color: 'var(--stm-muted-foreground)', marginTop: '2px', flexShrink: 0 }} />
              <SidePanelField label="Rating Date" value={formatDate(project.rating_date)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-2)' }}>
              <User style={{ width: '16px', height: '16px', color: 'var(--stm-muted-foreground)', marginTop: '2px', flexShrink: 0 }} />
              <SidePanelField label="Submitted By" value={project.submitted_by || 'Not specified'} />
            </div>
          </div>
        </SidePanelSection>

        <SidePanelSection title="Overall Rating">
          <div style={{ textAlign: 'center', padding: 'var(--stm-space-4)' }}>
            <div style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)', marginBottom: 'var(--stm-space-2)' }}>
              {overallRating ? Number(overallRating).toFixed(1) : '—'}
            </div>
            <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-3)' }}>
              {overallRating ? 'out of 10' : 'Not rated'}
            </div>
            {overallRating && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--stm-space-1)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    style={{
                      width: '20px',
                      height: '20px',
                      color: 'var(--stm-warning)',
                      fill: i < Math.round(Number(overallRating) / 2) ? 'var(--stm-warning)' : 'transparent',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </SidePanelSection>

        <SidePanelSection title="Recommendation">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
            {project.recommend_again ? (
              <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--stm-success)' }} />
            ) : project.recommend_again === false ? (
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--stm-error)' }} />
            ) : (
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--stm-muted-foreground)' }} />
            )}
            <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
              {project.recommend_again === true
                ? 'Would recommend again'
                : project.recommend_again === false
                  ? 'Would not recommend again'
                  : 'No recommendation given'}
            </span>
          </div>
        </SidePanelSection>
      </div>
    )
  }

  function renderRatingsTab() {
    if (!project) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <SidePanelSection title="Overall Rating">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-4)' }}>
            <Star style={{ width: '32px', height: '32px', color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
            <span style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)' }}>
              {overallRating ? Number(overallRating).toFixed(1) : 'N/A'}
            </span>
            <span style={{ color: 'var(--stm-muted-foreground)' }}>/10</span>
          </div>
        </SidePanelSection>

        {hasRatings && (
          <SidePanelSection title="Detailed Ratings">
            <RatingRow rating={project.project_success_rating} label="Project Success" />
            <RatingRow rating={project.quality_rating} label="Quality" />
            <RatingRow rating={project.communication_rating} label="Communication" />
          </SidePanelSection>
        )}

        <SidePanelSection title="Recommendation">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
            {project.recommend_again ? (
              <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--stm-success)' }} />
            ) : project.recommend_again === false ? (
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--stm-error)' }} />
            ) : (
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--stm-muted-foreground)' }} />
            )}
            <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
              {project.recommend_again === true
                ? 'Would recommend again'
                : project.recommend_again === false
                  ? 'Would not recommend again'
                  : 'No recommendation given'}
            </span>
          </div>
        </SidePanelSection>
      </div>
    )
  }

  function renderFeedbackTab() {
    if (!project) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <SidePanelSection title="What Went Well">
          <p style={{
            color: 'var(--stm-foreground)',
            whiteSpace: 'pre-wrap',
            lineHeight: 'var(--stm-leading-relaxed)',
            borderLeft: '3px solid var(--stm-success)',
            paddingLeft: 'var(--stm-space-3)',
          }}>
            {project.what_went_well || 'No feedback provided'}
          </p>
        </SidePanelSection>

        <SidePanelSection title="Areas for Improvement">
          <p style={{
            color: 'var(--stm-foreground)',
            whiteSpace: 'pre-wrap',
            lineHeight: 'var(--stm-leading-relaxed)',
            borderLeft: '3px solid var(--stm-warning)',
            paddingLeft: 'var(--stm-space-3)',
          }}>
            {project.areas_for_improvement || 'No feedback provided'}
          </p>
        </SidePanelSection>
      </div>
    )
  }

  function renderContextTab() {
    if (!project) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <SidePanelSection title="Timeline Status">
          <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
            <TimelineButton value="Early" color="var(--stm-success)" />
            <TimelineButton value="On-Time" color="var(--stm-primary)" />
            <TimelineButton value="Late" color="var(--stm-error)" />
          </div>
          {hasChanges && !isReadOnly && (
            <button
              onClick={handleSaveTimelineStatus}
              style={{
                width: '100%',
                marginTop: 'var(--stm-space-3)',
                padding: 'var(--stm-space-2) var(--stm-space-4)',
                backgroundColor: 'var(--stm-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--stm-radius-md)',
                fontSize: 'var(--stm-text-sm)',
                fontWeight: 'var(--stm-font-medium)',
                cursor: 'pointer',
              }}
            >
              Save Timeline Status
            </button>
          )}
          {!timelineStatus && !isReadOnly && (
            <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', textAlign: 'center', marginTop: 'var(--stm-space-2)' }}>
              Select a timeline status for this project
            </p>
          )}
        </SidePanelSection>

        <SidePanelSection title="Project History">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)', fontSize: 'var(--stm-text-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--stm-muted-foreground)' }}>Created:</span>
              <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{formatDate(project.created_at)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--stm-muted-foreground)' }}>Last Updated:</span>
              <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{formatDate(project.updated_at)}</span>
            </div>
            {project.submitted_by && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--stm-muted-foreground)' }}>Submitted By:</span>
                <span style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{project.submitted_by}</span>
              </div>
            )}
          </div>
        </SidePanelSection>
      </div>
    )
  }
}
