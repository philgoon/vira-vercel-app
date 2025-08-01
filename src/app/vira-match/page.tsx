// [R3.1] Professional ViRA Match experience with step-by-step wizard
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vendor, VendorsApiResponse } from '@/types';
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
          const data: VendorsApiResponse = await response.json();
          console.log('Vendors API response:', data); // DEBUG
          console.log('First vendor service_categories:', data.vendors?.[0]?.service_categories); // DEBUG

          const categories = [...new Set(
            data.vendors
              ?.map((vendor: Vendor) => {
                const serviceCategories = vendor.service_categories;
                // Handle both array and string formats
                if (Array.isArray(serviceCategories)) {
                  return serviceCategories[0]; // Get first category from array
                } else if (typeof serviceCategories === 'string') {
                  return serviceCategories;
                }
                return null;
              })
              ?.filter((cat: string | null): cat is string => cat !== null && cat.trim() !== '')
          )].sort() as string[];

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
