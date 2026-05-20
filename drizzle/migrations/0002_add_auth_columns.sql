-- Add password_salt and refresh_token columns to users table
ALTER TABLE users ADD COLUMN password_salt TEXT;
ALTER TABLE users ADD COLUMN refresh_token TEXT;
