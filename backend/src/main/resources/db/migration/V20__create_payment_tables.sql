



CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    gateway VARCHAR(50) NOT NULL,
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL,
    failure_reason TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    metadata JSON,
    initiated_at DATETIME NOT NULL,
    completed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_payments_order_id (order_id),
    INDEX idx_payments_customer_id (customer_id),
    INDEX idx_payments_gateway_payment_id (gateway_payment_id),
    INDEX idx_payments_status (payment_status),
    INDEX idx_payments_idempotency_key (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS payment_splits (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL,
    order_item_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_commission_rate DECIMAL(5, 2) DEFAULT 5.00,
    platform_commission DECIMAL(10, 2) NOT NULL,
    seller_amount DECIMAL(10, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) DEFAULT 18.00,
    gst_on_commission DECIMAL(10, 2) DEFAULT 0.00,
    gst_amount DECIMAL(10, 2) DEFAULT 0.00,
    base_amount DECIMAL(10, 2),
    tds_rate DECIMAL(5, 2) DEFAULT 1.00,
    tds_deducted DECIMAL(10, 2) DEFAULT 0.00,
    net_seller_amount DECIMAL(10, 2) NOT NULL,
    split_status VARCHAR(50) DEFAULT 'PENDING',
    hold_until DATETIME,
    hold_reason VARCHAR(100),
    hold_status VARCHAR(50) DEFAULT 'NONE',
    gst_invoice_number VARCHAR(50),
    gst_invoice_url VARCHAR(500),
    tds_deduction_id VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_splits_payment_id (payment_id),
    INDEX idx_splits_seller_id (seller_id),
    INDEX idx_splits_status (split_status),
    INDEX idx_splits_hold_status (hold_status),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    refund_amount DECIMAL(12, 2) NOT NULL,
    original_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    gateway_refund_id VARCHAR(100),
    reason TEXT,
    failure_reason TEXT,
    is_partial BOOLEAN DEFAULT FALSE,
    initiated_by VARCHAR(36),
    processed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_refunds_payment_id (payment_id),
    INDEX idx_refunds_order_id (order_id),
    INDEX idx_refunds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS payouts (
    id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    gateway_payout_id VARCHAR(100),
    gateway_transfer_id VARCHAR(100),
    bank_account_id VARCHAR(100),
    failure_reason TEXT,
    scheduled_at DATETIME,
    processed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_payouts_seller_id (seller_id),
    INDEX idx_payouts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS seller_kyc (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(255),
    business_type VARCHAR(50),
    pan_number VARCHAR(10) NOT NULL,
    pan_document_url VARCHAR(500),
    aadhaar_number VARCHAR(12),
    aadhaar_document_url VARCHAR(500),
    gst_number VARCHAR(15),
    gst_certificate_url VARCHAR(500),
    kyc_status VARCHAR(50) DEFAULT 'PENDING',
    rejection_reason TEXT,
    verified_at DATETIME,
    verified_by VARCHAR(36),
    tds_exempt BOOLEAN DEFAULT FALSE,
    yearly_earnings DECIMAL(12, 2) DEFAULT 0.00,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_kyc_user_id (user_id),
    INDEX idx_kyc_status (kyc_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS seller_bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    seller_kyc_id VARCHAR(36) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_type VARCHAR(50) DEFAULT 'SAVINGS',
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    penny_drop_amount DECIMAL(5, 2),
    penny_drop_reference VARCHAR(100),
    verified_at DATETIME,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_bank_seller_kyc (seller_kyc_id),
    INDEX idx_bank_verification_status (verification_status),
    FOREIGN KEY (seller_kyc_id) REFERENCES seller_kyc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    account_id VARCHAR(50),
    debit_amount DECIMAL(12, 2) NOT NULL,
    credit_amount DECIMAL(12, 2) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    description TEXT,
    metadata TEXT,
    created_at DATETIME NOT NULL,
    INDEX idx_ledger_transaction_id (transaction_id),
    INDEX idx_ledger_account_type (account_type),
    INDEX idx_ledger_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
