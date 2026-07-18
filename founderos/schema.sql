-- FounderOS Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor > New Query)

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_phase INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Idea Canvas table
CREATE TABLE IF NOT EXISTS idea_canvas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  problem TEXT,
  target_user TEXT,
  current_solution TEXT,
  unfair_advantage TEXT,
  success_metric TEXT,
  business_model TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Phase Outputs table
CREATE TABLE IF NOT EXISTS phase_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  output_json JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Founder Profiles table
CREATE TABLE IF NOT EXISTS founder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tech_stack TEXT,
  domain_expertise TEXT,
  network TEXT,
  capital_available TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_canvas ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/edit their own projects
CREATE POLICY "users_can_view_own_projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Idea Canvas (scoped via project.user_id)
CREATE POLICY "users_can_view_idea_canvas"
  ON idea_canvas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = idea_canvas.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_idea_canvas"
  ON idea_canvas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = idea_canvas.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_idea_canvas"
  ON idea_canvas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = idea_canvas.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies: Phase Outputs (scoped via project.user_id)
CREATE POLICY "users_can_view_phase_outputs"
  ON phase_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = phase_outputs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_phase_outputs"
  ON phase_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = phase_outputs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies: Founder Profiles (own profile only)
CREATE POLICY "users_can_view_own_profile"
  ON founder_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_profile"
  ON founder_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile"
  ON founder_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_idea_canvas_project_id ON idea_canvas(project_id);
CREATE INDEX idx_phase_outputs_project_id ON phase_outputs(project_id);
CREATE INDEX idx_phase_outputs_phase_number ON phase_outputs(phase_number);
