'use client'

import { useState, useEffect } from 'react'
import { Vendor } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Filter, Star, Info, Briefcase, TrendingUp, FolderOpen } from 'lucide-react'

interface VendorModalProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedVendor: Partial<Vendor>) => void // Optional for backward compatibility
}

// [M3] Enhanced with project/client filtering
interface ProjectRating {
  project_id: string;
  project_title: string;
  client_name: string;
  project_overall_rating_calc: number | null;
  what_went_well: string | null;
  areas_for_improvement: string | null;
}

// [R2] [vendor-detail-readonly] Converted to read-only information display for security
export default function VendorModal({ vendor, isOpen, onClose }: VendorModalProps) {
  // [M3] Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'performance' | 'projects'>('overview');
  
  // [M3] State for project ratings and filters
  const [projectRatings, setProjectRatings] = useState<ProjectRating[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [uniqueClients, setUniqueClients] = useState<string[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // [M3] Fetch project ratings when modal opens
  useEffect(() => {
    if (isOpen && vendor) {
      fetchProjectRatings();
    }
  }, [isOpen, vendor]);

  const fetchProjectRatings = async () => {
    if (!vendor) return;
    
    setLoadingRatings(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('project_id, project_title, client_name, project_overall_rating_calc, what_went_well, areas_for_improvement')
        .eq('vendor_id', vendor.vendor_id)
        .not('project_overall_rating_calc', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching project ratings:', error);
        throw error;
      }

      console.log('Fetched project ratings:', data);
      setProjectRatings(data || []);
      
      // Extract unique clients
      const clients = Array.from(new Set((data || []).map(p => p.client_name)));
      setUniqueClients(clients);
    } catch (err) {
      console.error('Error fetching project ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  // [M3] Filter projects by selected client
  const filteredProjects = selectedClient === 'all' 
    ? projectRatings 
    : projectRatings.filter(p => p.client_name === selectedClient);

  if (!isOpen || !vendor) {
    return null
  }

  // Helper function to display field values
  const displayValue = (value: string | number | null | undefined, fallback: string = 'Not specified') => {
    return value ? String(value) : fallback;
  }

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  // Helper function to display performance metrics - FIXED: Using correct database field
  const displayRating = (rating: number | null | undefined) => {
    return rating ? `${Number(rating).toFixed(1)}/10` : 'No rating';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {vendor.vendor_name}
          </DialogTitle>
        </DialogHeader>

        {/* [M3] Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Info className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Performance
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Projects ({projectRatings.length})
          </button>
        </div>

        {/* [M3] Tab Content */}
        <div className="p-6">
        {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Contact Details</h3>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Vendor Type</Label>
                <p className="text-gray-900 font-medium">{displayValue(vendor.vendor_type)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <p className="text-gray-900">{displayValue(vendor.status)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Primary Contact</Label>
                <p className="text-gray-900">{displayValue(vendor.primary_contact)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-gray-900">{displayValue(vendor.email)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Availability</Label>
                <p className="text-gray-900">{displayValue(vendor.availability)}</p>
              </div>
            </div>
          </div>

          {/* Right Column - More Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Additional Information</h3>
            
            <div className="space-y-3">

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Portfolio URL</Label>
                <p className="text-gray-900 text-sm">{displayValue(vendor.portfolio_url)}</p>
              </div>

              {/* [R3] [vendor-work-samples] Work samples field - always show */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Work Samples</Label>
                <p className="text-gray-900 text-sm">{displayValue(vendor.sample_work_urls)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Industry</Label>
                <p className="text-gray-900 font-medium">{displayValue(vendor.industry)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Service Category</Label>
                <p className="text-gray-900 font-medium">{displayValue(vendor.service_category)}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* [M3] Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <Label className="text-sm font-medium text-gray-600">Industry</Label>
                <p className="text-gray-900 font-medium text-lg">{displayValue(vendor.industry)}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <Label className="text-sm font-medium text-gray-600">Service Category</Label>
                <p className="text-gray-900 font-medium text-lg">{displayValue(vendor.service_category)}</p>
              </div>
            </div>

            {vendor.skills && (
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Skills</Label>
                <p className="text-gray-900 whitespace-pre-wrap">{vendor.skills}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <Label className="text-sm font-medium text-gray-600">Pricing Structure</Label>
                <p className="text-gray-900 font-semibold text-lg">{displayValue(vendor.pricing_structure)}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <Label className="text-sm font-medium text-gray-600">Rate/Cost</Label>
                <p className="text-gray-900 font-semibold text-2xl text-green-600">
                  {displayValue(vendor.rate_cost)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* [M3] Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {displayRating(vendor.avg_overall_rating)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Projects</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {vendor.total_projects || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Status */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Capacity Status</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <p className="text-2xl font-bold" style={{
                    color:
                      vendor.availability_status === 'Available' ? '#166534' :
                      vendor.availability_status === 'Limited' ? '#92400e' :
                      vendor.availability_status === 'On Leave' ? '#1e40af' :
                      vendor.availability_status === 'Unavailable' ? '#991b1b' :
                      '#6b7280'
                  }}>
                    {vendor.availability_status || 'Not Set'}
                  </p>
                </div>
                {vendor.availability_notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-700">{vendor.availability_notes}</p>
                  </div>
                )}
                {vendor.available_from && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available From</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(vendor.available_from)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">General Availability</p>
                  <p className="text-gray-900">{displayValue(vendor.availability)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [M3] Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">Project Ratings</h3>
              {uniqueClients.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Clients ({projectRatings.length})</option>
                    {uniqueClients.map(client => (
                      <option key={client} value={client}>
                        {client} ({projectRatings.filter(p => p.client_name === client).length})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loadingRatings ? (
              <div className="text-center py-8 text-gray-500">Loading project ratings...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rated projects found for this vendor
                {selectedClient !== 'all' && ' with the selected client'}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProjects.map(project => (
                  <div key={project.project_id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.project_title}</h4>
                        <p className="text-sm text-gray-500">{project.client_name}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900">
                          {project.project_overall_rating_calc?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">/10</span>
                      </div>
                    </div>
                    {(project.what_went_well || project.areas_for_improvement) && (
                      <div className="mt-3 space-y-2 text-sm">
                        {project.what_went_well && (
                          <div>
                            <p className="font-medium text-green-700">✓ What went well:</p>
                            <p className="text-gray-600 ml-4">{project.what_went_well}</p>
                          </div>
                        )}
                        {project.areas_for_improvement && (
                          <div>
                            <p className="font-medium text-orange-700">⚠ Areas for improvement:</p>
                            <p className="text-gray-600 ml-4">{project.areas_for_improvement}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>

        {/* Action Buttons - Outside all tabs */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded-md">
            💡 To edit vendor information, use the admin dashboard
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
