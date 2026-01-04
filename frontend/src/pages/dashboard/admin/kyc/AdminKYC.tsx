import React, { useState, useEffect } from 'react';
import { kycAPI, KycDto } from '../../../../api/paymentAPI';
import './AdminKYC.css';

const AdminKYC: React.FC = () => {
    const [pendingKyc, setPendingKyc] = useState<KycDto[]>([]);
    const [allKyc, setAllKyc] = useState<KycDto[]>([]);
    const [selectedKyc, setSelectedKyc] = useState<KycDto | null>(null);
    const [filter, setFilter] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL'>('PENDING');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchKycData();
    }, [filter]);

    const fetchKycData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (filter === 'ALL') {
                const pending = await kycAPI.getPendingKyc();
                const verified = await kycAPI.getKycByStatus('VERIFIED');
                const rejected = await kycAPI.getKycByStatus('REJECTED');
                setAllKyc([...pending.data, ...verified.data, ...rejected.data]);
            } else {
                const response = filter === 'PENDING'
                    ? await kycAPI.getPendingKyc()
                    : await kycAPI.getKycByStatus(filter);
                setAllKyc(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch KYC data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (kyc: KycDto) => {
        if (!window.confirm(`Approve KYC for ${kyc.businessName || 'this seller'}?`)) {
            return;
        }

        try {
            await kycAPI.verifyKyc(kyc.userId);
            alert('KYC approved successfully!');
            fetchKycData();
            setSelectedKyc(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to approve KYC');
        }
    };

    const handleReject = async () => {
        if (!selectedKyc || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            await kycAPI.rejectKyc(selectedKyc.userId, rejectionReason);
            alert('KYC rejected successfully!');
            fetchKycData();
            setSelectedKyc(null);
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject KYC');
        }
    };

    const openRejectModal = (kyc: KycDto) => {
        setSelectedKyc(kyc);
        setShowRejectModal(true);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: 'badge-warning',
            UNDER_REVIEW: 'badge-info',
            VERIFIED: 'badge-success',
            REJECTED: 'badge-danger',
        };
        return badges[status as keyof typeof badges] || 'badge-secondary';
    };

    if (loading) {
        return (
            <div className="admin-kyc-container">
                <div className="loading">Loading KYC submissions...</div>
            </div>
        );
    }

    return (
        <div className="admin-kyc-container">
            <div className="admin-kyc-header">
                <h1>KYC Verification</h1>
                <p>Review and approve seller KYC submissions</p>
            </div>

            {}
            <div className="kyc-filters">
                <button
                    className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setFilter('PENDING')}
                >
                    Pending ({allKyc.filter(k => k.kycStatus === 'PENDING').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'VERIFIED' ? 'active' : ''}`}
                    onClick={() => setFilter('VERIFIED')}
                >
                    Verified
                </button>
                <button
                    className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                    onClick={() => setFilter('REJECTED')}
                >
                    Rejected
                </button>
                <button
                    className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilter('ALL')}
                >
                    All
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {}
            <div className="kyc-list">
                {allKyc.length === 0 ? (
                    <div className="empty-state">
                        <p>No KYC submissions found</p>
                    </div>
                ) : (
                    allKyc.map((kyc) => (
                        <div key={kyc.id} className="kyc-card">
                            <div className="kyc-card-header">
                                <div>
                                    <h3>{kyc.businessName || 'Individual Seller'}</h3>
                                    <p className="kyc-type">{kyc.businessType || 'INDIVIDUAL'}</p>
                                </div>
                                <span className={`status-badge ${getStatusBadge(kyc.kycStatus)}`}>
                                    {kyc.kycStatus}
                                </span>
                            </div>

                            <div className="kyc-card-body">
                                <div className="kyc-info-grid">
                                    <div className="info-item">
                                        <label>PAN Number</label>
                                        <span>{kyc.panNumber}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Aadhaar Number</label>
                                        <span>{kyc.aadhaarNumber || 'Not provided'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>GST Number</label>
                                        <span>{kyc.gstNumber || 'Not provided'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Submitted On</label>
                                        <span>{new Date(kyc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {}
                                <div className="kyc-documents">
                                    <h4>Documents</h4>
                                    <div className="document-links">
                                        {kyc.panDocumentUrl && (
                                            <a href={kyc.panDocumentUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                📄 PAN Document
                                            </a>
                                        )}
                                        {kyc.aadhaarDocumentUrl && (
                                            <a href={kyc.aadhaarDocumentUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                📄 Aadhaar Document
                                            </a>
                                        )}
                                        {kyc.gstCertificateUrl && (
                                            <a href={kyc.gstCertificateUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                📄 GST Certificate
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {kyc.kycStatus === 'REJECTED' && kyc.rejectionReason && (
                                    <div className="rejection-reason">
                                        <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                                    </div>
                                )}

                                {kyc.kycStatus === 'VERIFIED' && kyc.verifiedAt && (
                                    <div className="verification-info">
                                        <strong>Verified on:</strong> {new Date(kyc.verifiedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {}
                            {kyc.kycStatus === 'PENDING' && (
                                <div className="kyc-card-actions">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(kyc)}
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => openRejectModal(kyc)}
                                    >
                                        ✗ Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {}
            {showRejectModal && selectedKyc && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Reject KYC</h2>
                        <p>Provide a reason for rejecting {selectedKyc.businessName || 'this seller'}'s KYC:</p>

                        <textarea
                            className="rejection-textarea"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., PAN document is not clear. Please upload a better quality image."
                            rows={4}
                        />

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm-reject"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                            >
                                Reject KYC
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKYC;
