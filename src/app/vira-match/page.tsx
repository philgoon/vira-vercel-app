// [R3.1] Professional ViRA Match experience with step-by-step wizard
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vendor } from '@/types';
import ViRAMatchWizard from '@/components/vira-match/ViRAMatchWizard';

export default function ViRAMatchPage() {
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // [R3.1] Load service categories from vendors table
  useEffect(() => {
    async function loadServiceCategories() {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data = await response.json();
          console.log('RAW VENDORS API RESPONSE:', data); // Enhanced DEBUG
          const { vendors }: { vendors: Vendor[] } = data;

          const categories = [...new Set(
            vendors
              ?.flatMap((vendor: Vendor) => {
                // Use the correct field from the updated Vendor type
                const serviceCategory = vendor.vendor_type; // CORRECTED: Was service_category
                if (typeof serviceCategory === 'string' && serviceCategory.trim() !== '') {
                  // Handle comma-separated strings by splitting them
                  return serviceCategory.split(',').map(cat => cat.trim());
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 font-headline">
                ViRA Match
              </h1>
              <p className="mt-2 text-gray-600">
                AI-powered vendor recommendations • {' '}
                <Link
                  href="/"
                  className="font-medium text-blue-900 hover:text-blue-700 underline"
                >
                  Back to Dashboard
                </Link>
              </p>
            </div>
          </div>
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
