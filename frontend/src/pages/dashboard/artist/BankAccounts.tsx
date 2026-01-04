import React, { useState, useEffect } from 'react';
import { bankAccountAPI, BankAccountDto, BankAccountRequest } from '../../../api/paymentAPI';
import { Building2, Plus, Check, X, AlertCircle, Trash2, Shield } from 'lucide-react';
import './BankAccounts.css';

const BankAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<BankAccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [verifying, setVerifying] = useState<string | null>(null);

    const [formData, setFormData] = useState<BankAccountRequest>({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'SAVINGS',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const response = await bankAccountAPI.getBankAccounts();
            setAccounts(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching bank accounts:', err);
            setError(err.response?.data?.message || 'Failed to fetch bank accounts');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.accountHolderName.trim()) {
            errors.accountHolderName = 'Account holder name is required';
        }

        if (!formData.accountNumber.trim()) {
            errors.accountNumber = 'Account number is required';
        } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
            errors.accountNumber = 'Invalid account number (9-18 digits)';
        }

        if (!formData.ifscCode.trim()) {
            errors.ifscCode = 'IFSC code is required';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            errors.ifscCode = 'Invalid IFSC code format';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await bankAccountAPI.addBankAccount(formData);
            alert('Bank account added successfully!');
            setShowAddForm(false);
            setFormData({
                accountHolderName: '',
                accountNumber: '',
                ifscCode: '',
                bankName: '',
                branchName: '',
                accountType: 'SAVINGS',
            });
            fetchBankAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add bank account');
        }
    };

    const handleVerify = async (accountId: string) => {
        try {
            setVerifying(accountId);
            const response = await bankAccountAPI.verifyBankAccount(accountId);
            alert(response.data.message);
            fetchBankAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(null);
        }
    };

    const handleSetPrimary = async (accountId: string) => {
        try {
            await bankAccountAPI.setPrimaryAccount(accountId);
            alert('Primary account updated successfully!');
            fetchBankAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to set primary account');
        }
    };

    const handleDeactivate = async (accountId: string) => {
        if (!confirm('Are you sure you want to deactivate this account?')) {
            return;
        }

        try {
            await bankAccountAPI.deactivateAccount(accountId);
            alert('Account deactivated successfully!');
            fetchBankAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to deactivate account');
        }
    };

    const handleDelete = async (accountId: string) => {
        if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
            return;
        }

        try {
            await bankAccountAPI.deleteBankAccount(accountId);
            alert('Account deleted successfully!');
            fetchBankAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete account');
        }
    };

    if (loading) {
        return (
            <div className="bank-accounts-container">
                <div className="loading">Loading bank accounts...</div>
            </div>
        );
    }

    return (
        <div className="bank-accounts-container">
            <div className="bank-accounts-header">
                <h1>Bank Accounts</h1>
                <p>Manage your bank accounts for receiving payments</p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="accounts-actions">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary"
                >
                    <Plus size={20} />
                    {showAddForm ? 'Cancel' : 'Add Bank Account'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-account-form">
                    <h2>Add New Bank Account</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="accountHolderName">Account Holder Name *</label>
                            <input
                                type="text"
                                id="accountHolderName"
                                name="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={handleInputChange}
                                className={validationErrors.accountHolderName ? 'error' : ''}
                                placeholder="Enter account holder name"
                            />
                            {validationErrors.accountHolderName && (
                                <span className="error-text">{validationErrors.accountHolderName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="accountNumber">Account Number *</label>
                            <input
                                type="text"
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                className={validationErrors.accountNumber ? 'error' : ''}
                                placeholder="Enter account number"
                                maxLength={18}
                            />
                            {validationErrors.accountNumber && (
                                <span className="error-text">{validationErrors.accountNumber}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="ifscCode">IFSC Code *</label>
                            <input
                                type="text"
                                id="ifscCode"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleInputChange}
                                className={validationErrors.ifscCode ? 'error' : ''}
                                placeholder="ABCD0123456"
                                maxLength={11}
                                style={{ textTransform: 'uppercase' }}
                            />
                            {validationErrors.ifscCode && (
                                <span className="error-text">{validationErrors.ifscCode}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bankName">Bank Name</label>
                            <input
                                type="text"
                                id="bankName"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleInputChange}
                                placeholder="Enter bank name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="branchName">Branch Name</label>
                            <input
                                type="text"
                                id="branchName"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleInputChange}
                                placeholder="Enter branch name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="accountType">Account Type *</label>
                            <select
                                id="accountType"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleInputChange}
                            >
                                <option value="SAVINGS">Savings</option>
                                <option value="CURRENT">Current</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">
                                Add Account
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="accounts-list">
                {accounts.length === 0 ? (
                    <div className="no-accounts">
                        <Building2 size={48} />
                        <p>No bank accounts added yet</p>
                        <p className="hint">Add a bank account to receive payments</p>
                    </div>
                ) : (
                    accounts.map(account => (
                        <div key={account.id} className={`account-card ${account.isPrimary ? 'primary' : ''}`}>
                            <div className="account-header">
                                <div className="account-info">
                                    <h3>{account.accountHolderName}</h3>
                                    <p className="account-number">
                                        Account: {account.accountNumberMasked}
                                    </p>
                                    <p className="ifsc">IFSC: {account.ifscCode}</p>
                                    {account.bankName && <p className="bank-name">{account.bankName}</p>}
                                </div>
                                <div className="account-badges">
                                    {account.isPrimary && (
                                        <span className="badge primary-badge">
                                            <Check size={16} /> Primary
                                        </span>
                                    )}
                                    <span className={`badge status-${account.verificationStatus.toLowerCase()}`}>
                                        {account.verificationStatus === 'VERIFIED' && <Check size={16} />}
                                        {account.verificationStatus === 'FAILED' && <X size={16} />}
                                        {account.verificationStatus === 'PENDING' && <AlertCircle size={16} />}
                                        {account.verificationStatus}
                                    </span>
                                    {!account.isActive && (
                                        <span className="badge inactive-badge">Inactive</span>
                                    )}
                                </div>
                            </div>

                            <div className="account-actions">
                                {account.verificationStatus === 'PENDING' && account.isActive && (
                                    <button
                                        onClick={() => handleVerify(account.id)}
                                        disabled={verifying === account.id}
                                        className="btn-verify"
                                    >
                                        <Shield size={16} />
                                        {verifying === account.id ? 'Verifying...' : 'Verify Account'}
                                    </button>
                                )}

                                {!account.isPrimary && account.verificationStatus === 'VERIFIED' && account.isActive && (
                                    <button
                                        onClick={() => handleSetPrimary(account.id)}
                                        className="btn-set-primary"
                                    >
                                        <Check size={16} />
                                        Set as Primary
                                    </button>
                                )}

                                {account.isActive && !account.isPrimary && (
                                    <button
                                        onClick={() => handleDeactivate(account.id)}
                                        className="btn-deactivate"
                                    >
                                        <X size={16} />
                                        Deactivate
                                    </button>
                                )}

                                {!account.isPrimary && (
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="btn-delete"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                )}
                            </div>

                            {account.verifiedAt && (
                                <p className="verified-at">
                                    Verified on {new Date(account.verifiedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="info-section">
                <h3>Important Information</h3>
                <ul>
                    <li>Your bank account will be verified using penny drop verification</li>
                    <li>Only verified accounts can receive payments</li>
                    <li>You can have multiple bank accounts, but only one can be primary</li>
                    <li>Payments will be sent to your primary account</li>
                    <li>Ensure all details are accurate to avoid payment delays</li>
                </ul>
            </div>
        </div>
    );
};

export default BankAccounts;
