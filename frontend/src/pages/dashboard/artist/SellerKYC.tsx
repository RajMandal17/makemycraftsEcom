import React, { useState, useEffect } from 'react';
import { kycAPI, KycSubmitRequest, KycStatusResponse } from '../../../api/paymentAPI';
import { API_CONFIG } from '../../../config/api';
import './SellerKYC.css';

const SellerKYC: React.FC = () => {
    const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<KycSubmitRequest>({
        businessName: '',
        businessType: 'INDIVIDUAL',
        panNumber: '',
        panDocumentUrl: '',
        aadhaarNumber: '',
        aadhaarDocumentUrl: '',
        gstNumber: '',
        gstCertificateUrl: '',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [uploadingFile, setUploadingFile] = useState<string | null>(null); // Track which file is being uploaded

    useEffect(() => {
        fetchKycStatus();
    }, []);

    const fetchKycStatus = async () => {
        try {
            setLoading(true);
            const response = await kycAPI.getKycStatus();
            setKycStatus(response.data);
        } catch (err: any) {
            // If KYC not found, user can submit
            if (err.response?.status === 404) {
                setKycStatus({
                    userId: '',
                    status: null,
                    message: 'KYC not submitted yet',
                    canSubmit: true,
                    canAddBankAccount: false,
                });
            } else {
                setError(err.response?.data?.message || 'Failed to fetch KYC status');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, fieldName: string) => {
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and PDF files are allowed');
            return;
        }

        try {
            setUploadingFile(fieldName);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'kyc-documents');

            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();

            // Update form data with the uploaded file URL
            setFormData(prev => ({ ...prev, [fieldName]: data.url }));
            alert(`${file.name} uploaded successfully!`);

        } catch (err: any) {
            console.error('Upload error:', err);
            alert(`Failed to upload file: ${err.message}`);
        } finally {
            setUploadingFile(null);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // PAN validation
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!formData.panNumber) {
            errors.panNumber = 'PAN number is required';
        } else if (!panRegex.test(formData.panNumber)) {
            errors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
        }

        // Aadhaar validation (optional but if provided, must be valid)
        if (formData.aadhaarNumber) {
            const aadhaarRegex = /^[0-9]{12}$/;
            if (!aadhaarRegex.test(formData.aadhaarNumber)) {
                errors.aadhaarNumber = 'Invalid Aadhaar format (12 digits)';
            }
        }

        // GST validation (optional but if provided, must be valid)
        if (formData.gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(formData.gstNumber)) {
                errors.gstNumber = 'Invalid GST format (e.g., 22ABCDE1234F1Z5)';
            }
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
            setSubmitting(true);
            setError(null);
            await kycAPI.submitKyc(formData);
            alert('KYC submitted successfully! Please wait for admin approval.');
            fetchKycStatus();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit KYC');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="seller-kyc-container">
                <div className="loading">Loading KYC status...</div>
            </div>
        );
    }

    // Show status if KYC already submitted
    if (kycStatus && kycStatus.status && kycStatus.status !== 'REJECTED') {
        return (
            <div className="seller-kyc-container">
                <div className="kyc-status-card">
                    <div className={`status-icon status-${kycStatus.status.toLowerCase()}`}>
                        {kycStatus.status === 'PENDING' && '⏳'}
                        {kycStatus.status === 'UNDER_REVIEW' && '🔍'}
                        {kycStatus.status === 'VERIFIED' && '✓'}
                    </div>
                    <h2>KYC Status: {kycStatus.status}</h2>
                    <p className="status-message">{kycStatus.message}</p>

                    {kycStatus.status === 'VERIFIED' && (
                        <div className="success-actions">
                            <p className="success-text">✓ Your KYC has been verified!</p>
                            <p>You can now add your bank account to receive payments.</p>
                            <a href="/dashboard/artist/bank-accounts" className="btn-primary">
                                Add Bank Account
                            </a>
                        </div>
                    )}

                    {kycStatus.status === 'PENDING' && (
                        <div className="pending-info">
                            <p>Your KYC submission is being reviewed by our team.</p>
                            <p>This usually takes 1-2 business days.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Show form for new submission or resubmission after rejection
    return (
        <div className="seller-kyc-container">
            <div className="kyc-form-header">
                <h1>KYC Verification</h1>
                <p>Complete your KYC to start selling on our platform</p>
                {kycStatus?.status === 'REJECTED' && (
                    <div className="rejection-notice">
                        <div className="rejection-header">
                            <span className="rejection-icon">⚠️</span>
                            <strong>KYC Application Rejected</strong>
                        </div>
                        {kycStatus.rejectionReason && (
                            <div className="rejection-reason">
                                <strong>Rejection Reason:</strong>
                                <p>{kycStatus.rejectionReason}</p>
                            </div>
                        )}
                        <p className="rejection-action">Please correct the issues mentioned above and resubmit your application.</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="kyc-form">
                {/* Business Information */}
                <div className="form-section">
                    <h3>Business Information</h3>

                    <div className="form-group">
                        <label htmlFor="businessType">Business Type *</label>
                        <select
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleInputChange}
                            className="form-control"
                        >
                            <option value="INDIVIDUAL">Individual</option>
                            <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                            <option value="PARTNERSHIP">Partnership</option>
                            <option value="PRIVATE_LIMITED">Private Limited</option>
                            <option value="PUBLIC_LIMITED">Public Limited</option>
                        </select>
                    </div>

                    {formData.businessType !== 'INDIVIDUAL' && (
                        <div className="form-group">
                            <label htmlFor="businessName">Business Name</label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Enter your business name"
                            />
                        </div>
                    )}
                </div>

                {/* PAN Details */}
                <div className="form-section">
                    <h3>PAN Details *</h3>

                    <div className="form-group">
                        <label htmlFor="panNumber">PAN Number *</label>
                        <input
                            type="text"
                            id="panNumber"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            className={`form-control ${validationErrors.panNumber ? 'error' : ''}`}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            style={{ textTransform: 'uppercase' }}
                        />
                        {validationErrors.panNumber && (
                            <span className="error-text">{validationErrors.panNumber}</span>
                        )}
                        <small className="form-hint">Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="panDocument">PAN Document (Optional)</label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="panDocument"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'panDocumentUrl');
                                }}
                                className="file-input"
                                disabled={uploadingFile === 'panDocumentUrl'}
                            />
                            {uploadingFile === 'panDocumentUrl' && (
                                <span className="uploading-text">Uploading...</span>
                            )}
                            {formData.panDocumentUrl && !uploadingFile && (
                                <div className="uploaded-file">
                                    ✓ Document uploaded
                                    <a href={formData.panDocumentUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                                        View
                                    </a>
                                </div>
                            )}
                        </div>
                        <small className="form-hint">Upload your PAN card (JPG, PNG, or PDF, max 10MB)</small>
                    </div>
                </div>

                {/* Aadhaar Details */}
                <div className="form-section">
                    <h3>Aadhaar Details (Optional)</h3>

                    <div className="form-group">
                        <label htmlFor="aadhaarNumber">Aadhaar Number</label>
                        <input
                            type="text"
                            id="aadhaarNumber"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleInputChange}
                            className={`form-control ${validationErrors.aadhaarNumber ? 'error' : ''}`}
                            placeholder="123456789012"
                            maxLength={12}
                        />
                        {validationErrors.aadhaarNumber && (
                            <span className="error-text">{validationErrors.aadhaarNumber}</span>
                        )}
                        <small className="form-hint">12-digit Aadhaar number</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="aadhaarDocument">Aadhaar Document</label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="aadhaarDocument"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'aadhaarDocumentUrl');
                                }}
                                className="file-input"
                                disabled={uploadingFile === 'aadhaarDocumentUrl'}
                            />
                            {uploadingFile === 'aadhaarDocumentUrl' && (
                                <span className="uploading-text">Uploading...</span>
                            )}
                            {formData.aadhaarDocumentUrl && !uploadingFile && (
                                <div className="uploaded-file">
                                    ✓ Document uploaded
                                    <a href={formData.aadhaarDocumentUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                                        View
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GST Details */}
                <div className="form-section">
                    <h3>GST Details (Optional)</h3>

                    <div className="form-group">
                        <label htmlFor="gstNumber">GST Number</label>
                        <input
                            type="text"
                            id="gstNumber"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            className={`form-control ${validationErrors.gstNumber ? 'error' : ''}`}
                            placeholder="22ABCDE1234F1Z5"
                            maxLength={15}
                            style={{ textTransform: 'uppercase' }}
                        />
                        {validationErrors.gstNumber && (
                            <span className="error-text">{validationErrors.gstNumber}</span>
                        )}
                        <small className="form-hint">15-character GST number (required for businesses)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gstCertificate">GST Certificate</label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="gstCertificate"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'gstCertificateUrl');
                                }}
                                className="file-input"
                                disabled={uploadingFile === 'gstCertificateUrl'}
                            />
                            {uploadingFile === 'gstCertificateUrl' && (
                                <span className="uploading-text">Uploading...</span>
                            )}
                            {formData.gstCertificateUrl && !uploadingFile && (
                                <div className="uploaded-file">
                                    ✓ Document uploaded
                                    <a href={formData.gstCertificateUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                                        View
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit KYC'}
                    </button>
                </div>

                <div className="form-footer">
                    <p className="info-text">
                        <strong>Note:</strong> All information will be verified by our team.
                        Please ensure all details are accurate and documents are clear.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SellerKYC;
