// [R7.7] Updated clients page using actual Supabase schema
'use client';

import { useState, useEffect } from 'react';
import { Search, Building, Plus, Eye, Calendar, MapPin, Phone } from 'lucide-react';
import { Client, ClientsApiResponse } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // [R7.8] Fetch clients from Supabase API
  useEffect(() => {
    async function fetchClients() {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
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
  }, [searchTerm, selectedIndustry]);

  const uniqueIndustries = ['all', ...new Set(clients.map(c => c.industry).filter(Boolean))];

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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '16rem' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af', 
                  width: '1rem', 
                  height: '1rem' 
                }} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div style={{ minWidth: '12rem' }}>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="form-input"
              >
                {uniqueIndustries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('all');
              }}
              style={{ 
                padding: '0.5rem 1rem', 
                color: '#6b7280', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Clear Filters
            </button>
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
              {searchTerm ? 'No clients match your search criteria.' : 'No clients exist yet.'}
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

        {/* Clients Grid */}
        {!loading && !error && clients.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {clients.map((client) => (
              <div key={client.client_id} className="professional-card">
                <div style={{ padding: '1.5rem' }}>
                  {/* Client Header */}
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: '#E8F4F8',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        color: '#1A5276' 
                      }}>
                        {client.client_name.charAt(0)}
                      </span>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#111827', 
                        marginBottom: '0.25rem',
                        lineHeight: '1.4'
                      }}>
                        {client.client_name}
                      </h3>
                      
                      {client.industry && (
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280',
                          marginBottom: '0.5rem'
                        }}>
                          {client.industry}
                        </p>
                      )}
                      
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Active Client
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {client.time_zone && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <MapPin style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                        <span style={{ color: '#6b7280' }}>Time Zone: </span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>{client.time_zone}</span>
                      </div>
                    )}
                    
                    {client.preferred_contact && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <Phone style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                        <span style={{ color: '#6b7280' }}>Preferred Contact: </span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>{client.preferred_contact}</span>
                      </div>
                    )}

                    {client.total_projects !== undefined && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <Building style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                        <span style={{ color: '#6b7280' }}>Total Projects: </span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {client.total_projects}
                        </span>
                      </div>
                    )}

                    {client.client_notes && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                          Notes:
                        </p>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280', 
                          fontStyle: 'italic',
                          lineHeight: '1.4',
                          backgroundColor: '#f9fafb',
                          padding: '0.5rem',
                          borderRadius: '0.375rem'
                        }}>
                          {client.client_notes.length > 120 ? 
                            `${client.client_notes.substring(0, 120)}...` : 
                            client.client_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Client Since */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <Calendar style={{ width: '1rem', height: '1rem' }} />
                    <span>Client since: {new Date(client.created_date).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#1A5276',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      <Eye style={{ width: '1rem', height: '1rem' }} />
                      View Projects
                    </button>
                    
                    <button style={{
                      padding: '0.5rem',
                      backgroundColor: '#6B8F71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
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
              {searchTerm && ` matching "${searchTerm}"`}
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
