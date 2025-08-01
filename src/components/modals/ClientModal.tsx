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
  CheckCircle
} from 'lucide-react'
import { Client } from '@/types'

interface ClientModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export default function ClientModal({ client, isOpen, onClose }: ClientModalProps) {
  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                {client.industry && (
                  <Badge variant="outline">
                    {client.industry}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-base">
                {client.industry ? `Operating in ${client.industry} industry` : 'Business client'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
              {client.industry && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Industry:</span>
                  <div className="text-gray-900 mt-1">{client.industry}</div>
                </div>
              )}
              {client.total_projects && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Total Projects:</span>
                  <div className="text-gray-900 mt-1">{client.total_projects}</div>
                </div>
              )}
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
                <span className="text-gray-600 font-medium">Client Since:</span>
                <div className="text-gray-900 mt-1">
                  {new Date(client.created_date).toLocaleDateString()}
                </div>
              </div>
              {client.updated_at && (
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">Last Updated:</span>
                  <div className="text-gray-900 mt-1">
                    {new Date(client.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Overview */}
          <div className="p-6 bg-white rounded-lg border shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Client Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              {client.total_projects && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{client.total_projects}</div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor((new Date().getTime() - new Date(client.created_date).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600">Days as Client</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ID: {client.client_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active Client</span>
            </div>
            {client.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>{client.industry} Industry</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Since: {new Date(client.created_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
