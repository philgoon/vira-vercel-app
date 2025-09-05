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
  Calendar,
  Building2,
  CheckCircle,
  Users,
  Briefcase,
  Star
} from 'lucide-react'
import { Client } from '@/types'

interface ClientVendorData {
  vendorName: string;
  projects: Array<{
    title: string;
    rating: number | null;
  }>;
}

interface ClientModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  vendorData?: ClientVendorData[]
}

export default function ClientModal({ client, isOpen, onClose, vendorData = [] }: ClientModalProps) {
  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {client.client_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{client.client_name}</DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active Client
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {vendorData.length} {vendorData.length === 1 ? 'Vendor' : 'Vendors'}
                </Badge>
              </div>
              <DialogDescription className="text-base">
                Complete vendor and project overview for strategic decision making
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Client Information */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Client Details
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Client Name:</span>
                <div className="text-gray-900 mt-1">{client.client_name}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Total Projects:</span>
                <div className="text-gray-900 mt-1">{client.total_projects}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Active Vendors:</span>
                <div className="text-gray-900 mt-1">{vendorData.length}</div>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600 font-medium">Last Project Date:</span>
                <div className="text-gray-900 mt-1">
                  {new Date(client.last_project_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Performance
            </h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{client.total_projects}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vendorData.length}</div>
                <div className="text-sm text-gray-600">Vendors Used</div>
              </div>
            </div>
          </div>
        </div>

        {/* [R4] Vendor & Projects Details - The main business value section */}
        {vendorData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              Vendor & Project Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vendorData.map((vendor, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg text-gray-800">{vendor.vendorName}</h4>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {vendor.projects.length} {vendor.projects.length === 1 ? 'Project' : 'Projects'}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {vendor.projects.map((project, projectIdx) => (
                      <div key={projectIdx} className="flex items-start justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 leading-tight">{project.title}</span>
                          </div>
                        </div>
                        {project.rating && (
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-gray-700">{project.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Vendors */}
        {vendorData.length === 0 && (
          <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Vendor Data Available</h3>
            <p className="text-gray-500">This client doesn't have any associated vendor projects yet.</p>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ID: {client.client_key}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active Client</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Last Project: {new Date(client.last_project_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
