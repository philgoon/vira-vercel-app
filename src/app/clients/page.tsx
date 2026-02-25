// [EPIC-002] Clients — card grid matching vendor roster layout
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Edit } from 'lucide-react';
import { Client } from '@/types';
import ClientModal from '@/components/modals/ClientModal';
import ClientProfileModal from '@/components/modals/ClientProfileModal';
import { useViRAAuth } from '@/hooks/useViRAAuth';

interface Project {
  project_id: string;
  client_name: string;
  project_title: string;
  vendor_name: string;
  project_overall_rating_calc: number | null;
}

interface ClientVendorData {
  vendorName: string;
  projects: Array<{ title: string; rating: number | null }>;
}

function groupVendorsByClient(projects: Project[]): Record<string, ClientVendorData[]> {
  const map: Record<string, ClientVendorData[]> = {};
  projects.forEach(({ client_name, vendor_name, project_title, project_overall_rating_calc }) => {
    if (!client_name || !vendor_name || !project_title) return;
    if (!map[client_name]) map[client_name] = [];
    let vendorData = map[client_name].find(v => v.vendorName === vendor_name);
    if (!vendorData) {
      vendorData = { vendorName: vendor_name, projects: [] };
      map[client_name].push(vendorData);
    }
    vendorData.projects.push({ title: project_title, rating: project_overall_rating_calc });
  });
  return map;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientVendors, setClientVendors] = useState<Record<string, ClientVendorData[]>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { isAdmin } = useViRAAuth();

  useEffect(() => {
    Promise.all([fetch('/api/clients'), fetch('/api/projects')])
      .then(async ([cr, pr]) => {
        if (!cr.ok || !pr.ok) throw new Error('Failed to fetch data');
        const clientsData = await cr.json();
        const projectsData = await pr.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setClientVendors(groupVendorsByClient(projectsData.projects || []));
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c => c.client_name.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-5)' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
            Clients
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
            {loading ? 'Loading...' : `${filteredClients.length} client${filteredClients.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '320px', marginBottom: 'var(--stm-space-6)' }}>
        <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--stm-muted-foreground)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 32px', fontFamily: 'var(--stm-font-body)',
            fontSize: '12px', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
            backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', outline: 'none',
          }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading clients...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius-lg)', color: 'var(--stm-error)', fontSize: '13px', fontFamily: 'var(--stm-font-body)' }}>
          {error}
        </div>
      )}

      {/* Client Grid */}
      {!loading && !error && filteredClients.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filteredClients.map((client, idx) => {
            const vendorData = clientVendors[client.client_name] || [];
            const totalVendors = vendorData.length;
            const lastDate = client.last_project_date
              ? new Date(client.last_project_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : null;

            return (
              <div
                key={client.client_key}
                onClick={() => { setSelectedClient(client); setIsModalOpen(true); }}
                style={{
                  backgroundColor: 'var(--stm-card)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-lg)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 3,
                  animationDelay: `${idx * 0.03}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-primary)';
                  el.style.boxShadow = '0 6px 24px rgba(26,82,118,0.12)';
                  el.style.transform = 'translateY(-2px)';
                  const bar = el.querySelector('.cl-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-border)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                  const bar = el.querySelector('.cl-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '0';
                }}
              >
                {/* Accent bar */}
                <div className="cl-accent-bar" style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px',
                  background: 'linear-gradient(180deg, var(--stm-primary), var(--stm-accent))',
                  opacity: 0, transition: 'opacity 0.18s', borderRadius: '3px 0 0 3px',
                }} />

                {/* Top: name + initial */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--stm-foreground)', marginBottom: '2px', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {client.client_name}
                    </div>
                    {lastDate && (
                      <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                        Last project: {lastDate}
                      </div>
                    )}
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--stm-muted)',
                    fontSize: '16px', fontWeight: '800', color: 'var(--stm-primary)',
                    fontFamily: 'var(--stm-font-body)', opacity: 0.85,
                  }}>
                    {client.client_name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Recent vendors */}
                {vendorData.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    {vendorData.slice(0, 2).map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--stm-primary)', flexShrink: 0, opacity: 0.5 }} />
                        <span style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.vendorName} · {v.projects.length} {v.projects.length === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                    ))}
                    {vendorData.length > 2 && (
                      <div style={{ fontSize: '10px', color: 'var(--stm-border)', fontFamily: 'var(--stm-font-body)', marginTop: '2px', marginLeft: '10px' }}>
                        +{vendorData.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Score row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--stm-border)' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--stm-primary)', lineHeight: 1, fontFamily: 'var(--stm-font-body)' }}>
                      {client.total_projects ?? 0}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--stm-muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'var(--stm-font-body)' }}>
                      Projects
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                      {totalVendors}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--stm-muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'var(--stm-font-body)' }}>
                      {totalVendors === 1 ? 'Vendor' : 'Vendors'}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setIsProfileModalOpen(true);
                      }}
                      title="Edit client profile"
                      style={{
                        width: '32px', height: '32px', borderRadius: 'var(--stm-radius-md)',
                        border: '1px solid var(--stm-border)', backgroundColor: 'var(--stm-background)',
                        color: 'var(--stm-muted-foreground)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.14s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'var(--stm-muted)';
                        el.style.color = 'var(--stm-foreground)';
                        el.style.borderColor = 'var(--stm-primary)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'var(--stm-background)';
                        el.style.color = 'var(--stm-muted-foreground)';
                        el.style.borderColor = 'var(--stm-border)';
                      }}
                    >
                      <Edit style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: '13px' }}>
          No clients match your search.
        </div>
      )}

      {/* Modals */}
      {selectedClient && (
        <ClientModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedClient(null); }}
          vendorData={clientVendors[selectedClient.client_name] || []}
        />
      )}

      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          isOpen={isProfileModalOpen}
          onClose={() => { setIsProfileModalOpen(false); setSelectedClient(null); }}
          onSave={updatedClient => {
            setClients(prev => prev.map(c => c.client_key === updatedClient.client_key ? updatedClient : c));
            setIsProfileModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
