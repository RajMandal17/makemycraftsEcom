-- V10__Add_Confirmed_Order_Status.sql
-- Add CONFIRMED status to order status enum

-- Modify the orders table to add CONFIRMED to the status enum
ALTER TABLE orders MODIFY COLUMN status 
    ENUM('PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') 
    DEFAULT 'PENDING';
