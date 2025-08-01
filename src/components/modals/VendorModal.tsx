"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  CheckCircle
} from 'lucide-react'
import { Vendor } from '@/types'

interface VendorModalProps {
  vendor: Vendor
  isOpen: boolean
  onClose: () => void
}

export default function VendorModal({ vendor, isOpen, onClose }: VendorModalProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {vendor.vendor_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{vendor.vendor_name}</DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={getStatusColor(vendor.status || 'unknown')}>
                  {vendor.status || 'Unknown'}
                </Badge>
              </div>
              <DialogDescription className="text-base">
                {Array.isArray(vendor.service_categories)
                  ? vendor.service_categories.join(', ')
                  : vendor.service_categories || 'Professional services'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Contact Information */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {vendor.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${vendor.contact_email}`} className="text-blue-600 hover:underline">
                    {vendor.contact_email}
                  </a>
                </div>
              )}
              {vendor.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a href={`tel:${vendor.contact_phone}`} className="text-blue-600 hover:underline">
                    {vendor.contact_phone}
                  </a>
                </div>
              )}
              {vendor.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{vendor.location}</span>
                </div>
              )}
              {vendor.contact_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>Contact: {vendor.contact_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Details */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Vendor Details
            </h3>
            <div className="space-y-3">
              {vendor.specialties && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Specialties:</span>
                  <div className="text-gray-900 mt-1">{vendor.specialties}</div>
                </div>
              )}
              {vendor.onboarding_date && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Onboarded:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(vendor.onboarding_date).toLocaleDateString()}
                  </div>
                </div>
              )}
              {vendor.status && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Current Status:</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Categories */}
          {vendor.service_categories && (
            <div className="p-6 bg-white rounded-lg border shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Service Categories
              </h3>
              <div className="text-gray-700">
                {Array.isArray(vendor.service_categories)
                  ? vendor.service_categories.join(', ')
                  : vendor.service_categories}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ID: {vendor.vendor_id}</span>
            </div>
            {vendor.status === 'active' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Currently Active</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Verified Vendor</span>
            </div>
            {vendor.onboarding_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Onboarded: {new Date(vendor.onboarding_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
