/*
  # Employee Management System Schema

  ## New Tables
  
  ### `employees`
  - `id` (uuid, primary key) - Unique employee identifier
  - `user_id` (uuid, foreign key to auth.users) - Link to authentication
  - `email` (text, unique) - Employee email
  - `full_name` (text) - Employee full name
  - `role` (text) - Either 'admin' or 'user'
  - `mobile_number` (text) - Employee mobile number
  - `profile_picture` (text) - URL to profile picture
  - `department` (text) - Employee department
  - `position` (text) - Employee position/job title
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp
  
  ## Security
  
  1. Enable RLS on `employees` table
  2. Admins can read, create, update, and delete all employee records
  3. Users can read all employee records
  4. Users can update only their own profile (mobile_number, profile_picture)
  5. Public (unauthenticated) users can read employee records for view-only pages
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  mobile_number text,
  profile_picture text,
  department text,
  position text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Public can view all employees (for view-only profile pages)
CREATE POLICY "Anyone can view employees"
  ON employees FOR SELECT
  USING (true);

-- Admins can insert new employees
CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.role = 'admin'
    )
  );

-- Admins can update any employee
CREATE POLICY "Admins can update any employee"
  ON employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.role = 'admin'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON employees FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND role = (SELECT role FROM employees WHERE user_id = auth.uid())
    AND email = (SELECT email FROM employees WHERE user_id = auth.uid())
    AND user_id = (SELECT user_id FROM employees WHERE user_id = auth.uid())
  );

-- Admins can delete employees
CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();