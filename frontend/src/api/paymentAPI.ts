import axios from 'axios';
import { API_CONFIG } from '../config/api';


const paymentAPI = axios.create({
    baseURL: API_CONFIG.PAYMENT_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});



paymentAPI.interceptors.request.use((config) => {
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export interface KycSubmitRequest {
    businessName?: string;
    businessType?: 'INDIVIDUAL' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
    panNumber: string;
    panDocumentUrl?: string;
    aadhaarNumber?: string;
    aadhaarDocumentUrl?: string;
    gstNumber?: string;
    gstCertificateUrl?: string;
}

export interface KycDto {
    id: string;
    userId: string;
    businessName?: string;
    businessType?: string;
    panNumber: string;
    panDocumentUrl?: string;
    aadhaarNumber?: string; 
    aadhaarDocumentUrl?: string;
    gstNumber?: string;
    gstCertificateUrl?: string;
    kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface KycStatusResponse {
    userId: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | null;
    message: string;
    rejectionReason?: string; 
    canSubmit: boolean;
    canAddBankAccount: boolean;
}

export interface KycVerificationRequest {
    userId: string;
    approved?: boolean;
    rejectionReason?: string;
}


export interface BankAccountRequest {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName?: string;
    branchName?: string;
    accountType?: 'SAVINGS' | 'CURRENT';
}

export interface BankAccountDto {
    id: string;
    sellerKycId: string;
    accountHolderName: string;
    accountNumberMasked: string;
    ifscCode: string;
    bankName?: string;
    branchName?: string;
    accountType?: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
    pennyDropAmount?: number;
    pennyDropReference?: string;
    verifiedAt?: string;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PennyDropResponse {
    bankAccountId: string;
    status: 'PENDING' | 'VERIFIED' | 'FAILED';
    amount?: number;
    reference?: string;
    message: string;
    success: boolean;
}


export const kycAPI = {
    
    submitKyc: (data: KycSubmitRequest) =>
        paymentAPI.post<KycDto>('/api/payment/kyc/submit', data),

    getKycStatus: () =>
        paymentAPI.get<KycStatusResponse>('/api/payment/kyc/status'),

    getKycDetails: () =>
        paymentAPI.get<KycDto>('/api/payment/kyc/details'),

    
    getPendingKyc: () =>
        paymentAPI.get<KycDto[]>('/api/payment/kyc/pending'),

    getKycByStatus: (status: string) =>
        paymentAPI.get<KycDto[]>(`/api/payment/kyc/status/${status}`),

    verifyKyc: (userId: string) =>
        paymentAPI.put<KycDto>(`/api/payment/kyc/verify/${userId}`, null, {
            params: { approve: true }
        }),

    rejectKyc: (userId: string, reason: string) =>
        paymentAPI.put<KycDto>(`/api/payment/kyc/verify/${userId}`, null, {
            params: { approve: false, reason }
        }),

    getUserKyc: (userId: string) =>
        paymentAPI.get<KycDto>(`/api/payment/kyc/user/${userId}`),
};


export const bankAccountAPI = {
    addBankAccount: (data: BankAccountRequest) =>
        paymentAPI.post<BankAccountDto>('/api/payment/bank-accounts', data),

    getBankAccounts: () =>
        paymentAPI.get<BankAccountDto[]>('/api/payment/bank-accounts'),

    getActiveBankAccounts: () =>
        paymentAPI.get<BankAccountDto[]>('/api/payment/bank-accounts/active'),

    getPrimaryBankAccount: () =>
        paymentAPI.get<BankAccountDto>('/api/payment/bank-accounts/primary'),

    getBankAccountById: (accountId: string) =>
        paymentAPI.get<BankAccountDto>(`/api/payment/bank-accounts/${accountId}`),

    setPrimaryAccount: (accountId: string) =>
        paymentAPI.put<BankAccountDto>(`/api/payment/bank-accounts/${accountId}/primary`),

    verifyBankAccount: (accountId: string) =>
        paymentAPI.post<PennyDropResponse>(`/api/payment/bank-accounts/${accountId}/verify`),

    deactivateAccount: (accountId: string) =>
        paymentAPI.put<BankAccountDto>(`/api/payment/bank-accounts/${accountId}/deactivate`),

    deleteBankAccount: (accountId: string) =>
        paymentAPI.delete(`/api/payment/bank-accounts/${accountId}`),
};

export default paymentAPI;
