// [R3.1] Professional ViRA Match experience with step-by-step wizard
'use client';

import { useState, useEffect } from 'react';
import { Vendor } from '@/types';
import ViRAMatchWizard from '@/components/vira-match/ViRAMatchWizard';

export default function ViRAMatchPage() {
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // [R3.1] [R-QW2+C3] Load service categories from vendors table using new service_categories array
  useEffect(() => {
    async function loadServiceCategories() {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data = await response.json();
          console.log('RAW VENDORS API RESPONSE:', data); // Enhanced DEBUG
          const { vendors }: { vendors: Vendor[] } = data;

          // [R-QW2+C3] Extract unique categories from service_categories array field
          const categories = [...new Set(
            vendors
              ?.flatMap((vendor: Vendor) => {
                // Use new service_categories array field (preferred)
                if (vendor.service_categories && Array.isArray(vendor.service_categories)) {
                  return vendor.service_categories.filter(cat => cat && cat.trim() !== '');
                }
                // Fallback to old service_category field for backwards compatibility
                const legacyCategory = vendor.service_category || vendor.vendor_type;
                if (typeof legacyCategory === 'string' && legacyCategory.trim() !== '') {
                  // Handle comma-separated strings by splitting them
                  return legacyCategory.split(',').map(cat => cat.trim());
                }
                return []; // Return an empty array if no category, flatMap will remove it
              })
              .filter((cat): cat is string => !!cat) // Filter out any empty or null categories
          )].sort();

          console.log('Extracted categories:', categories); // DEBUG
          setServiceCategories(categories);
        }
      } catch (err) {
        console.error('Failed to load service categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadServiceCategories();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276'
          }}>
            ViRA Match
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <ViRAMatchWizard
          serviceCategories={serviceCategories}
          categoriesLoading={categoriesLoading}
        />
      </div>
    </div>
  );
}
