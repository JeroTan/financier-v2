-- Add personality column to users table
ALTER TABLE users ADD COLUMN personality TEXT NOT NULL DEFAULT 'default';
