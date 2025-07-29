// [R5.4] Enhanced Rate Project page with edit mode support
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle, Calendar, User, Building } from 'lucide-react';
import { Project, Vendor, ProjectsApiResponse, VendorsApiResponse } from '@/types';

// [R4.1] Rating form inputs matching HTML form behavior (strings from selects)
type RatingFormInputs = {
  project_id: string; // This will contain the numeric id as a string
  rater_email: string;
  project_success_rating: string;
  project_on_time: 'Yes' | 'No';
  project_on_budget: 'Yes' | 'No';
  vendor_overall_rating: string;
  vendor_quality_rating?: string;
  vendor_communication_rating?: string;
  what_went_well?: string;
  areas_for_improvement?: string;
  recommend_again: 'Yes' | 'No';
};

// [R5.4] Separate component for the main content to use useSearchParams
function RateProjectContent() {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<RatingFormInputs>();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project_id');
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const watchedProjectId = watch('project_id');

  // [R5.4] Load data and handle edit mode
  useEffect(() => {
    async function loadData() {
      try {
        const [projectsResponse, vendorsResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/vendors')
        ]);

        if (projectsResponse.ok && vendorsResponse.ok) {
          const projectsData: ProjectsApiResponse = await projectsResponse.json();
          const vendorsData: VendorsApiResponse = await vendorsResponse.json();

          console.log('Loaded projects:', projectsData.projects?.length || 0, 'projects');
          console.log('Loaded vendors:', vendorsData.vendors?.length || 0, 'vendors');

          // [R5.4] In edit mode, include archived projects; otherwise only completed
          let filteredProjects;
          if (isEditMode) {
            filteredProjects = (projectsData.projects || []).filter(
              (p: Project & { status?: string }) => {
                const status = p.status?.toLowerCase() || '';
                return status === 'archived';
              }
            );
          } else {
            filteredProjects = (projectsData.projects || []).filter(
              (p: Project & { status?: string }) => {
                const status = p.status?.toLowerCase() || '';
                return status === 'completed' || status === 'complete' || status === 'finished' || status === 'done' || status === 'closed';
              }
            );
          }
          
          console.log('Filtered projects found:', filteredProjects.length);
          console.log('Mode:', isEditMode ? 'Edit Mode' : 'Create Mode');
          
          setCompletedProjects(filteredProjects);
          setVendors(vendorsData.vendors || []);
          
          // [R5.4] If project_id is provided via URL, auto-select it
          if (projectIdParam) {
            const project = filteredProjects.find((p: Project) => p.project_id === projectIdParam);
            if (project) {
              setSelectedProject(project);
              setValue('project_id', project.project_id);
              
              // Auto-select vendor
              const vendor = (vendorsData.vendors || []).find((v: Vendor) => 
                String(v.vendor_id) === String(project.assigned_vendor_id)
              );
              if (vendor) {
                setSelectedVendor(vendor);
              }
              
              // [R5.4] In edit mode, load existing rating data
              if (isEditMode) {
                await loadExistingRating(project.project_id);
              }
            }
          }
        } else {
          console.error('Failed to load data:', { 
            projectsStatus: projectsResponse.status, 
            vendorsStatus: vendorsResponse.status 
          });
        }
      } catch (err) {
        setError('Failed to load projects and vendors');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectIdParam, isEditMode, setValue]);

  // [R5.4] Load existing rating data for edit mode
  const loadExistingRating = async (projectId: string) => {
    try {
      const response = await fetch(`/api/ratings?project_id=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const ratings = data.ratings || [];
        
        if (ratings.length > 0) {
          const rating = ratings[0]; // Get the most recent rating
          setExistingRating(rating);
          
          // Pre-fill form with existing data
          setValue('rater_email', rating.rater_email || '');
          setValue('project_success_rating', String(rating.project_success_rating || ''));
          setValue('project_on_time', rating.project_on_time ? 'Yes' : 'No');
          setValue('project_on_budget', rating.project_on_budget ? 'Yes' : 'No');
          setValue('vendor_overall_rating', String(rating.vendor_overall_rating || ''));
          setValue('vendor_quality_rating', String(rating.vendor_quality_rating || ''));
          setValue('vendor_communication_rating', String(rating.vendor_communication_rating || ''));
          setValue('what_went_well', rating.what_went_well || '');
          setValue('areas_for_improvement', rating.areas_for_improvement || '');
          setValue('recommend_again', rating.recommend_again ? 'Yes' : 'No');
          
          console.log('Pre-filled form with existing rating data:', rating);
        }
      }
    } catch (err) {
      console.error('Failed to load existing rating:', err);
    }
  };

  // [R4.1] Handle project selection and auto-populate vendor - REVERTED to correct logic
  useEffect(() => {
    console.log('useEffect triggered:', { watchedProjectId, completedProjectsCount: completedProjects.length });
    
    if (watchedProjectId && watchedProjectId !== '') {
      // [R4.1] Find project by project_id (database primary key)
      const project = completedProjects.find(p => String(p.project_id) === String(watchedProjectId));
      console.log('Project lookup result:', { watchedProjectId, found: !!project, project: project?.project_title });
      setSelectedProject(project || null);
      
      if (project?.assigned_vendor_id) {
        const vendor = vendors.find(v => String(v.vendor_id) === String(project.assigned_vendor_id));
        console.log('Vendor lookup result:', { vendorId: project.assigned_vendor_id, found: !!vendor, vendor: vendor?.vendor_name });
        setSelectedVendor(vendor || null);
      } else {
        setSelectedVendor(null);
      }
    } else {
      setSelectedProject(null);
      setSelectedVendor(null);
    }
  }, [watchedProjectId, completedProjects, vendors]);

  // [R5.4] Handle rating form submission (create or update)
  const onSubmit: SubmitHandler<RatingFormInputs> = async (data) => {
    setSubmitting(true);
    setError(null);

    console.log('Raw form data received:', data);
    console.log('Selected project state:', selectedProject);
    console.log('Edit mode:', isEditMode, 'Existing rating:', existingRating);

    try {
      // [R4.1] Keep project ID as string (database uses text project_id)
      const projectId = data.project_id && data.project_id !== '' ? data.project_id : '';
      const vendorId = selectedProject?.assigned_vendor_id || '';
      const projectSuccessRating = data.project_success_rating && data.project_success_rating !== '' ? parseInt(String(data.project_success_rating)) : 0;
      const vendorOverallRating = data.vendor_overall_rating && data.vendor_overall_rating !== '' ? parseInt(String(data.vendor_overall_rating)) : 0;
      const vendorQualityRating = data.vendor_quality_rating && data.vendor_quality_rating !== '' ? parseInt(String(data.vendor_quality_rating)) : null;
      const vendorCommunicationRating = data.vendor_communication_rating && data.vendor_communication_rating !== '' ? parseInt(String(data.vendor_communication_rating)) : null;

      console.log('Parsed values:', {
        projectId,
        vendorId,
        projectSuccessRating,
        vendorOverallRating,
        vendorQualityRating,
        vendorCommunicationRating
      });

      // [R4.1] Client-side validation before sending
      if (!data.project_id || data.project_id === '' || projectId === '') {
        console.error('Project validation failed:', { 'data.project_id': data.project_id, projectId });
        throw new Error('Please select a valid project.');
      }
      if (!vendorId || vendorId === '') {
        console.error('Vendor validation failed:', { vendorId, selectedProject });
        throw new Error('Selected project has no assigned vendor.');
      }
      if (!data.rater_email || !data.rater_email.trim()) {
        throw new Error('Please enter your email address.');
      }
      if (!data.project_success_rating || data.project_success_rating === '' || projectSuccessRating === 0 || isNaN(projectSuccessRating)) {
        throw new Error('Please rate the project success.');
      }
      if (!data.vendor_overall_rating || data.vendor_overall_rating === '' || vendorOverallRating === 0 || isNaN(vendorOverallRating)) {
        throw new Error('Please rate the vendor overall performance.');
      }
      if (!data.project_on_time) {
        throw new Error('Please specify if the project was delivered on time.');
      }
      if (!data.project_on_budget) {
        throw new Error('Please specify if the project was delivered on budget.');
      }
      if (!data.recommend_again) {
        throw new Error('Please specify if you would recommend this vendor again.');
      }

      // [R5.4] Prepare payload with debugging
      const payload = {
        project_id: projectId,
        vendor_id: vendorId,
        rater_email: data.rater_email,
        project_success_rating: projectSuccessRating,
        project_on_time: data.project_on_time,
        project_on_budget: data.project_on_budget,
        vendor_overall_rating: vendorOverallRating,
        vendor_quality_rating: vendorQualityRating,
        vendor_communication_rating: vendorCommunicationRating,
        what_went_well: data.what_went_well,
        areas_for_improvement: data.areas_for_improvement,
        recommend_again: data.recommend_again
      };

      console.log('Submitting rating payload:', payload);
      console.log('Mode:', isEditMode ? 'UPDATE' : 'CREATE');

      // [R5.4] In edit mode, use PUT to update; otherwise POST to create
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch('/api/rate-project', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // [R4.1] Enhanced error handling with response details
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Rating submitted successfully:', result);

      setSuccess(true);
      
      // [R5.4] In create mode, remove the rated project from the list
      if (!isEditMode) {
        setCompletedProjects(prev => prev.filter(p => p.project_id !== projectId));
      }

    } catch (err: unknown) {
      console.error('Form submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 'bold',
              color: '#1A5276'
            }}>Rate Project</h1>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #1A5276',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 'bold',
              color: '#1A5276'
            }}>Rate Project</h1>
          </div>
        </div>
        <div style={{ padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <CheckCircle style={{ width: '3rem', height: '3rem', color: '#15803d', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#15803d', marginBottom: '0.5rem' }}>
                {isEditMode ? 'Rating Updated Successfully!' : 'Rating Submitted Successfully!'}
              </h3>
              <p style={{ color: '#166534', marginBottom: '1.5rem' }}>
                {isEditMode 
                  ? 'Your rating has been updated successfully.' 
                  : 'Thank you for your feedback. The project has been archived and your rating will help improve future vendor recommendations.'
                }
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link 
                  href="/rate-project"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#15803d',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500'
                  }}
                  onClick={() => setSuccess(false)}
                >
                  {isEditMode ? 'Edit Another Rating' : 'Rate Another Project'}
                </Link>
                <Link 
                  href="/"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#1A5276',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500'
                  }}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              }}>{isEditMode ? 'Edit Project Rating' : 'Rate Project'}</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                {isEditMode 
                  ? 'Update your project and vendor ratings' 
                  : 'Submit ratings for completed projects'
                } • <Link href="/" style={{ fontWeight: '500', color: '#1A5276', textDecoration: 'underline' }}>Back to Dashboard</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          
          {completedProjects.length === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <Star style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                {isEditMode ? 'No Archived Projects' : 'No Completed Projects'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {isEditMode 
                  ? 'There are no archived projects with ratings available for editing at this time.' 
                  : 'There are no completed projects available for rating at this time.'
                }
              </p>
              <Link 
                href="/projects"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500'
                }}
              >
                View All Projects
              </Link>
            </div>
          ) : (
            <div className="professional-card">
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.5rem'
                  }}>{isEditMode ? 'Edit Project Rating' : 'Project Rating Form'}</h2>
                  <p style={{ color: '#6b7280' }}>
                    {isEditMode 
                      ? 'Update your feedback on the project and vendor performance.' 
                      : 'Please provide feedback on the completed project and vendor performance.'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Project Selection */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '1.5rem' 
                  }}>
                    <div>
                      <label htmlFor="project_id" className="form-label">
                        Project <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        id="project_id"
                        {...register('project_id', { required: 'Please select a project.' })}
                        className="form-input"
                      >
                        <option value="">Select a {isEditMode ? 'rated' : 'completed'} project</option>
                        {completedProjects.map((project) => (
                          <option key={project.project_id} value={project.project_id}>
                            {project.project_title}
                          </option>
                        ))}
                      </select>
                      {errors.project_id && (
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                          {errors.project_id.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="rater_email" className="form-label">
                        Your Email <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        id="rater_email"
                        type="email"
                        {...register('rater_email', { required: 'Email is required.' })}
                        className="form-input"
                        placeholder="your.email@company.com"
                      />
                      {errors.rater_email && (
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                          {errors.rater_email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Details Display */}
                  {selectedProject && (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1rem'
                    }}>
                      <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                        Selected Project Details:
                      </h4>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <strong>Title:</strong> {selectedProject.project_title}
                      </p>
                      {selectedProject.project_description && (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          <strong>Description:</strong> {selectedProject.project_description}
                        </p>
                      )}
                      {selectedVendor && (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          <strong>Vendor:</strong> {selectedVendor.vendor_name}
                          {selectedVendor.service_categories && ` (${selectedVendor.service_categories})`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Project Performance Ratings */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                      Project Performance
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '1.5rem' 
                    }}>
                      <div>
                        <label htmlFor="project_success_rating" className="form-label">
                          Project Success Rating (1-10) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          id="project_success_rating"
                          {...register('project_success_rating', { required: 'Please rate the project success.' })}
                          className="form-input"
                        >
                          <option value="">Select rating</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 9 ? '(Excellent)' : i === 4 ? '(Average)' : i === 0 ? '(Poor)' : ''}
                            </option>
                          ))}
                        </select>
                        {errors.project_success_rating && (
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                            {errors.project_success_rating.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="project_on_time" className="form-label">
                          Project Delivered On Time? <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          id="project_on_time"
                          {...register('project_on_time', { required: 'Please specify if project was on time.' })}
                          className="form-input"
                        >
                          <option value="">Select option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.project_on_time && (
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                            {errors.project_on_time.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="project_on_budget" className="form-label">
                          Project Delivered On Budget? <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          id="project_on_budget"
                          {...register('project_on_budget', { required: 'Please specify if project was on budget.' })}
                          className="form-input"
                        >
                          <option value="">Select option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.project_on_budget && (
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                            {errors.project_on_budget.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vendor Performance Ratings */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                      Vendor Performance
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '1.5rem' 
                    }}>
                      <div>
                        <label htmlFor="vendor_overall_rating" className="form-label">
                          Overall Vendor Rating (1-10) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          id="vendor_overall_rating"
                          {...register('vendor_overall_rating', { required: 'Please rate the vendor overall.' })}
                          className="form-input"
                        >
                          <option value="">Select rating</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 9 ? '(Excellent)' : i === 4 ? '(Average)' : i === 0 ? '(Poor)' : ''}
                            </option>
                          ))}
                        </select>
                        {errors.vendor_overall_rating && (
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                            {errors.vendor_overall_rating.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="vendor_quality_rating" className="form-label">
                          Work Quality Rating (1-10) <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Optional</span>
                        </label>
                        <select
                          id="vendor_quality_rating"
                          {...register('vendor_quality_rating')}
                          className="form-input"
                        >
                          <option value="">Select rating</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 9 ? '(Excellent)' : i === 4 ? '(Average)' : i === 0 ? '(Poor)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="vendor_communication_rating" className="form-label">
                          Communication Rating (1-10) <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Optional</span>
                        </label>
                        <select
                          id="vendor_communication_rating"
                          {...register('vendor_communication_rating')}
                          className="form-input"
                        >
                          <option value="">Select rating</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 9 ? '(Excellent)' : i === 4 ? '(Average)' : i === 0 ? '(Poor)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <label htmlFor="recommend_again" className="form-label">
                      Would you recommend this vendor again? <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      id="recommend_again"
                      {...register('recommend_again', { required: 'Please specify if you would recommend this vendor.' })}
                      className="form-input"
                    >
                      <option value="">Select option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.recommend_again && (
                      <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
                        {errors.recommend_again.message}
                      </p>
                    )}
                  </div>

                  {/* Feedback Text Areas */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '1.5rem' 
                  }}>
                    <div>
                      <label htmlFor="what_went_well" className="form-label">
                        What went well? <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Optional</span>
                      </label>
                      <textarea
                        id="what_went_well"
                        {...register('what_went_well')}
                        className="form-textarea"
                        rows={4}
                        placeholder="Describe positive aspects of working with this vendor..."
                      />
                    </div>

                    <div>
                      <label htmlFor="areas_for_improvement" className="form-label">
                        Areas for improvement? <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Optional</span>
                      </label>
                      <textarea
                        id="areas_for_improvement"
                        {...register('areas_for_improvement')}
                        className="form-textarea"
                        rows={4}
                        placeholder="Constructive feedback on areas where the vendor could improve..."
                      />
                    </div>
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
                      disabled={submitting}
                      style={{
                        padding: '0.875rem 3rem',
                        backgroundColor: submitting ? '#6b7280' : '#1A5276',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'background-color 150ms',
                        opacity: submitting ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.currentTarget.style.backgroundColor = '#154466';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.currentTarget.style.backgroundColor = '#1A5276';
                        }
                      }}
                    >
                      {submitting ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            border: '2px solid white',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          {isEditMode ? 'Updating Rating...' : 'Submitting Rating...'}
                        </div>
                      ) : (
                        isEditMode ? 'Update Rating' : 'Submit Rating'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

// [R1] Main page component with Suspense boundary for useSearchParams
export default function RateProjectPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 'bold',
              color: '#1A5276'
            }}>Rate Project</h1>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #1A5276',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading page...</p>
        </div>
      </div>
    }>
      <RateProjectContent />
    </Suspense>
  );
}
