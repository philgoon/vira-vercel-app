'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Upload, Eye, FileCheck } from 'lucide-react'

type WizardStep = 'upload' | 'preview' | 'confirm' | 'complete'

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

  // Toggle project selection
  const toggleProject = (index: number) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedProjects(newSelected)
  }

  // Select all projects (only valid ones)
  const selectAll = () => {
    if (!preview?.preview_data) return
    const validIndices = preview.preview_data
      .map((item: any, idx: number) => ({ item, idx }))
      .filter(({ item }: any) => item.vendor_found && !item.is_duplicate)
      .map(({ idx }: any) => idx)
    setSelectedProjects(new Set(validIndices))
  }

  // Deselect all
  const deselectAll = () => {
    setSelectedProjects(new Set())
  }

  // Step 2: Preview
  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('confirm', 'false')

    const response = await fetch('/api/admin/import-csv', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setPreview(data)
    
    // Auto-select all valid projects (vendor found, not duplicate)
    if (data.preview_data) {
      const validIndices = data.preview_data
        .map((item: any, idx: number) => ({ item, idx }))
        .filter(({ item }: any) => item.vendor_found && !item.is_duplicate)
        .map(({ idx }: any) => idx)
      setSelectedProjects(new Set(validIndices))
    }
    
    setCurrentStep('preview')
    setLoading(false)
  }

  // Step 3: Move to confirmation
  const handleMoveToConfirm = () => {
    setCurrentStep('confirm')
  }

  // Step 4: Confirm and Import
  const handleConfirmImport = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('confirm', 'true')
    formData.append('selectedIndices', JSON.stringify(Array.from(selectedProjects)))

    const response = await fetch('/api/admin/import-csv', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setResult(data)
    setCurrentStep('complete')
    setLoading(false)
  }

  // Reset wizard
  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setCurrentStep('upload')
  }

  const steps = [
    { id: 'upload', label: 'Upload CSV', icon: Upload },
    { id: 'preview', label: 'Preview Data', icon: Eye },
    { id: 'confirm', label: 'Confirm Import', icon: FileCheck },
    { id: 'complete', label: 'Complete', icon: CheckCircle }
  ]

  const getStepIndex = () => steps.findIndex(s => s.id === currentStep)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Projects from CSV</CardTitle>
        {/* Wizard Progress */}
        <div className="flex items-center mt-6" style={{ justifyContent: 'space-between' }}>
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = getStepIndex() > idx
            return (
              <div key={step.id} className="flex items-center" style={{ flex: idx < steps.length - 1 ? 1 : '0 0 auto' }}>
                <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                  <div className="rounded-full flex items-center justify-center border-2" style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: isCompleted ? '#6B8F71' : isActive ? '#1A5276' : '#f3f4f6',
                    borderColor: isCompleted ? '#6B8F71' : isActive ? '#1A5276' : '#e5e7eb',
                    color: isCompleted || isActive ? 'white' : '#6E6F71'
                  }}>
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs mt-2 text-center ${isActive ? 'font-semibold' : ''}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="h-0.5" style={{
                    flex: 1,
                    backgroundColor: isCompleted ? '#6B8F71' : '#e5e7eb',
                    minWidth: '30px',
                    marginLeft: '0.5rem',
                    marginRight: '0.5rem'
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 mb-2">
                Upload a CSV file with columns: <strong>Ticket Assignee</strong>, <strong>Ticket Title</strong>,
                <strong>Ticket Company Name</strong>, <strong>Ticket Created Date</strong>, <strong>Ticket Submitted By</strong>.
              </p>
              <p className="text-xs text-gray-500 space-y-1">
                <span className="block">✓ Vendors will be matched automatically by <strong>Ticket Assignee</strong></span>
                <span className="block">✓ Reviewers will be auto-assigned if <strong>Ticket Submitted By</strong> matches a user name</span>
                <span className="block text-gray-400">→ Unmatched projects can be manually assigned in the Reviews tab</span>
              </p>
              <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm" />
            </div>
            <Button onClick={handlePreview} disabled={!file || loading}>
              {loading ? 'Analyzing...' : 'Next: Preview Data'}
            </Button>
          </>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && preview && preview.preview && (
          <>
            <div className="p-4 border rounded" style={{ backgroundColor: '#E8F4F8', borderColor: '#1A5276' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ color: '#1A5276' }}>📋 Import Preview</h3>
                  <p className="text-sm" style={{ color: '#1A5276' }}>
                    Found <strong>{preview.total_records}</strong> projects. Selected: <strong>{selectedProjects.size}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={selectAll} size="sm" variant="outline">
                    Select All Valid
                  </Button>
                  <Button onClick={deselectAll} size="sm" variant="outline">
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {preview.preview_data.map((item: any, idx: number) => {
                  const isValid = item.vendor_found && !item.is_duplicate
                  const isSelected = selectedProjects.has(idx)
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded text-sm flex items-start gap-3 ${
                        item.is_duplicate ? 'bg-yellow-100 border border-yellow-300' :
                        item.vendor_found ? 'bg-green-100 border border-green-300' : 
                        'bg-red-100 border border-red-300'
                      } ${!isValid ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox */}
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isValid}
                        onChange={() => toggleProject(idx)}
                        className="mt-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs mt-1 space-y-1">
                          <div>Company: {item.company}</div>
                          <div>
                            Vendor: {item.vendor_name} {item.vendor_found ? '✓ Found' : '❌ NOT FOUND'}
                          </div>
                          {item.is_duplicate && (
                            <div className="text-orange-700 font-semibold">⚠️ DUPLICATE - Will be skipped</div>
                          )}
                          {item.has_description && !item.is_duplicate && (
                            <div className="text-blue-700">📝 Has description (AI summary will be generated)</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {(preview.preview_data.some((item: any) => !item.vendor_found) || 
              preview.preview_data.some((item: any) => item.is_duplicate)) && (
              <div className="p-4 border rounded space-y-2" style={{ backgroundColor: '#fffbeb', borderColor: '#F59E0B' }}>
                {preview.preview_data.some((item: any) => !item.vendor_found) && (
                  <p className="text-sm" style={{ color: '#92400e' }}>
                    ⚠️ <strong>Unknown Vendors:</strong> Some vendors were not found in the system. Those projects will be skipped.
                  </p>
                )}
                {preview.preview_data.some((item: any) => item.is_duplicate) && (
                  <p className="text-sm" style={{ color: '#92400e' }}>
                    ⚠️ <strong>Duplicates:</strong> {preview.preview_data.filter((item: any) => item.is_duplicate).length} project(s) already exist with the same title, client, and date. They will be skipped.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleMoveToConfirm} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={selectedProjects.size === 0}
              >
                Next: Confirm Import ({selectedProjects.size} selected)
              </Button>
              <Button onClick={handleReset} variant="outline">
                Start Over
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 'confirm' && (
          <>
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Final Confirmation</h3>
              <p className="text-sm text-yellow-700 mb-3">
                You are about to import <strong>{selectedProjects.size}</strong> selected projects into the database.
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                <li>Vendors will be automatically matched by name</li>
                <li>Reviewers will be auto-assigned if "Submitted By" name matches a user</li>
                <li>AI summaries will be generated for all descriptions</li>
                <li>Unmatched projects will need manual reviewer assignment</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmImport} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? 'Importing...' : 'Confirm & Import'}
              </Button>
              <Button onClick={() => setCurrentStep('preview')} variant="outline" disabled={loading}>
                Back to Preview
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={loading}>
                Cancel
              </Button>
            </div>
          </>
        )}
        {/* Step 4: Complete */}
        {currentStep === 'complete' && result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">Import Successful!</h3>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>✅ Imported: {result.imported} projects</li>
                    {result.reviewers_auto_assigned > 0 && (
                      <li>👤 Reviewers Auto-Assigned: {result.reviewers_auto_assigned} (matched by name)</li>
                    )}
                    {result.ai_summaries_generated > 0 && (
                      <li>🤖 AI Summaries Generated: {result.ai_summaries_generated}</li>
                    )}
                    {result.skipped_duplicates > 0 && (
                      <li>⚠️ Skipped Duplicates: {result.skipped_duplicates}</li>
                    )}
                    {result.skipped_unknown_vendors > 0 && (
                      <li>⚠️ Unknown Vendors: {result.skipped_unknown_vendors}</li>
                    )}
                  </ul>
                  {result.note && (
                    <p className="text-sm text-gray-700 mt-3 italic">{result.note}</p>
                  )}
                </div>

                {/* Available Reviewers */}
                {result.available_reviewers && result.available_reviewers.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">👥 Active Reviewers ({result.available_reviewers.length})</h4>
                    <ul className="text-sm space-y-1 text-blue-700">
                      {result.available_reviewers.map((reviewer: any, idx: number) => (
                        <li key={idx}>• {reviewer.name || reviewer.email}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Project Results */}
                {result.project_details && result.project_details.length > 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Project Details</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {result.project_details.map((project: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded text-sm ${
                          project.status === 'imported' ? 'bg-green-100 border border-green-300' :
                          project.status === 'skipped' ? 'bg-yellow-100 border border-yellow-300' :
                          'bg-red-100 border border-red-300'
                        }`}>
                          <div className="font-semibold">{project.title}</div>
                          <div className="text-xs mt-1 space-y-1">
                            <div>Company: {project.company}</div>
                            <div>Vendor: {project.vendor_name} {project.vendor_matched && '✓'}</div>
                            {project.status === 'imported' && (
                              <>
                                {project.reviewer_assigned ? (
                                  <div className="text-green-700 font-medium">
                                    ✓ Reviewer: {project.reviewer_name}
                                  </div>
                                ) : (
                                  <div className="text-orange-700">
                                    ⚠️ No reviewer assigned
                                  </div>
                                )}
                                {project.ai_summary_generated && (
                                  <div className="text-blue-700">🤖 AI Summary Generated</div>
                                )}
                                {project.note && (
                                  <div className="text-xs text-gray-600 italic">{project.note}</div>
                                )}
                              </>
                            )}
                            {project.status === 'skipped' && (
                              <div className="text-orange-700">⚠️ {project.reason}</div>
                            )}
                            {project.status === 'error' && (
                              <div className="text-red-700">❌ {project.reason}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Import Another Button */}
                <Button onClick={handleReset} className="w-full">
                  Import Another CSV
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">Import Failed</h3>
                  <p className="text-sm text-red-700">{result.error || 'Unknown error'}</p>
                  {result.warning && (
                    <p className="text-sm text-orange-700 mt-2">⚠️ {result.warning}</p>
                  )}
                </div>
                <Button onClick={handleReset} variant="outline">
                  Try Again
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
