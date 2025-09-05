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

  // [R1] [vendor-cost-display] Fetch vendors with pricing from existing API
  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('Failed to fetch vendors');

        const data: VendorsApiResponse = await response.json();
        let vendorList = data.vendors || [];

        // Client-side filtering for categories (using vendor_type)
        if (selectedCategories.length > 0) {
          vendorList = vendorList.filter((vendor: Vendor) => {
            const vendorType = vendor.vendor_type;
            return vendorType && selectedCategories.some(selectedCat =>
              vendorType.toLowerCase().includes(selectedCat.toLowerCase())
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
          allVendors.forEach((vendor: Vendor) => {
            if (vendor.vendor_type && typeof vendor.vendor_type === 'string' && vendor.vendor_type.trim()) {
              categorySet.add(vendor.vendor_type.trim());
            }
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

  // Handle vendor save
  const handleSaveVendor = async (updatedVendor: Partial<Vendor>) => {
    try {
      // TODO: Implement vendor update API call
      console.log('Saving vendor:', updatedVendor);

      // Close modal after successful save
      setIsModalOpen(false);
      setSelectedVendor(null);

      // Refresh vendors list to show updated data
      // This will trigger the useEffect to refetch vendors
      setSelectedCategories([...selectedCategories]);
    } catch (error) {
      console.error('Failed to save vendor:', error);
      // TODO: Add proper error handling/notification
    }
  };

  // [R1] [vendor-cost-display] Helper function to format pricing for display - FIXED: Handle existing $ signs
  const formatPricingDisplay = (vendor: Vendor) => {
    if (!vendor.pricing_structure || !vendor.rate_cost) {
      return 'Pricing available on request';
    }

    // Clean the rate_cost to handle existing formatting
    const rateCost = vendor.rate_cost.toString();
    const pricingStructure = vendor.pricing_structure.toLowerCase();

    // If rate_cost already starts with $, use it as-is, otherwise add $
    const cleanRate = rateCost.startsWith('$') ? rateCost : `$${rateCost}`;

    // Format based on pricing structure, avoiding duplicate units
    if (pricingStructure.includes('word')) {
      return `${cleanRate}/word`;
    } else if (pricingStructure.includes('hour')) {
      // Avoid duplicate "/hour" if it's already in the rate_cost
      return rateCost.includes('/hour') ? cleanRate : `${cleanRate}/hour`;
    } else if (pricingStructure.includes('project') || pricingStructure.includes('fixed')) {
      return rateCost.includes('/project') ? cleanRate : `${cleanRate}/project`;
    } else if (pricingStructure.includes('piece')) {
      return rateCost.includes('/piece') ? cleanRate : `${cleanRate}/piece`;
    } else {
      return cleanRate;
    }
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
            Discover vetted professionals with transparent pricing
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

        {/* Vendor List - 2 Column Layout with Enhanced Data */}
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
                  minHeight: '6rem', // Increased to accommodate pricing
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

                  {/* First row: Category, Projects, Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {vendor.vendor_type || 'Service Provider'}
                    </span>

                    {/* Project Count */}
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {vendor.total_projects || 0} projects
                    </span>

                    {/* Rating Badge */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: vendor.avg_overall_rating ? '#dcfce7' : '#f3f4f6',
                      color: vendor.avg_overall_rating ? '#166534' : '#6b7280',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {vendor.avg_overall_rating ?
                        `${Number(vendor.avg_overall_rating).toFixed(1)}/10` :
                        'No ratings'}
                    </div>
                  </div>

                  {/* [R1] [vendor-cost-display] Second row: Pricing Display - Critical Business Value */}
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#059669',
                    backgroundColor: '#f0fdf4',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #bbf7d0',
                    display: 'inline-block'
                  }}>
                    💰 {formatPricingDisplay(vendor)}
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
          vendor={selectedVendor as Vendor} // Type compatibility for modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
          }}
          onSave={handleSaveVendor as (updatedVendor: Partial<Vendor>) => Promise<void>}
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
