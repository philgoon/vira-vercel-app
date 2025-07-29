// [R7.7] Updated clients page using actual Supabase schema
'use client';

import { useState, useEffect } from 'react';
import { Building, Plus, Eye, Calendar, MapPin, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Client, ClientsApiResponse } from '@/types';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // [R7.8] Fetch clients from Supabase API
  useEffect(() => {
    async function fetchClients() {
      try {
        const params = new URLSearchParams();
        if (selectedIndustry !== 'all') params.set('industry', selectedIndustry);

        const response = await fetch(`/api/clients?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch clients');
        
        const data: ClientsApiResponse = await response.json();
        setClients(data.clients || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [selectedIndustry]);

  const uniqueIndustries = ['all', ...new Set(clients.map(c => c.industry).filter(Boolean) as string[])];

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
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add New Client
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem 1.5rem' }}>
          {/* Industry Filter Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Filter by Industry
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedIndustry('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: selectedIndustry === 'all' ? '#1A5276' : '#d1d5db',
                  backgroundColor: selectedIndustry === 'all' ? '#1A5276' : 'white',
                  color: selectedIndustry === 'all' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                All Industries
              </button>
              {uniqueIndustries.filter(industry => industry !== 'all').map(industry => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: selectedIndustry === industry ? '#1A5276' : '#d1d5db',
                    backgroundColor: selectedIndustry === industry ? '#1A5276' : 'white',
                    color: selectedIndustry === industry ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {industry}
                </button>
              ))}
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
              {selectedIndustry !== 'all' ? `No clients found in ${selectedIndustry} industry.` : 'No clients exist yet.'}
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
              <div key={client.client_id} className="professional-card" style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                minHeight: '5rem'
              }}>
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
                    
                    {/* Projects count */}
                    {client.total_projects !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{client.total_projects} projects</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {client.industry || 'Industry Not Set'}
                    </span>
                    
                    {/* Status Badge */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Active
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button 
                    onClick={() => {
                      console.log('View button clicked for client:', client.client_id, client.client_name);
                      router.push(`/clients/${client.client_id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#1A5276',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      minWidth: '120px',
                      justifyContent: 'center'
                    }}
                  >
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                    View Client
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('Edit button clicked for client:', client.client_id, client.client_name);
                      router.push(`/clients/${client.client_id}/edit`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6B8F71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      minWidth: '120px',
                      justifyContent: 'center'
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Client
                  </button>
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
              {selectedIndustry !== 'all' && ` in ${selectedIndustry}`}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
