-- V9__Update_User_Status_Enum.sql
-- Update users table status column to include SUSPENDED

ALTER TABLE users MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'APPROVED';
