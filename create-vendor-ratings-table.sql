-- Create vendor_ratings table
CREATE TABLE IF NOT EXISTS vendor_ratings (
  rating_id TEXT PRIMARY KEY,
  vendor_id TEXT,
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

-- Add some sample rating data
INSERT INTO vendor_ratings (
  rating_id, vendor_id, project_id, client_name, rater_email,
  project_success_rating, project_on_time, project_on_budget,
  vendor_overall_rating, vendor_quality_rating, vendor_communication_rating,
  recommend_again, feedback, created_date
) VALUES
(
  'RATING-1', 'VEN-0007', 'PROJ-sample-1', 'CG Team', 'test@example.com',
  9, true, true, 8, 10, 7, true, 
  'Great quality work, very responsive', NOW()
),
(
  'RATING-2', 'VEN-0030', 'PROJ-sample-2', 'TBA Canada', 'test@example.com',
  10, true, true, 10, 10, 10, true,
  'Excellent vendor, highly recommended', NOW()
),
(
  'RATING-3', 'VEN-0005', 'PROJ-sample-3', 'SGW Law', 'test@example.com',
  8, false, true, 7, 9, 6, true,
  'Good quality but sometimes late on delivery', NOW()
),
(
  'RATING-4', 'VEN-0007', 'PROJ-sample-4', 'CG Team', 'test@example.com',
  8, true, true, 9, 9, 8, true,
  'Consistent quality and reliable', NOW()
),
(
  'RATING-5', 'VEN-0030', 'PROJ-sample-5', 'TBA Canada', 'test@example.com',
  9, true, true, 9, 9, 9, true,
  'Another great project completion', NOW()
);