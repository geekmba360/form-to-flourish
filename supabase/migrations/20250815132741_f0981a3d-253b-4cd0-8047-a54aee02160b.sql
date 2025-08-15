-- Add admin role for andrew@nailyourjobinterview.com
-- First, let's get the user ID from auth.users (we'll need to do this manually)
-- For now, let's create a temporary way to add admin access

-- Insert admin role for the main user
-- Note: You'll need to replace this UUID with your actual user ID from auth.users
-- This is a placeholder that needs to be updated with the real user ID

-- Since we can't directly query auth.users, let's create a more flexible approach
-- We'll add a policy that allows the specific email to act as admin

-- First, let's check if there's a way to identify the user
-- For now, let's add a record assuming a specific user ID pattern