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
  Calendar,
  Building,
  CheckCircle,
  Briefcase,
  Link as LinkIcon,
  DollarSign,
  Clock,
  BarChart,
  User,
  Star
} from 'lucide-react'
import { Vendor } from '@/types'

interface VendorModalProps {
  vendor: Vendor
  isOpen: boolean
  onClose: () => void
}

const InfoItem = ({ icon, label, value, isLink = false }: { icon: React.ReactNode, label: string, value?: string | number | null, isLink?: boolean }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {isLink && typeof value === 'string' ? (
          <a href={value.startsWith('http') ? value : `//${value}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
};

export default function VendorModal({ vendor, isOpen, onClose }: VendorModalProps) {
  const getStatusColor = (status?: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold text-gray-900">{vendor.vendor_name}</DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1">
                {vendor.vendor_type || 'No type specified'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Contact & Commercials */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Contact & Logistics</h3>
              <div className="space-y-3">
                <InfoItem icon={<User className="w-4 h-4" />} label="Primary Contact" value={vendor.primary_contact} />
                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={vendor.email} isLink={!!vendor.email} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Time Zone" value={vendor.time_zone} />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="Contact Preference" value={vendor.contact_preference} />
              </div>
            </div>
            {/* Commercials */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400" /> Commercials</h3>
              <div className="space-y-3">
                <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Pricing Structure" value={vendor.pricing_structure} />
                <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Rate/Cost" value={vendor.rate_cost} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Availability" value={vendor.availability} />
              </div>
            </div>
          </div>

          {/* Right Column: Capabilities & History */}
          <div className="md:col-span-2 space-y-6">
            {/* Capabilities */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-400" /> Capabilities</h3>
              <div className="space-y-3">
                <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Industry Focus" value={vendor.industry} />
                <InfoItem icon={<LinkIcon className="w-4 h-4" />} label="Portfolio" value={vendor.portfolio_url} isLink={true} />
                {vendor.skills && (
                  <div>
                    <p className="text-xs text-gray-500">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendor.skills.split(',').map(skill => (
                        <Badge key={skill} variant="secondary">{skill.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* History & Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><BarChart className="w-4 h-4 text-gray-400" /> Performance & History</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Star className="w-4 h-4" />} label="Avg. Overall Rating" value={vendor.avg_overall_rating ? `${Number(vendor.avg_overall_rating).toFixed(1)}/10` : 'N/A'} />
                <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Total Rated Projects" value={vendor.total_projects ?? 0} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="Onboarded" value={vendor.onboarding_date ? new Date(vendor.onboarding_date).toLocaleDateString() : 'N/A'} />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={`mt-1 ${getStatusColor(vendor.status)}`}>{vendor.status || 'Unknown'}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
