// [R7.7] Updated clients page using actual Supabase schema
'use client';

import { useState, useEffect } from 'react';
import { Building, Briefcase, Calendar, Users, Edit } from 'lucide-react';
import { Client } from '@/types';
import ClientModal from '@/components/modals/ClientModal';
import ClientProfileModal from '@/components/modals/ClientProfileModal';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  project_id: string;
  client_name: string;
  project_title: string;
  vendor_name: string;
  project_overall_rating_calc: number | null;
  created_at: string;
  updated_at: string;
}

interface ClientVendorData {
  vendorName: string;
  projects: Array<{
    title: string;
    rating: number | null;
  }>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientVendors, setClientVendors] = useState<Record<string, ClientVendorData[]>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  // [R4] [client-page-enhancement] Group vendors and projects by client
  const groupVendorsByClient = (projects: Project[]) => {
    const clientVendorMap: Record<string, ClientVendorData[]> = {};

    // [R4] Defensive programming - ensure projects is always an array
    const safeProjects = Array.isArray(projects) ? projects : [];

    console.log('=== CLIENT VENDOR GROUPING DEBUG ===');
    console.log('Total projects to process:', safeProjects.length);

    safeProjects.forEach(project => {
      const { client_name, vendor_name, project_title, project_overall_rating_calc } = project;

      // [R4] Debug specific client
      if (client_name === 'Bergen Oral & Maxillofacial Surgery') {
        console.log('Bergen project:', {
          client_name,
          vendor_name,
          project_title,
          rating: project_overall_rating_calc
        });
      }

      // [R4] Skip if essential data is missing
      if (!client_name || !vendor_name || !project_title) {
        console.log('Skipping project due to missing data:', { client_name, vendor_name, project_title });
        return;
      }

      if (!clientVendorMap[client_name]) {
        clientVendorMap[client_name] = [];
      }

      // Find existing vendor for this client
      let vendorData = clientVendorMap[client_name].find(v => v.vendorName === vendor_name);

      if (!vendorData) {
        vendorData = {
          vendorName: vendor_name,
          projects: []
        };
        clientVendorMap[client_name].push(vendorData);
      }

      // Add project to vendor
      vendorData.projects.push({
        title: project_title,
        rating: project_overall_rating_calc
      });
    });

    // [R4] Debug results
    console.log('Bergen vendor map result:', clientVendorMap['Bergen Oral & Maxillofacial Surgery']);

    return clientVendorMap;
  };

  // [R4] Fetch both clients and projects data
  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsResponse, projectsResponse] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/projects')
        ]);

        if (!clientsResponse.ok || !projectsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const clientsData = await clientsResponse.json();
        const response = await projectsResponse.json();

        // [R4] CRITICAL FIX: Extract projects array from API response object
        const projectsData = response.projects || [];

        // [R4] Defensive programming with proper error handling
        setClients(Array.isArray(clientsData) ? clientsData : []);

        // Group vendors and projects by client - ensure projectsData is array
        const safeProjectsData = Array.isArray(projectsData) ? projectsData : [];
        const vendorMap = groupVendorsByClient(safeProjectsData);
        setClientVendors(vendorMap);

      } catch (err) {
        console.error('Error fetching client/project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // [R4] Set safe defaults on error
        setClients([]);
        setClientVendors({});
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 'bold',
                color: '#1A5276'
              }}>Clients</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                Manage your client relationships with vendor and project overview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid #1A5276',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading clients...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#dc2626' }}>Error: {error}</p>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Building style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              No clients found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              No clients exist yet.
            </p>
            <button style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Add Your First Client
            </button>
          </div>
        )}

        {/* Client List - Enhanced with vendor/project information */}
        {!loading && !error && clients.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {clients.map((client) => {
              const vendorData = clientVendors[client.client_name] || [];
              return (
                <div
                  key={client.client_key}
                  className="professional-card"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsModalOpen(true);
                  }}
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {/* Client Header */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: '#1A5276',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
                        {client.client_name.charAt(0)}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {client.client_name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase style={{ width: '1rem', height: '1rem' }} />
                            <span>{client.total_projects} {client.total_projects === 1 ? 'project' : 'projects'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            <span>
                              Last: {client.last_project_date ? new Date(client.last_project_date).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client);
                              setIsProfileModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                            title="Edit Client Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Profile
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users style={{ width: '1rem', height: '1rem' }} />
                        <span>{vendorData.length} {vendorData.length === 1 ? 'vendor' : 'vendors'}</span>
                      </div>
                    </div>
                  </div>

                  {/* [R4] Quick preview of top vendors */}
                  {vendorData.length > 0 && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '0.75rem'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Recent Vendors:</div>
                      {vendorData.slice(0, 2).map((vendor, idx) => (
                        <div key={idx} style={{ marginBottom: '0.25rem' }}>
                          • {vendor.vendorName} ({vendor.projects.length} {vendor.projects.length === 1 ? 'project' : 'projects'})
                        </div>
                      ))}
                      {vendorData.length > 2 && (
                        <div style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                          +{vendorData.length - 2} more vendors...
                        </div>
                      )}
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                        Click to see all projects and vendors
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && clients.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {clients.length} clients with vendor and project details
            </p>
          </div>
        )}
      </div>

      {/* Client Modal */}
      {selectedClient && (
        <ClientModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          vendorData={clientVendors[selectedClient.client_name] || []}
        />
      )}

      {/* Client Profile Modal */}
      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedClient(null);
          }}
          onSave={(updatedClient) => {
            // Update the client in the list
            setClients(clients.map(c => 
              c.client_key === updatedClient.client_key ? updatedClient : c
            ));
            setIsProfileModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
