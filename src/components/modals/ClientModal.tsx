"use client"

import React from 'react'
import { SidePanel, SidePanelSection } from '@/components/layout/SidePanel'
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
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={client.client_name}
    >
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 'var(--stm-space-4)',
        marginBottom: 'var(--stm-space-6)',
      }}>
        {/* Client Details */}
        <div style={{
          padding: 'var(--stm-space-4)',
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-md)',
          border: '1px solid var(--stm-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-3)' }}>
            <Building2 style={{ width: '16px', height: '16px', color: 'var(--stm-primary)' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
              Client Details
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
            <div>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>Name</div>
              <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)' }}>{client.client_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>Total Projects</div>
              <div style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>{client.total_projects}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>Active Vendors</div>
              <div style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>{vendorData.length}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{
          padding: 'var(--stm-space-4)',
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-md)',
          border: '1px solid var(--stm-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-3)' }}>
            <Calendar style={{ width: '16px', height: '16px', color: 'var(--stm-primary)' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
              Timeline
            </span>
          </div>
          <div>
            <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>Last Project Date</div>
            <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)' }}>
              {new Date(client.last_project_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Performance */}
        <div style={{
          padding: 'var(--stm-space-4)',
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-md)',
          border: '1px solid var(--stm-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-3)' }}>
            <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--stm-success)' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
              Performance
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-success)' }}>{client.total_projects}</div>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>Total Projects</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>{vendorData.length}</div>
              <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>Vendors Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor & Project Details */}
      {vendorData.length > 0 && (
        <SidePanelSection title="Vendor & Project Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
            {vendorData.map((vendor, idx) => (
              <div key={idx} style={{
                padding: 'var(--stm-space-4)',
                backgroundColor: 'color-mix(in srgb, var(--stm-primary) 6%, var(--stm-card))',
                borderRadius: 'var(--stm-radius-md)',
                border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--stm-space-3)' }}>
                  <span style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
                    {vendor.vendorName}
                  </span>
                  <span style={{
                    fontSize: 'var(--stm-text-xs)',
                    fontWeight: 'var(--stm-font-medium)',
                    color: 'var(--stm-primary)',
                    backgroundColor: 'color-mix(in srgb, var(--stm-primary) 12%, transparent)',
                    padding: 'var(--stm-space-1) var(--stm-space-2)',
                    borderRadius: 'var(--stm-radius-full)',
                  }}>
                    {vendor.projects.length} {vendor.projects.length === 1 ? 'Project' : 'Projects'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)', maxHeight: '160px', overflowY: 'auto' }}>
                  {vendor.projects.map((project, projectIdx) => (
                    <div key={projectIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--stm-space-2) var(--stm-space-3)',
                      backgroundColor: 'var(--stm-card)',
                      borderRadius: 'var(--stm-radius-sm)',
                      border: '1px solid var(--stm-border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-2)', flex: 1 }}>
                        <Briefcase style={{ width: '14px', height: '14px', color: 'var(--stm-muted-foreground)', marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', lineHeight: '1.4' }}>{project.title}</span>
                      </div>
                      {project.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)', marginLeft: 'var(--stm-space-2)', flexShrink: 0 }}>
                          <Star style={{ width: '14px', height: '14px', color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
                          <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>{project.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SidePanelSection>
      )}

      {/* Empty State */}
      {vendorData.length === 0 && (
        <div style={{
          padding: 'var(--stm-space-8)',
          backgroundColor: 'var(--stm-muted)',
          borderRadius: 'var(--stm-radius-md)',
          textAlign: 'center',
        }}>
          <Users style={{ width: '40px', height: '40px', color: 'var(--stm-border)', margin: '0 auto var(--stm-space-3)' }} />
          <div style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>
            No Vendor Data Available
          </div>
          <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
            This client doesn't have any associated vendor projects yet.
          </p>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div style={{
        marginTop: 'var(--stm-space-6)',
        paddingTop: 'var(--stm-space-4)',
        borderTop: '1px solid var(--stm-border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--stm-space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: 'var(--stm-radius-full)', backgroundColor: 'var(--stm-primary)' }} />
          <span>ID: {client.client_key}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: 'var(--stm-radius-full)', backgroundColor: 'var(--stm-success)' }} />
          <span>Active Client</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
          <Calendar style={{ width: '12px', height: '12px' }} />
          <span>Last Project: {new Date(client.last_project_date).toLocaleDateString()}</span>
        </div>
      </div>
    </SidePanel>
  )
}
