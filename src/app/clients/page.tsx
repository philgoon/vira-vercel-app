// [R7.7] Updated clients page using actual Supabase schema
'use client';

import { useState, useEffect } from 'react';
import { Building, Briefcase, Calendar } from 'lucide-react';
import { Client } from '@/types';
import ClientModal from '@/components/modals/ClientModal';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // [R7.8] Fetch clients from Supabase API
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');

        const data = await response.json();
        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
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
                Manage your client relationships and project history
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

        {/* Client List - 2 Column Layout matching vendor page style */}
        {!loading && !error && clients.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {clients.map((client) => (
              <div
                key={client.client_key}
                className="professional-card"
                onClick={() => {
                  setSelectedClient(client);
                  setIsModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  minHeight: '5rem',
                  cursor: 'pointer'
                }}
              >
                {/* Client Avatar */}
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

                {/* Main Client Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {client.client_name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase style={{ width: '1rem', height: '1rem' }} />
                      <span>
                        {client.total_projects} {client.total_projects === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar style={{ width: '1rem', height: '1rem' }} />
                      <span>
                        Last project: {client.last_project_date ? new Date(client.last_project_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && clients.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {clients.length} clients
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
