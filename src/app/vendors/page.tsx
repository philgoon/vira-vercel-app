'use client';

import { useState, useEffect } from 'react';
import { Vendor, VendorsApiResponse } from '@/types';
import VendorModal from '@/components/modals/VendorModal';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Modal states
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [R7.2] Fetch vendors from Supabase API
  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('Failed to fetch vendors');

        const data: VendorsApiResponse = await response.json();
        let vendorList = data.vendors || [];

        // Client-side filtering for categories
        if (selectedCategories.length > 0) {
          vendorList = vendorList.filter(vendor => {
            const categories = Array.isArray(vendor.service_categories)
              ? vendor.service_categories
              : [vendor.service_categories].filter(Boolean);
            return selectedCategories.some(selectedCat =>
              categories.some(vendorCat => vendorCat?.toLowerCase().includes(selectedCat.toLowerCase()))
            );
          });
        }

        setVendors(vendorList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [selectedCategories]);

  // Fetch all categories on component mount
  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data: VendorsApiResponse = await response.json();
          const allVendors = data.vendors || [];

          const categorySet = new Set<string>();
          allVendors.forEach(vendor => {
            const categories = Array.isArray(vendor.service_categories)
              ? vendor.service_categories
              : [vendor.service_categories].filter(Boolean);
            categories.forEach(cat => {
              if (cat && typeof cat === 'string' && cat.trim()) {
                categorySet.add(cat.trim());
              }
            });
          });

          setAllCategories(Array.from(categorySet).sort());
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }

    fetchAllCategories();
  }, []);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle vendor card click
  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

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
          {/* Category Filter Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Filter by Category
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedCategories([])}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: selectedCategories.length === 0 ? '#1A5276' : '#d1d5db',
                  backgroundColor: selectedCategories.length === 0 ? '#1A5276' : 'white',
                  color: selectedCategories.length === 0 ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                All Categories
              </button>
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: selectedCategories.includes(category) ? '#1A5276' : '#d1d5db',
                    backgroundColor: selectedCategories.includes(category) ? '#1A5276' : 'white',
                    color: selectedCategories.includes(category) ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {category}
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

        {/* Vendor List - 2 Column Layout */}
        {!loading && !error && vendors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {vendors.map((vendor) => (
              <div
                key={vendor.vendor_id}
                className="professional-card"
                onClick={() => handleVendorClick(vendor)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  minHeight: '5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Vendor Avatar */}
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
                    {vendor.vendor_name.charAt(0)}
                  </span>
                </div>

                {/* Main Vendor Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {vendor.vendor_name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {Array.isArray(vendor.service_categories)
                        ? vendor.service_categories[0]
                        : vendor.service_categories || 'Service Provider'}
                    </span>

                    {/* Status Badge */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: vendor.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                      color: vendor.status === 'Active' ? '#166534' : '#6b7280',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {vendor.status || 'Unknown'}
                    </div>
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

      {/* Vendor Modal */}
      {selectedVendor && (
        <VendorModal
          vendor={selectedVendor}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
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
