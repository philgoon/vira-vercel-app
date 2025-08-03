'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { Project, Vendor, Client } from '@/types'

type ProjectFormInputs = {
  project_title: string
  project_description: string
  client_key: string
  assigned_vendor_id: string
  expected_deadline: string
  status: string
  project_type: string
  key_skills_required: string
}

function EditProjectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project_id')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProjectFormInputs>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [project, setProject] = useState<Project | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    async function loadData() {
      if (!projectId) {
        setError('No project ID provided')
        setLoading(false)
        return
      }

      try {
        // Load project, vendors, and clients
        const [projectRes, vendorsRes, clientsRes] = await Promise.all([
          fetch(`/api/projects?id=${projectId}`),
          fetch('/api/vendors'),
          fetch('/api/clients')
        ])

        if (!projectRes.ok) throw new Error('Failed to load project')
        if (!vendorsRes.ok) throw new Error('Failed to load vendors')
        if (!clientsRes.ok) throw new Error('Failed to load clients')

        const projectData = await projectRes.json()
        const vendorsData = await vendorsRes.json()
        const clientsData = await clientsRes.json()

        const projectInfo = projectData.projects?.[0]
        if (!projectInfo) {
          setError('Project not found')
          setLoading(false)
          return
        }

        setProject(projectInfo)
        setVendors(vendorsData.vendors || [])
        setClients(clientsData.clients || [])

        // Pre-fill form
        setValue('project_title', projectInfo.project_title || '')
        setValue('project_description', projectInfo.project_description || '')
        setValue('client_key', projectInfo.client_key || '')
        setValue('assigned_vendor_id', projectInfo.assigned_vendor_id || '')
        setValue('expected_deadline', projectInfo.expected_deadline?.split('T')[0] || '')
        setValue('status', projectInfo.status || 'active')
        setValue('project_type', projectInfo.project_type || '')
        setValue('key_skills_required', projectInfo.key_skills_required || '')

      } catch (err) {
        console.error('Load error:', err)
        setError('Failed to load project data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId, setValue])

  const onSubmit = async (data: ProjectFormInputs) => {
    setSubmitting(true)
    setError(null)

    try {
      // Map form fields to database columns
      const updateData = {
        project_id: projectId,
        project_title: data.project_title,
        project_description: data.project_description || null,
        client_id: data.client_key || null,
        assigned_vendor_id: data.assigned_vendor_id || null,
        expected_deadline: data.expected_deadline || null,
        status: data.status,
        project_type: data.project_type || null,
        key_skills_required: data.key_skills_required || null
      }

      console.log('Sending update data:', updateData)

      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const responseData = await response.json()
      console.log('Response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/projects')
      }, 1500)

    } catch (err: unknown) {
      console.error('Update error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-[#1A5276]">Edit Project</h1>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1A5276] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-[#1A5276]">Edit Project</h1>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Link
            href="/projects"
            className="inline-block mt-4 px-4 py-2 bg-[#1A5276] text-white rounded hover:bg-[#154360]"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1A5276]">Edit Project</h1>
              <p className="text-sm text-gray-600 mt-1">
                Update project details and assignments
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <Save className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Project Updated Successfully!
              </h3>
              <p className="text-green-700">Redirecting to projects list...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('project_title', { required: 'Project title is required' })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                    />
                    {errors.project_title && (
                      <p className="mt-1 text-sm text-red-600">{errors.project_title.message}</p>
                    )}
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description
                    </label>
                    <textarea
                      {...register('project_description')}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                      placeholder="Describe the project scope and requirements..."
                    />
                  </div>

                  {/* Client and Vendor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('client_key', { required: 'Client is required' })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.client_key} value={client.client_key}>
                            {client.client_name}
                          </option>
                        ))}
                      </select>
                      {errors.client_key && (
                        <p className="mt-1 text-sm text-red-600">{errors.client_key.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Vendor
                      </label>
                      <select
                        {...register('assigned_vendor_id')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                      >
                        <option value="">No vendor assigned</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.vendor_id} value={vendor.vendor_id}>
                            {vendor.vendor_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Deadline and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Deadline
                      </label>
                      <input
                        type="date"
                        {...register('expected_deadline')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                        <option value="on_hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Project Type and Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Type
                      </label>
                      <input
                        type="text"
                        {...register('project_type')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                        placeholder="e.g., Web Development, Content Writing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Skills Required
                      </label>
                      <input
                        type="text"
                        {...register('key_skills_required')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A5276] focus:border-transparent"
                        placeholder="e.g., React, SEO, Copywriting"
                      />
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#1A5276] hover:bg-[#154360] text-white'
                        }`}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                      href="/projects"
                      className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-center transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EditProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-[#1A5276]">Edit Project</h1>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1A5276] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EditProjectContent />
    </Suspense>
  )
}
