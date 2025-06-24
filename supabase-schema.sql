-- [R3.1] Database schema for ViRA - 4 tables based on CSV data structure

-- Table 1: Vendors
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT,
  primary_contact TEXT,
  email TEXT,
  time_zone TEXT,
  contact_preference TEXT,
  onboarding_date DATE,
  overall_rating DECIMAL(3,2),
  industry TEXT,
  service_category TEXT,
  skills TEXT,
  portfolio_url TEXT,
  sample_work_urls TEXT,
  pricing_structure TEXT,
  rate_cost TEXT,
  availability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'active',
  budget DECIMAL(10,2),
  assigned_vendor_id INTEGER REFERENCES vendors(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Vendor Ratings
CREATE TABLE vendor_ratings (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  turnaround_time_rating INTEGER CHECK (turnaround_time_rating >= 1 AND turnaround_time_rating <= 5),
  feedback TEXT,
  client_name TEXT,
  project_type TEXT,
  project_details TEXT,
  strengths TEXT,
  weaknesses TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Clients (inferred from project data)
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  industry TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key relationship to projects table
ALTER TABLE projects ADD COLUMN client_id INTEGER REFERENCES clients(id);

-- Create indexes for better performance
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_type ON vendors(type);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_projects_client_name ON projects(client_name);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_vendor_ratings_vendor_id ON vendor_ratings(vendor_id);
CREATE INDEX idx_clients_name ON clients(name);

-- Enable Row Level Security (RLS) for security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Allow all operations for authenticated users" ON vendors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON vendor_ratings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON clients
  FOR ALL USING (auth.role() = 'authenticated');
