export interface Project {
  project_id: string;
  project_title: string;
  client_name: string;
  vendor_id: string;
  vendor_name: string;
  submitted_by: string | null;
  status: string;
  rating_date: string | null;
  project_success_rating: number | null;
  quality_rating: number | null;
  communication_rating: number | null;
  what_went_well: string | null;
  areas_for_improvement: string | null;
  recommend_again: boolean | null;
  project_overall_rating_input: number | null;
  project_overall_rating_calc: number | null;
  created_at: string;
  updated_at: string;
  rating_status: 'Needs Review' | 'Incomplete' | 'Complete' | null;
  timeline_status: 'Early' | 'On-Time' | 'Late' | null; // [R-QW1] Admin-set project timeline performance
}

export interface Vendor {
  vendor_id: string;
  vendor_code?: string | null;
  vendor_name: string;
  vendor_type?: string | null;
  status?: string | null;
  primary_contact?: string | null;
  email?: string | null;
  time_zone?: string | null;
  contact_preference?: string | null;
  onboarding_date?: string | null;
  overall_rating?: number | null;
  industry?: string | null;
  service_category?: string | null; // [DEPRECATED] Use service_categories array instead
  service_categories?: string[] | null; // [R-QW2+C3] Array of service categories for multi-service vendors
  skills?: string | null;
  portfolio_url?: string | null;
  sample_work_urls?: string | null;
  pricing_structure?: string | null;
  rate_cost?: string | null;
  availability?: string | null;
  availability_status?: 'Available' | 'Limited' | 'Unavailable' | 'On Leave' | null; // [R-QW3] Vendor capacity status
  availability_notes?: string | null; // [R-QW3] Optional notes about availability
  available_from?: string | null; // [R-QW3] Date when vendor becomes available (ISO date string)
  record_date?: string | null;
  created_at: string;
  updated_at: string;
  // Fields from vendor_performance view for convenience on main page
  total_projects?: number;
  avg_overall_rating?: number;
}

export interface Client {
  client_key: string;
  client_name: string;
  total_projects: number;
  last_project_date: string;
  profile_id: string
  client_id: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  marketing_brief?: string
  budget_range?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Rating {
  rating_id: string;
  project_id: string;
  vendor_id: string;
  project_success_rating: number;
  quality_rating: number;
  communication_rating: number;
  what_went_well?: string | null;
  areas_for_improvement?: string | null;
  recommend_again: boolean;
  project_overall_rating_input?: number | null;
  project_overall_rating_calc?: number | null;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectsApiResponse {
  projects: Project[];
}

export interface VendorsApiResponse {
  vendors: Vendor[];
}

// Recommendation interfaces for ViRA matching system
export interface ClientRating {
  client: string;
  avgRating: number;
  projectCount: number;
}

export interface EnhancedRecommendation {
  vendorName: string;
  viraScore: number;
  reason: string;
  keyStrengths: string[];
  considerations: string;
  pricingStructure?: string;
  rateCost?: string;
  totalProjects?: number; // [R3] Added totalProjects field for project count display
  clientNames?: string[]; // [R4] Added clientNames field for client display in Experience section - DEPRECATED
  clientRatings?: ClientRating[]; // [R4.1] Enhanced client display with average ratings per client
}

export interface LegacyRecommendation {
  vendorName: string;
  viraScore: number;
  reason: string;
  keyStrengths: string[];
  considerations: string;
  pricingStructure?: string;  // [R2] Added for compatibility with pricing display
  rateCost?: string;          // [R2] Added for compatibility with pricing display
  totalProjects?: number;     // [R3] Added for compatibility with project count display
  clientNames?: string[];     // [R4] Added for compatibility with client display - DEPRECATED
  clientRatings?: ClientRating[]; // [R4.1] Enhanced client display with average ratings per client
}

// [R1] [vendor-cost-display] Enhanced vendor interface for vendor cost display
export interface PricingInfo {
  rate_type: 'per_word' | 'hourly' | 'fixed_project' | 'per_piece';
  rate: number;
  description?: string;
}

export interface EnhancedVendor extends Vendor {
  pricing?: PricingInfo[];
  client_names?: string[];
  enhanced_data?: boolean;
}

// [R1] Enhanced vendors API response interface
export interface EnhancedVendorsApiResponse {
  vendors: EnhancedVendor[];
}

// ============================================================================
// [R-FOUNDATION] Sprint 2: Authentication & User Management Types
// ============================================================================

export type UserRole = 'admin' | 'team' | 'vendor';

export interface UserProfile {
  user_id: string; // UUID from Supabase auth.users
  email: string;
  full_name: string | null;
  role: UserRole;
  vendor_id: string | null; // Links to vendors table for vendor role
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// [C1] Sprint 4: Vendor Portal Types
// ============================================================================

export interface VendorInvite {
  invite_id: string
  email: string
  invite_token: string
  invited_by?: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
  accepted_at?: string
  notes?: string
}

export interface VendorApplication {
  application_id: string
  invite_id?: string
  
  // Basic Information
  vendor_name: string
  email: string
  primary_contact?: string
  phone?: string
  website?: string
  
  // Services & Expertise
  industry?: string
  service_category?: string
  skills?: string
  
  // Pricing
  pricing_structure?: string
  rate_cost?: string
  
  // Availability
  availability?: string
  availability_status?: 'Available' | 'Limited' | 'On Leave' | 'Unavailable'
  available_from?: string
  availability_notes?: string
  
  // Portfolio & Samples
  portfolio_url?: string
  sample_work_urls?: string
  
  // Application Status
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  
  // Metadata
  submitted_at: string
  created_vendor_id?: string
  notes?: string
}

export interface VendorUser {
  vendor_user_id: string
  vendor_id: string
  user_id: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
}
