'use client'

import { useState, useEffect } from 'react'
import { Vendor } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface VendorModalProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedVendor: Partial<Vendor>) => void
}

export default function VendorModal({ vendor, isOpen, onClose, onSave }: VendorModalProps) {
  const [formData, setFormData] = useState<Partial<Vendor>>({})

  useEffect(() => {
    if (vendor) {
      setFormData(vendor)
    }
  }, [vendor])

  if (!isOpen || !vendor) {
    return null
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor: {vendor.vendor_name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 p-4">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Vendor Details</h3>
            <div className="space-y-2">
              <Label htmlFor="vendor_code">Vendor Code</Label>
              <Input id="vendor_code" value={formData.vendor_code || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input id="vendor_name" value={formData.vendor_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_type">Vendor Type</Label>
              <Input id="vendor_type" value={formData.vendor_type || ''} onChange={(e) => setFormData(prev => ({ ...prev, vendor_type: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={formData.status || ''} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_contact">Primary Contact</Label>
              <Input id="primary_contact" value={formData.primary_contact || ''} onChange={(e) => setFormData(prev => ({ ...prev, primary_contact: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_zone">Time Zone</Label>
              <Input id="time_zone" value={formData.time_zone || ''} onChange={(e) => setFormData(prev => ({ ...prev, time_zone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_preference">Contact Preference</Label>
              <Input id="contact_preference" value={formData.contact_preference || ''} onChange={(e) => setFormData(prev => ({ ...prev, contact_preference: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding_date">Onboarding Date</Label>
              <Input id="onboarding_date" type="date" value={formData.onboarding_date ? new Date(formData.onboarding_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData(prev => ({ ...prev, onboarding_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="record_date">Record Date</Label>
              <Input id="record_date" type="date" value={formData.record_date ? new Date(formData.record_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData(prev => ({ ...prev, record_date: e.target.value }))} />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Services & Pricing</h3>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={formData.industry || ''} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_category">Service Category</Label>
              <Input id="service_category" value={formData.service_category || ''} onChange={(e) => setFormData(prev => ({ ...prev, service_category: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea id="skills" value={formData.skills || ''} onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input id="portfolio_url" type="url" value={formData.portfolio_url || ''} onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample_work_urls">Sample Work URLs</Label>
              <Textarea id="sample_work_urls" value={formData.sample_work_urls || ''} onChange={(e) => setFormData(prev => ({ ...prev, sample_work_urls: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing_structure">Pricing Structure</Label>
              <Input id="pricing_structure" value={formData.pricing_structure || ''} onChange={(e) => setFormData(prev => ({ ...prev, pricing_structure: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_cost">Rate/Cost</Label>
              <Input id="rate_cost" value={formData.rate_cost || ''} onChange={(e) => setFormData(prev => ({ ...prev, rate_cost: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" value={formData.availability || ''} onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overall_rating">Overall Rating</Label>
              <Input id="overall_rating" type="number" value={formData.overall_rating || ''} onChange={(e) => setFormData(prev => ({ ...prev, overall_rating: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              Save All Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
