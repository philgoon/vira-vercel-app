'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Eye, Filter } from 'lucide-react';
import { Vendor, VendorsApiResponse } from '@/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // [R7.2] Fetch vendors from Supabase API
  useEffect(() => {
    async function fetchVendors() {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedType !== 'all') params.set('type', selectedType);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);

        const response = await fetch(`/api/vendors?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        
        const data: VendorsApiResponse = await response.json();
        setVendors(data.vendors || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [searchTerm, selectedType, selectedStatus]);

  // [R7.3] Get unique types for filter dropdown
  const uniqueTypes = ['all', ...new Set(vendors.map(v => v.service_categories).filter(Boolean))];
  const uniqueStatuses = ['all', ...new Set(vendors.map(v => v.status).filter(Boolean))];

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276'
          }}>Our Vendors</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Discover vetted professionals for your next project
          </p>
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
                  placeholder="Search by name or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div style={{ minWidth: '12rem' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-input"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Categories' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: '12rem' }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-input"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
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
              <Filter style={{ width: '1rem', height: '1rem' }} />
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
            <p style={{ color: '#6b7280' }}>Loading vendors...</p>
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

        {!loading && !error && vendors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b7280' }}>No vendors found matching your criteria.</p>
          </div>
        )}

        {/* Vendor Grid */}
        {!loading && !error && vendors.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {vendors.map((vendor) => (
              <div key={vendor.vendor_id} className="professional-card" style={{ overflow: 'hidden' }}>
                {/* Vendor Header */}
                <div style={{
                  height: '8rem',
                  background: `linear-gradient(135deg, #1A5276 0%, #6B8F71 100%)`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem'
                    }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A5276' }}>
                        {vendor.vendor_name.charAt(0)}
                      </span>
                    </div>
                    <div style={{
                      color: 'white',
                      fontWeight: '600',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}>
                      {vendor.service_categories || 'Service Provider'}
                    </div>
                  </div>
                </div>

                {/* Vendor Info */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {vendor.vendor_name}
                    </h3>
                    
                    {vendor.contact_name && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Contact: {vendor.contact_name}
                      </p>
                    )}

                    {vendor.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{vendor.location}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: vendor.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                      color: vendor.status === 'Active' ? '#166534' : '#6b7280',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {vendor.status || 'Unknown'}
                    </div>
                  </div>

                  {/* Specialties */}
                  {vendor.specialties && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Specialties:
                      </p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        fontStyle: 'italic',
                        lineHeight: '1.4'
                      }}>
                        {vendor.specialties.length > 120 ? `${vendor.specialties.substring(0, 120)}...` : vendor.specialties}
                      </p>
                    </div>
                  )}

                  {/* Service Info */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '0.5rem', 
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    {vendor.pricing_notes && (
                      <div>
                        <span style={{ color: '#6b7280' }}>Pricing: </span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>{vendor.pricing_notes}</span>
                      </div>
                    )}
                    {vendor.contact_email && (
                      <div>
                        <span style={{ color: '#6b7280' }}>Email: </span>
                        <a 
                          href={`mailto:${vendor.contact_email}`}
                          style={{ fontWeight: '500', color: '#1A5276', textDecoration: 'none' }}
                        >
                          {vendor.contact_email}
                        </a>
                      </div>
                    )}
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
                      View Details
                    </button>
                    
                    {vendor.contact_email && (
                      <a
                        href={`mailto:${vendor.contact_email}`}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#6B8F71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && vendors.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {vendors.length} vendors
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
