// [R1.1] Shared TypeScript interfaces for the application
export interface Vendor {
  vendor_id: number | string; // Handle both formats - database uses different types
  vendor_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  time_zone?: string;
  service_categories: string | string[]; // Handle both formats
  specialties?: string;
  pricing_notes?: string;
  status?: string;
  onboarding_date?: string;
  vendor_notes?: string;
}

export interface Project {
  project_id: string;
  project_title: string;
  project_description?: string;
  project_type?: string;
  client_id?: string;
  expected_deadline?: string;
  key_skills_required?: string;
  initial_vendor_rating?: number;
  industry_experience?: string;
  status: string;
  team_member?: string;
  assigned_vendor_id?: string;
  contact_date?: string;
  updated_at?: string;
}

export interface Client {
  client_id: number | string; // Handle both formats
  client_name: string;
  industry?: string;
  time_zone?: string;
  total_projects?: number;
  preferred_contact?: string;
  client_notes?: string;
  created_date: string;
  updated_at?: string;
}

export interface Rating {
  rating_id?: number;
  project_id: string;
  vendor_id: string;
  client_id?: string;
  rater_email: string;
  project_success_rating: number;
  project_on_time: boolean;
  project_on_budget: boolean;
  vendor_overall_rating: number;
  vendor_quality_rating?: number;
  vendor_communication_rating?: number;
  what_went_well?: string;
  areas_for_improvement?: string;
  recommend_again: boolean;
  rating_date?: string;
}

export interface EnhancedRecommendation {
  vendorName: string;
  viraScore: number;
  reason: string;
  keyStrengths: string[];
  considerations?: string;
}

export interface LegacyRecommendation {
  vendorName: string;
  reason: string;
}

export interface MessageIntent {
  type: 'vendor_recommendation' | 'vendor_search' | 'general';
  searchTerm?: string;
  serviceCategory?: string;
  projectScope?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VendorSearchResult {
  vendor_name: string;
  service_categories: string;
  specialties?: string;
  location?: string;
  contact_name?: string;
  contact_email?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface VendorsApiResponse {
  vendors: Vendor[];
}

export interface ProjectsApiResponse {
  projects: Project[];
}

export interface ClientsApiResponse {
  clients: Client[];
}

export interface RatingsApiResponse {
  ratings: Rating[];
}
