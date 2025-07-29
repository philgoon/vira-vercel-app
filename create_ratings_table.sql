-- Create vendor_ratings table to match your existing system
CREATE TABLE vendor_ratings (
  rating_id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(vendor_id),
  project_id TEXT,
  client_name TEXT,
  rater_email TEXT,
  project_success_rating INTEGER,
  project_on_time BOOLEAN,
  project_on_budget BOOLEAN,
  vendor_overall_rating INTEGER,
  vendor_quality_rating INTEGER,
  vendor_communication_rating INTEGER,
  what_went_well TEXT,
  areas_for_improvement TEXT,
  recommend_again BOOLEAN,
  feedback TEXT,
  strengths TEXT,
  weaknesses TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);