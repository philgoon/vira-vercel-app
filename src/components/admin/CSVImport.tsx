'use client'

// [EPIC-002 M4] Migrated from shadcn + Tailwind to STM inline styles
import { useState } from 'react'
import { CheckCircle, Upload, Eye, FileCheck } from 'lucide-react'

type WizardStep = 'upload' | 'preview' | 'confirm' | 'complete'

const rowStatusStyle = (item: any) => {
  const color = item.is_duplicate
    ? 'var(--stm-warning)'
    : item.vendor_found
    ? 'var(--stm-success)'
    : 'var(--stm-error)'
  return {
    padding: 'var(--stm-space-3)',
    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
    borderRadius: 'var(--stm-radius-sm)',
    fontSize: 'var(--stm-text-sm)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--stm-space-3)',
    opacity: !item.vendor_found || item.is_duplicate ? 0.7 : 1,
  }
}

const importedStyle = (status: string) => {
  const map: Record<string, string> = { imported: 'var(--stm-success)', skipped: 'var(--stm-warning)', error: 'var(--stm-error)' }
  const color = map[status] || 'var(--stm-muted-foreground)'
  return {
    padding: 'var(--stm-space-3)',
    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
    borderRadius: 'var(--stm-radius-sm)',
    fontSize: 'var(--stm-text-sm)',
  }
}

const steps = [
  { id: 'upload',   label: 'Upload CSV',      icon: Upload },
  { id: 'preview',  label: 'Preview Data',    icon: Eye },
  { id: 'confirm',  label: 'Confirm Import',  icon: FileCheck },
  { id: 'complete', label: 'Complete',        icon: CheckCircle },
]

