-- CLEANUP SCRIPT
-- Delete test data to avoid duplicates before re-inserting

-- 1. Delete Attempts for test users
DELETE FROM attempts 
WHERE user_id IN ('juan.perez@test.com', 'maria.gomez@test.com', 'carlos.lopez@test.com');

-- 2. Delete Test Users
DELETE FROM users 
WHERE id IN ('juan.perez@test.com', 'maria.gomez@test.com', 'carlos.lopez@test.com');
