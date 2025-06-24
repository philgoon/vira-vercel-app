// [R3.1] Simplified ViRA Match form with only 2 fields
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// [R3.1] Simplified form inputs - only 2 fields
type FormInputs = {
  serviceCategory: string;
  projectScope: string;
};

// [R1.4] Define the structure for a single recommendation.
interface Recommendation {
  vendorName: string;
  reason: string;
}

export default function ViRAMatchPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const router = useRouter();

  // [R3.1] Load service categories from vendors table
  useEffect(() => {
    async function loadServiceCategories() {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data = await response.json();
          console.log('Vendors API response:', data); // DEBUG
          console.log('First vendor service_categories:', data.vendors?.[0]?.service_categories); // DEBUG
          
          const categories = [...new Set(
            data.vendors
              ?.map((vendor: any) => {
                const serviceCategories = vendor.service_categories;
                // Handle both array and string formats
                if (Array.isArray(serviceCategories)) {
                  return serviceCategories[0]; // Get first category from array
                } else if (typeof serviceCategories === 'string') {
                  return serviceCategories;
                }
                return null;
              })
              ?.filter((cat: any) => cat && typeof cat === 'string' && cat.trim() !== '')
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

  // [R5.1] Handle simplified form submission with enhanced API
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vira-match-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCategory: data.serviceCategory,
          projectScope: data.projectScope
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations. Please try again.');
      }

      const result = await response.json();
      
      // [R5.1] Pass enhanced recommendations to the results page
      const params = new URLSearchParams();
      params.set('data', JSON.stringify(result.recommendations));
      params.set('enhanced', 'true'); // Flag to indicate enhanced results
      router.push(`/recommendations?${params.toString()}`);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // [R3.1] Render the simplified ViRA Match form
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
              }}>ViRA Match</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                AI-powered vendor recommendations • <Link href="/" style={{ fontWeight: '500', color: '#1A5276', textDecoration: 'underline' }}>Back to Dashboard</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div className="professional-card">
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>Find Your Perfect Vendor</h2>
                <p style={{ color: '#6b7280' }}>
                  Tell us about your project and we'll recommend the best-fit vendors from our network.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Service Category */}
                <div>
                  <label htmlFor="serviceCategory" className="form-label">
                    Service Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="serviceCategory"
                    {...register('serviceCategory', { required: 'Please select a service category.' })}
                    className="form-input"
                    disabled={categoriesLoading}
                    style={{ 
                      backgroundColor: categoriesLoading ? '#f9fafb' : 'white',
                      cursor: categoriesLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select a service category'}
                    </option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.serviceCategory && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                      {errors.serviceCategory.message}
                    </p>
                  )}
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Choose the type of service you need for your project
                  </p>
                </div>

                {/* Project Scope */}
                <div>
                  <label htmlFor="projectScope" className="form-label">
                    Project Scope <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    id="projectScope"
                    {...register('projectScope', { required: 'Please describe your project.' })}
                    className="form-textarea"
                    rows={6}
                    placeholder="Describe your project in detail... Include goals, requirements, timeline, special considerations, and any specific expertise needed."
                  />
                  {errors.projectScope && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                      {errors.projectScope.message}
                    </p>
                  )}
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    The more detail you provide, the better our AI can match you with the right vendors
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div style={{
                    borderRadius: '0.375rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '1rem'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</div>
                  </div>
                )}

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isLoading || categoriesLoading}
                    style={{
                      padding: '0.875rem 3rem',
                      backgroundColor: (isLoading || categoriesLoading) ? '#6b7280' : '#1A5276',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: (isLoading || categoriesLoading) ? 'not-allowed' : 'pointer',
                      transition: 'background-color 150ms',
                      opacity: (isLoading || categoriesLoading) ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && !categoriesLoading) {
                        e.currentTarget.style.backgroundColor = '#154466';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && !categoriesLoading) {
                        e.currentTarget.style.backgroundColor = '#1A5276';
                      }
                    }}
                  >
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Finding Your Perfect Match...
                      </div>
                    ) : (
                      'Get Vendor Recommendations'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* How It Works */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#E8F4F8',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A5276' }}>1</span>
              </div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Choose Category
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Select the service category that best fits your project needs
              </p>
            </div>

            <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#F0F4F1',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6B8F71' }}>2</span>
              </div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Describe Project
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Provide detailed information about your project scope and requirements
              </p>
            </div>

            <div className="professional-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#FEF3C7',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D97706' }}>3</span>
              </div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Get Matches
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Our AI analyzes your needs and recommends the best vendor matches
              </p>
            </div>
          </div>
        </div>
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
