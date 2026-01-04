




ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;


ALTER TABLE orders ADD COLUMN refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN refund_amount DOUBLE;
ALTER TABLE orders ADD COLUMN refund_transaction_id VARCHAR(255);


ALTER TABLE orders ADD COLUMN flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN priority VARCHAR(50);


CREATE INDEX idx_order_refunded ON orders(refunded);
CREATE INDEX idx_order_flagged ON orders(flagged);
CREATE INDEX idx_order_priority ON orders(priority);
