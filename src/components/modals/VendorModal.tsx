'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Vendor } from '@/types'
import { SidePanel, SidePanelTabs, SidePanelSection, SidePanelField, SidePanelFooterAction } from '@/components/layout/SidePanel'
import { Star, Filter } from 'lucide-react'

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
  const router = useRouter()
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
      // [an8.14] Filter server-side by vendor_id
      const res = await fetch(`/api/projects?vendor_id=${vendor.vendor_id}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const result = await res.json();

      const vendorProjects = (result.projects || [])
        .filter((p: any) => p.project_overall_rating_calc != null)
        .map((p: any) => ({
          project_id: p.project_id,
          project_title: p.project_title,
          client_name: p.client_name,
          project_overall_rating_calc: p.project_overall_rating_calc,
          what_went_well: p.what_went_well,
          areas_for_improvement: p.areas_for_improvement,
        }));

      setProjectRatings(vendorProjects);

      // Extract unique clients
      const clients: string[] = Array.from(new Set(vendorProjects.map((p: ProjectRating) => p.client_name)));
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

  // Tab definitions for SidePanelTabs
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: renderOverviewTab(),
    },
    {
      id: 'services',
      label: 'Services',
      content: renderServicesTab(),
    },
    {
      id: 'performance',
      label: 'Performance',
      content: renderPerformanceTab(),
    },
    {
      id: 'projects',
      label: `Projects (${projectRatings.length})`,
      content: renderProjectsTab(),
    },
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={vendor?.vendor_name || 'Vendor Details'}
      footer={
        <>
          <SidePanelFooterAction
            onClick={() => { onClose(); router.push(`/vendors/${vendor.vendor_id}/edit`); }}
            label="Edit Vendor"
            variant="primary"
          />
          <SidePanelFooterAction
            onClick={onClose}
            label="Close"
          />
        </>
      }
    >
      <SidePanelTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'overview' | 'services' | 'performance' | 'projects')}
      />
    </SidePanel>
  );

  function renderOverviewTab() {
    if (!vendor) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <SidePanelSection title="Contact Details">
          <SidePanelField label="Vendor Type" value={displayValue(vendor.vendor_type)} />
          <SidePanelField label="Status" value={displayValue(vendor.status)} />
          <SidePanelField label="Primary Contact" value={displayValue(vendor.primary_contact)} />
          <SidePanelField label="Email" value={displayValue(vendor.email)} />
          <SidePanelField label="Availability" value={displayValue(vendor.availability)} />
        </SidePanelSection>

        <SidePanelSection title="Additional Information">
          <SidePanelField label="Portfolio URL" value={displayValue(vendor.portfolio_url)} muted={!vendor.portfolio_url} />
          <SidePanelField label="Work Samples" value={displayValue(vendor.sample_work_urls)} muted={!vendor.sample_work_urls} />
          <SidePanelField label="Industry" value={displayValue(vendor.industry)} />
          <SidePanelField label="Service Category" value={displayValue(vendor.service_category)} />
        </SidePanelSection>
      </div>
    );
  }

  function renderServicesTab() {
    if (!vendor) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-4)' }}>
          <div style={{
            backgroundColor: 'var(--stm-muted)',
            padding: 'var(--stm-space-4)',
            borderLeft: '4px solid var(--stm-primary)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <SidePanelField label="Industry" value={displayValue(vendor.industry)} />
          </div>

          <div style={{
            backgroundColor: 'var(--stm-muted)',
            padding: 'var(--stm-space-4)',
            borderLeft: '4px solid var(--stm-primary)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <SidePanelField label="Service Category" value={displayValue(vendor.service_category)} />
          </div>
        </div>

        {vendor.skills && (
          <div style={{
            backgroundColor: 'var(--stm-muted)',
            padding: 'var(--stm-space-4)',
            borderLeft: '4px solid var(--stm-primary)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <SidePanelField label="Skills" value={
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--stm-foreground)' }}>
                {vendor.skills}
              </div>
            } />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-4)' }}>
          <div style={{
            backgroundColor: 'var(--stm-muted)',
            padding: 'var(--stm-space-4)',
            borderLeft: '4px solid var(--stm-warning)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <SidePanelField label="Pricing Structure" value={displayValue(vendor.pricing_structure)} />
          </div>

          <div style={{
            backgroundColor: 'var(--stm-muted)',
            padding: 'var(--stm-space-4)',
            borderLeft: '4px solid var(--stm-warning)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <SidePanelField label="Rate/Cost" value={
              <div style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-success)' }}>
                {displayValue(vendor.rate_cost)}
              </div>
            } />
          </div>
        </div>
      </div>
    );
  }

  function renderPerformanceTab() {
    if (!vendor) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
        <div style={{
          backgroundColor: 'var(--stm-muted)',
          padding: 'var(--stm-space-6)',
          borderLeft: '4px solid var(--stm-primary)',
          borderRadius: 'var(--stm-radius-md)',
        }}>
          <h3 style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-semibold)', marginBottom: 'var(--stm-space-4)', color: 'var(--stm-foreground)' }}>
            Performance Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-6)' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-2)' }}>
                Overall Rating
              </p>
              <p style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>
                {displayRating(vendor.avg_overall_rating)}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-2)' }}>
                Total Projects
              </p>
              <p style={{ fontSize: 'var(--stm-text-4xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-primary)' }}>
                {vendor.total_projects || 0}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--stm-muted)',
          padding: 'var(--stm-space-6)',
          borderLeft: '4px solid var(--stm-primary)',
          borderRadius: 'var(--stm-radius-md)',
        }}>
          <h3 style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-semibold)', marginBottom: 'var(--stm-space-4)', color: 'var(--stm-foreground)' }}>
            Capacity Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>
                Current Status
              </p>
              <p style={{
                fontSize: 'var(--stm-text-lg)',
                fontWeight: 'var(--stm-font-bold)',
                color:
                  vendor.availability_status === 'Available' ? 'var(--stm-success)' :
                  vendor.availability_status === 'Limited' ? 'var(--stm-warning)' :
                  vendor.availability_status === 'On Leave' ? 'var(--stm-info)' :
                  vendor.availability_status === 'Unavailable' ? 'var(--stm-error)' :
                  'var(--stm-muted-foreground)'
              }}>
                {vendor.availability_status || 'Not Set'}
              </p>
            </div>
            {vendor.availability_notes && (
              <div>
                <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>
                  Notes
                </p>
                <p style={{ color: 'var(--stm-foreground)' }}>{vendor.availability_notes}</p>
              </div>
            )}
            {vendor.available_from && (
              <div>
                <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>
                  Available From
                </p>
                <p style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
                  {formatDate(vendor.available_from)}
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginBottom: 'var(--stm-space-1)' }}>
                General Availability
              </p>
              <p style={{ color: 'var(--stm-foreground)' }}>{displayValue(vendor.availability)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderProjectsTab() {
    if (!vendor) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 'var(--stm-font-semibold)', fontSize: 'var(--stm-text-lg)', color: 'var(--stm-foreground)' }}>
            Project Ratings
          </h3>
          {uniqueClients.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
              <Filter style={{ width: '16px', height: '16px', color: 'var(--stm-muted-foreground)' }} />
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{
                  padding: 'var(--stm-space-2) var(--stm-space-3)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-md)',
                  fontSize: 'var(--stm-text-sm)',
                  backgroundColor: 'var(--stm-background)',
                  color: 'var(--stm-foreground)',
                }}
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
          <div style={{ textAlign: 'center', padding: 'var(--stm-space-8)', color: 'var(--stm-muted-foreground)' }}>
            Loading project ratings...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--stm-space-8)', color: 'var(--stm-muted-foreground)' }}>
            No rated projects found for this vendor
            {selectedClient !== 'all' && ' with the selected client'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
            {filteredProjects.map(project => (
              <div
                key={project.project_id}
                style={{
                  backgroundColor: 'var(--stm-background)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-md)',
                  padding: 'var(--stm-space-4)',
                  transition: 'box-shadow var(--stm-duration-fast) var(--stm-ease-out)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-2)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
                      {project.project_title}
                    </h4>
                    <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
                      {project.client_name}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--stm-space-1)',
                    backgroundColor: 'var(--stm-muted)',
                    padding: `var(--stm-space-1) var(--stm-space-3)`,
                    borderRadius: 'var(--stm-radius-full)',
                  }}>
                    <Star style={{ width: '16px', height: '16px', color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
                    <span style={{ fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)' }}>
                      {project.project_overall_rating_calc?.toFixed(1) || 'N/A'}
                    </span>
                    <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>/10</span>
                  </div>
                </div>
                {(project.what_went_well || project.areas_for_improvement) && (
                  <div style={{ marginTop: 'var(--stm-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)', fontSize: 'var(--stm-text-sm)' }}>
                    {project.what_went_well && (
                      <div>
                        <p style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-success)' }}>✓ What went well:</p>
                        <p style={{ color: 'var(--stm-foreground)', marginLeft: 'var(--stm-space-4)' }}>
                          {project.what_went_well}
                        </p>
                      </div>
                    )}
                    {project.areas_for_improvement && (
                      <div>
                        <p style={{ fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-warning)' }}>⚠ Areas for improvement:</p>
                        <p style={{ color: 'var(--stm-foreground)', marginLeft: 'var(--stm-space-4)' }}>
                          {project.areas_for_improvement}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
