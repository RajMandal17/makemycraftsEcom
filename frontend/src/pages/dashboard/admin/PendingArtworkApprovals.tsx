import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    Clock, Check, X, RefreshCw, Image as ImageIcon,
    User, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { adminAPI } from '../../../services/adminAPI';

interface PendingArtwork {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    medium: string;
    images: string[];
    approvalStatus?: string;
    moderationNotes?: string;
    createdAt: string;
    artist?: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        profileImage?: string;
    };
}

const PendingArtworkApprovals: React.FC = () => {
    const [pendingArtworks, setPendingArtworks] = useState<PendingArtwork[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedArtwork, setExpandedArtwork] = useState<string | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<PendingArtwork | null>(null);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchPendingArtworks = async () => {
        setIsLoading(true);
        try {
            const artworks = await adminAPI.getPendingArtworks();
            setPendingArtworks(artworks as PendingArtwork[]);
        } catch (error) {
            console.error('Failed to fetch pending artworks:', error);
            toast.error('Failed to load pending artworks');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingArtworks();
    }, []);

    const handleApproveClick = (artwork: PendingArtwork) => {
        setSelectedArtwork(artwork);
        setApproveNotes('');
        setShowApproveModal(true);
    };

    const handleRejectClick = (artwork: PendingArtwork) => {
        setSelectedArtwork(artwork);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleApprove = async () => {
        if (!selectedArtwork) return;

        setIsProcessing(true);
        try {
            
            await adminAPI.approveArtworkWithCategory(selectedArtwork.id, approveNotes || undefined);
            toast.success(`Artwork "${selectedArtwork.title}" approved successfully!`);

            
            setPendingArtworks(prev => prev.filter(a => a.id !== selectedArtwork.id));
            setShowApproveModal(false);
        } catch (error: any) {
            console.error('Failed to approve artwork:', error);
            toast.error(error?.response?.data?.message || 'Failed to approve artwork');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedArtwork || !rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setIsProcessing(true);
        try {
            await adminAPI.rejectArtwork(selectedArtwork.id, rejectReason);
            toast.success(`Artwork "${selectedArtwork.title}" rejected`);

            
            setPendingArtworks(prev => prev.filter(a => a.id !== selectedArtwork.id));
            setShowRejectModal(false);
        } catch (error: any) {
            console.error('Failed to reject artwork:', error);
            toast.error(error?.response?.data?.message || 'Failed to reject artwork');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleExpand = (artworkId: string) => {
        setExpandedArtwork(expandedArtwork === artworkId ? null : artworkId);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-500">Loading pending artworks...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    <h2 className="text-lg font-semibold">Pending Artwork Approvals</h2>
                    <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {pendingArtworks.length} pending
                    </span>
                </div>
                <button
                    onClick={fetchPendingArtworks}
                    className="text-gray-500 hover:text-gray-700"
                    title="Refresh"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            {}
            {pendingArtworks.length === 0 ? (
                <div className="p-8 text-center">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                    <p className="text-gray-500">No pending artworks to review</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {pendingArtworks.map((artwork) => (
                        <div key={artwork.id} className="p-4">
                            {}
                            <div className="flex items-start gap-4">
                                {}
                                <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-lg overflow-hidden">
                                    {artwork.images && artwork.images.length > 0 ? (
                                        <img
                                            src={artwork.images[0]}
                                            alt={artwork.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {artwork.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <User className="h-4 w-4 mr-1" />
                                                {artwork.artist?.firstName} {artwork.artist?.lastName}
                                                <span className="mx-2">•</span>
                                                {artwork.artist?.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleApproveClick(artwork)}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(artwork)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>

                                    {}
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className="text-gray-600">
                                            <strong>Category:</strong>{' '}
                                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                                {artwork.category}
                                            </span>
                                        </span>
                                        <span className="text-gray-600">
                                            <strong>Price:</strong> ₹{artwork.price?.toFixed(2)}
                                        </span>
                                        <span className="text-gray-600">
                                            <strong>Medium:</strong> {artwork.medium}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            Submitted: {new Date(artwork.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {}
                                    {artwork.moderationNotes && (
                                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                                            <AlertTriangle className="h-4 w-4 inline text-amber-500 mr-1" />
                                            <span className="text-amber-700">{artwork.moderationNotes}</span>
                                        </div>
                                    )}

                                    {}
                                    <button
                                        onClick={() => toggleExpand(artwork.id)}
                                        className="text-purple-600 text-sm mt-2 flex items-center hover:underline"
                                    >
                                        {expandedArtwork === artwork.id ? (
                                            <>
                                                <ChevronUp className="h-4 w-4 mr-1" />
                                                Hide Details
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4 mr-1" />
                                                View Details
                                            </>
                                        )}
                                    </button>

                                    {}
                                    {expandedArtwork === artwork.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700 mb-4">
                                                <strong>Description:</strong><br />
                                                {artwork.description}
                                            </p>

                                            {}
                                            {artwork.images && artwork.images.length > 1 && (
                                                <div>
                                                    <strong className="text-sm text-gray-700">All Images:</strong>
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {artwork.images.map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`${artwork.title} - ${idx + 1}`}
                                                                className="h-20 w-20 object-cover rounded border"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {}
            {showApproveModal && selectedArtwork && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            Approve Artwork
                        </h3>

                        <p className="text-gray-600 mb-4">
                            You are about to approve <strong>"{selectedArtwork.title}"</strong>.
                            {selectedArtwork.moderationNotes?.includes('Category') && (
                                <span className="block mt-2 text-amber-600">
                                    ⚠️ This will also activate the pending category: <strong>{selectedArtwork.category}</strong>
                                </span>
                            )}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (optional)
                            </label>
                            <textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                rows={3}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Add any notes for the artist..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                disabled={isProcessing}
                                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve Artwork
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showRejectModal && selectedArtwork && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <X className="h-5 w-5 text-red-500 mr-2" />
                            Reject Artwork
                        </h3>

                        <p className="text-gray-600 mb-4">
                            You are about to reject <strong>"{selectedArtwork.title}"</strong>.
                            The artist will be notified.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Explain why this artwork is being rejected..."
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={isProcessing}
                                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing || !rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Artwork
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingArtworkApprovals;
