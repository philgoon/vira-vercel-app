'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Eye } from 'lucide-react';
import { Vendor, VendorsApiResponse } from '@/types';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
              <div key={vendor.vendor_id} className="professional-card" style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                minHeight: '5rem'
              }}>
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
                    
                    {/* Placeholder for ratings - will be added when rating data is available */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No ratings</span>
                    </div>
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

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button 
                    onClick={() => {
                      try {
                        console.log('View button clicked for vendor:', vendor.vendor_id, vendor.vendor_name);
                        router.push(`/vendors/${vendor.vendor_id}`);
                      } catch (error) {
                        console.error('Error navigating to vendor view:', error);
                      }
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
                    View Vendor
                  </button>
                  
                  <button 
                    onClick={() => {
                      try {
                        console.log('Edit button clicked for vendor:', vendor.vendor_id, vendor.vendor_name);
                        router.push(`/vendors/${vendor.vendor_id}/edit`);
                      } catch (error) {
                        console.error('Error navigating to vendor edit:', error);
                      }
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
                    Edit Vendor
                  </button>
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
