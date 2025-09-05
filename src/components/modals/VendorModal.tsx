'use client'

import { Vendor } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VendorModalProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedVendor: Partial<Vendor>) => void // Optional for backward compatibility
}

// [R2] [vendor-detail-readonly] Converted to read-only information display for security
export default function VendorModal({ vendor, isOpen, onClose }: VendorModalProps) {
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
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
            {vendor.vendor_name}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 p-4">

          {/* Contact Information Section */}
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
                <Label className="text-sm font-medium text-gray-600">Time Zone</Label>
                <p className="text-gray-900">{displayValue(vendor.time_zone)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Contact Preference</Label>
                <p className="text-gray-900">{displayValue(vendor.contact_preference)}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Onboarding Date</Label>
                <p className="text-gray-900">{formatDate(vendor.onboarding_date)}</p>
              </div>

              {/* [R3] [vendor-work-samples] Portfolio URL field */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Portfolio URL</Label>
                <p className="text-gray-900 text-sm">{displayValue(vendor.portfolio_url)}</p>
              </div>

              {/* [R3] [vendor-work-samples] Work samples field - always show */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Work Samples</Label>
                <p className="text-gray-900 text-sm">{displayValue(vendor.sample_work_urls)}</p>
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Services & Performance</h3>

            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <Label className="text-sm font-medium text-gray-600">Industry</Label>
                <p className="text-gray-900 font-medium">{displayValue(vendor.industry)}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <Label className="text-sm font-medium text-gray-600">Service Category</Label>
                <p className="text-gray-900">{displayValue(vendor.service_category)}</p>
              </div>

              {vendor.skills && (
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <Label className="text-sm font-medium text-gray-600">Skills</Label>
                  <p className="text-gray-900 whitespace-pre-wrap">{vendor.skills}</p>
                </div>
              )}

              <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                <Label className="text-sm font-medium text-gray-600">Pricing Structure</Label>
                <p className="text-gray-900 font-semibold">{displayValue(vendor.pricing_structure)}</p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                <Label className="text-sm font-medium text-gray-600">Rate/Cost</Label>
                <p className="text-gray-900 font-semibold text-lg text-green-600">
                  {displayValue(vendor.rate_cost)}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Availability</Label>
                <p className="text-gray-900">{displayValue(vendor.availability)}</p>
              </div>

              {/* Performance Metrics - FIXED: Using actual database fields */}
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <Label className="text-sm font-medium text-gray-600">Performance Metrics (Database)</Label>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Overall Rating (avg_overall_rating)</p>
                    <p className="text-lg font-bold text-purple-600">
                      {displayRating(vendor.avg_overall_rating)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Projects (total_projects)</p>
                    <p className="text-lg font-bold text-purple-600">
                      {vendor.total_projects || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button - Read Only */}
          <div className="col-span-2 flex gap-3 pt-4 border-t">
            <Button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700">
              Close
            </Button>
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded-md">
              💡 To edit vendor information, use the admin dashboard
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