export default function CSVImport() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set())

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setPreview(null)
      setResult(null)
      setSelectedProjects(new Set())
      setCurrentStep('upload')
    }
  }

  const toggleProject = (index: number) => {
    const next = new Set(selectedProjects)
    next.has(index) ? next.delete(index) : next.add(index)
    setSelectedProjects(next)
  }

  const selectAll = () => {
    if (!preview?.preview_data) return
    const valid = preview.preview_data
      .map((item: any, idx: number) => ({ item, idx }))
      .filter(({ item }: any) => item.vendor_found && !item.is_duplicate)
      .map(({ idx }: any) => idx)
    setSelectedProjects(new Set(valid))
  }

  const deselectAll = () => setSelectedProjects(new Set())

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('confirm', 'false')
    const response = await fetch('/api/admin/import-csv', { method: 'POST', body: formData })
    const data = await response.json()
    setPreview(data)
    if (data.preview_data) {
      const valid = data.preview_data
        .map((item: any, idx: number) => ({ item, idx }))
        .filter(({ item }: any) => item.vendor_found && !item.is_duplicate)
        .map(({ idx }: any) => idx)
      setSelectedProjects(new Set(valid))
    }
    setCurrentStep('preview')
    setLoading(false)
  }

  const handleConfirmImport = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('confirm', 'true')
    formData.append('selectedIndices', JSON.stringify(Array.from(selectedProjects)))
    const response = await fetch('/api/admin/import-csv', { method: 'POST', body: formData })
    const data = await response.json()
    setResult(data)
    setCurrentStep('complete')
    setLoading(false)
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setCurrentStep('upload')
    setSelectedProjects(new Set())
  }

  const stepIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div style={{
      backgroundColor: 'var(--stm-card)',
      border: '1px solid var(--stm-border)',
      borderRadius: 'var(--stm-radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: 'var(--stm-space-5) var(--stm-space-6)', borderBottom: '1px solid var(--stm-border)' }}>
        <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: '0 0 var(--stm-space-5)' }}>
          Import Projects from CSV
        </h3>

        {/* Step Progress */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = stepIndex > idx
            const color = isCompleted ? 'var(--stm-secondary)' : isActive ? 'var(--stm-primary)' : 'var(--stm-border)'
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : '0 0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '72px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--stm-radius-full)',
                    backgroundColor: isCompleted || isActive ? color : 'var(--stm-muted)',
                    border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <StepIcon style={{ width: '18px', height: '18px', color: isCompleted || isActive ? 'white' : 'var(--stm-muted-foreground)' }} />
                  </div>
                  <span style={{ fontSize: 'var(--stm-text-xs)', marginTop: 'var(--stm-space-1)', textAlign: 'center', color: isActive ? 'var(--stm-foreground)' : 'var(--stm-muted-foreground)', fontWeight: isActive ? 'var(--stm-font-semibold)' : 'var(--stm-font-normal)' }}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', backgroundColor: isCompleted ? 'var(--stm-secondary)' : 'var(--stm-border)', margin: '0 var(--stm-space-2)', marginBottom: 'var(--stm-space-5)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--stm-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', margin: 0 }}>
                Upload a CSV file with columns: <strong>Ticket Assignee</strong>, <strong>Ticket Title</strong>, <strong>Ticket Company Name</strong>, <strong>Ticket Created Date</strong>, <strong>Ticket Submitted By</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)' }}>
                {[
                  'Vendors will be matched automatically by Ticket Assignee',
                  'Reviewers will be auto-assigned if Ticket Submitted By matches a user name',
                  'Unmatched projects can be manually assigned in the Reviews tab',
                ].map((text, i) => (
                  <p key={i} style={{ fontSize: 'var(--stm-text-xs)', color: i < 2 ? 'var(--stm-muted-foreground)' : 'var(--stm-muted-foreground)', margin: 0 }}>
                    {i < 2 ? '✓' : '→'} {text}
                  </p>
                ))}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', marginTop: 'var(--stm-space-2)' }}
              />
            </div>
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              style={{ alignSelf: 'flex-start', padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer', opacity: !file || loading ? 0.5 : 1 }}
            >
              {loading ? 'Analyzing...' : 'Next: Preview Data'}
            </button>
          </>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && preview?.preview && (
          <>
            <div style={{
              padding: 'var(--stm-space-4)',
              backgroundColor: `color-mix(in srgb, var(--stm-primary) 5%, transparent)`,
              border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
              borderRadius: 'var(--stm-radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--stm-space-3)' }}>
                <div>
                  <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', margin: 0 }}>Import Preview</p>
                  <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-primary)', margin: 0 }}>
                    Found <strong>{preview.total_records}</strong> projects. Selected: <strong>{selectedProjects.size}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
                  <button onClick={selectAll} style={{ padding: 'var(--stm-space-1) var(--stm-space-3)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)', background: 'var(--stm-card)', fontSize: 'var(--stm-text-xs)', cursor: 'pointer', color: 'var(--stm-foreground)' }}>
                    Select All Valid
                  </button>
                  <button onClick={deselectAll} style={{ padding: 'var(--stm-space-1) var(--stm-space-3)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-sm)', background: 'var(--stm-card)', fontSize: 'var(--stm-text-xs)', cursor: 'pointer', color: 'var(--stm-foreground)' }}>
                    Deselect All
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: '384px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
                {preview.preview_data.map((item: any, idx: number) => (
                  <div key={idx} style={rowStatusStyle(item)}>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(idx)}
                      disabled={!item.vendor_found || item.is_duplicate}
                      onChange={() => toggleProject(idx)}
                      style={{ marginTop: '2px', width: '14px', height: '14px', cursor: !item.vendor_found || item.is_duplicate ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>{item.title}</p>
                      <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-1)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>Company: {item.company}</span>
                        <span>Vendor: {item.vendor_name} {item.vendor_found ? '✓ Found' : '❌ NOT FOUND'}</span>
                        {item.is_duplicate && <span style={{ color: 'var(--stm-warning)', fontWeight: 'var(--stm-font-semibold)' }}>⚠ DUPLICATE – Will be skipped</span>}
                        {item.has_description && !item.is_duplicate && <span style={{ color: 'var(--stm-primary)' }}>Has description (AI summary will be generated)</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(preview.preview_data.some((i: any) => !i.vendor_found) || preview.preview_data.some((i: any) => i.is_duplicate)) && (
              <div style={{ padding: 'var(--stm-space-4)', backgroundColor: `color-mix(in srgb, var(--stm-warning) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--stm-warning) 25%, transparent)`, borderRadius: 'var(--stm-radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
                {preview.preview_data.some((i: any) => !i.vendor_found) && (
                  <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-warning)', margin: 0 }}>
                    ⚠ <strong>Unknown Vendors:</strong> Some vendors were not found. Those projects will be skipped.
                  </p>
                )}
                {preview.preview_data.some((i: any) => i.is_duplicate) && (
                  <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-warning)', margin: 0 }}>
                    ⚠ <strong>Duplicates:</strong> {preview.preview_data.filter((i: any) => i.is_duplicate).length} project(s) already exist. They will be skipped.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
              <button
                onClick={() => setCurrentStep('confirm')}
                disabled={selectedProjects.size === 0}
                style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer', opacity: selectedProjects.size === 0 ? 0.5 : 1 }}
              >
                Next: Confirm Import ({selectedProjects.size} selected)
              </button>
              <button onClick={handleReset} style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', cursor: 'pointer' }}>
                Start Over
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 'confirm' && (
          <>
            <div style={{ padding: 'var(--stm-space-4)', backgroundColor: `color-mix(in srgb, var(--stm-warning) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--stm-warning) 30%, transparent)`, borderRadius: 'var(--stm-radius-md)' }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-warning)', marginBottom: 'var(--stm-space-2)' }}>
                ⚠ Final Confirmation
              </p>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-3)' }}>
                You are about to import <strong>{selectedProjects.size}</strong> selected projects into the database.
              </p>
              <ul style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', paddingLeft: 'var(--stm-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)' }}>
                {[
                  'Vendors will be automatically matched by name',
                  'Reviewers will be auto-assigned if "Submitted By" name matches a user',
                  'AI summaries will be generated for all descriptions',
                  'Unmatched projects will need manual reviewer assignment',
                  'This action cannot be undone',
                ].map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
              <button
                onClick={handleConfirmImport}
                disabled={loading}
                style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-success)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Importing...' : 'Confirm & Import'}
              </button>
              <button onClick={() => setCurrentStep('preview')} disabled={loading} style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                Back
              </button>
              <button onClick={handleReset} disabled={loading} style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
            {result.success ? (
              <>
                <div style={{ padding: 'var(--stm-space-4)', backgroundColor: `color-mix(in srgb, var(--stm-success) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--stm-success) 25%, transparent)`, borderRadius: 'var(--stm-radius-md)' }}>
                  <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-success)', marginBottom: 'var(--stm-space-2)' }}>Import Successful!</p>
                  <ul style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', paddingLeft: 'var(--stm-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)' }}>
                    <li>✅ Imported: {result.imported} projects</li>
                    {result.reviewers_auto_assigned > 0 && <li>Reviewers Auto-Assigned: {result.reviewers_auto_assigned}</li>}
                    {result.ai_summaries_generated > 0 && <li>AI Summaries Generated: {result.ai_summaries_generated}</li>}
                    {result.skipped_duplicates > 0 && <li style={{ color: 'var(--stm-warning)' }}>Skipped Duplicates: {result.skipped_duplicates}</li>}
                    {result.skipped_unknown_vendors > 0 && <li style={{ color: 'var(--stm-warning)' }}>Unknown Vendors: {result.skipped_unknown_vendors}</li>}
                  </ul>
                  {result.note && <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-3)', fontStyle: 'italic' }}>{result.note}</p>}
                </div>

                {result.available_reviewers?.length > 0 && (
                  <div style={{ padding: 'var(--stm-space-4)', backgroundColor: `color-mix(in srgb, var(--stm-primary) 5%, transparent)`, border: `1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)`, borderRadius: 'var(--stm-radius-md)' }}>
                    <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', marginBottom: 'var(--stm-space-2)' }}>Active Reviewers ({result.available_reviewers.length})</p>
                    <ul style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', paddingLeft: 'var(--stm-space-4)' }}>
                      {result.available_reviewers.map((r: any, i: number) => <li key={i}>{r.name || r.email}</li>)}
                    </ul>
                  </div>
                )}

                {result.project_details?.length > 0 && (
                  <div style={{ padding: 'var(--stm-space-4)', backgroundColor: 'var(--stm-muted)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)' }}>
                    <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-3)' }}>Project Details</p>
                    <div style={{ maxHeight: '384px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
                      {result.project_details.map((project: any, idx: number) => (
                        <div key={idx} style={importedStyle(project.status)}>
                          <p style={{ fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>{project.title}</p>
                          <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>Company: {project.company}</span>
                            <span>Vendor: {project.vendor_name} {project.vendor_matched && '✓'}</span>
                            {project.status === 'imported' && (
                              <>
                                <span style={{ color: project.reviewer_assigned ? 'var(--stm-success)' : 'var(--stm-warning)' }}>
                                  {project.reviewer_assigned ? `✓ Reviewer: ${project.reviewer_name}` : '⚠ No reviewer assigned'}
                                </span>
                                {project.ai_summary_generated && <span style={{ color: 'var(--stm-primary)' }}>AI Summary Generated</span>}
                                {project.note && <span style={{ fontStyle: 'italic' }}>{project.note}</span>}
                              </>
                            )}
                            {project.status === 'skipped' && <span style={{ color: 'var(--stm-warning)' }}>⚠ {project.reason}</span>}
                            {project.status === 'error' && <span style={{ color: 'var(--stm-error)' }}>❌ {project.reason}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleReset} style={{ padding: 'var(--stm-space-3)', backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', cursor: 'pointer' }}>
                  Import Another CSV
                </button>
              </>
            ) : (
              <>
                <div style={{ padding: 'var(--stm-space-4)', backgroundColor: `color-mix(in srgb, var(--stm-error) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--stm-error) 25%, transparent)`, borderRadius: 'var(--stm-radius-md)' }}>
                  <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-error)', marginBottom: 'var(--stm-space-2)' }}>Import Failed</p>
                  <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)' }}>{result.error || 'Unknown error'}</p>
                  {result.warning && <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-warning)', marginTop: 'var(--stm-space-2)' }}>⚠ {result.warning}</p>}
                </div>
                <button onClick={handleReset} style={{ alignSelf: 'flex-start', padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', fontSize: 'var(--stm-text-sm)', cursor: 'pointer' }}>
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
