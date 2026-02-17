/**
 * Provider Service
 * Handles all provider-related API calls for the admin dashboard
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ============================================
// Types
// ============================================

export interface ProviderListItem {
    id: string;
    name: string;
    slug: string;
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    supportedRegions: string[];
    logoUrl: string | null;
    acceptsBloodTests: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
        treatments: number;
    };
}

export interface CreateProviderPayload {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    registrationNumber?: string;
    supportedRegions: string[];
    apiEndpoint?: string;
    webhookUrl?: string;
    acceptsBloodTests: boolean;
    commissionRate?: number;
    subscriptionShare?: number;
}

export interface ProviderDetail {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    registrationNumber: string | null;
    supportedRegions: string[];
    apiEndpoint: string | null;
    webhookUrl: string | null;
    acceptsBloodTests: boolean;
    commissionRate: number | null;
    subscriptionShare: number | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: { timestamp: string };
    error?: { code: string; message: string };
}

// ============================================
// Helper
// ============================================

function getAuthHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

// ============================================
// Service Functions
// ============================================

/**
 * Fetch all providers for admin list view
 */
export async function getProviders(
    token: string,
    filters?: { status?: string; search?: string }
): Promise<ProviderListItem[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') {
        params.set('status', filters.status);
    }
    if (filters?.search) {
        params.set('search', filters.search);
    }

    const queryString = params.toString();
    const url = `${API_URL}/providers/admin/list${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
        headers: getAuthHeaders(token),
    });

    const data: ApiResponse<ProviderListItem[]> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch providers');
    }

    return data.data;
}

/**
 * Create a new provider
 */
export async function createProvider(
    token: string,
    payload: CreateProviderPayload
): Promise<ProviderDetail> {
    const res = await fetch(`${API_URL}/providers`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

    const data: ApiResponse<ProviderDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create provider');
    }

    return data.data;
}

/**
 * Update an existing provider
 */
export async function updateProvider(
    token: string,
    id: string,
    payload: Partial<CreateProviderPayload> & { status?: string }
): Promise<ProviderDetail> {
    const res = await fetch(`${API_URL}/providers/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

    const data: ApiResponse<ProviderDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update provider');
    }

    return data.data;
}

// ============================================
// Provider Detail (with Treatments)
// ============================================

export interface ProviderTreatment {
    id: string;
    name: string;
    slug: string;
    category: string;
    isActive: boolean;
    priceOneTime: string | null;
    priceSubscription: string | null;
    currency: string;
    createdAt: string;
}

export interface ProviderWithTreatments extends ProviderDetail {
    treatments: ProviderTreatment[];
}

/**
 * Fetch a single provider by ID with linked treatments (admin only)
 */
export async function getProviderById(
    token: string,
    id: string
): Promise<ProviderWithTreatments> {
    const res = await fetch(`${API_URL}/providers/admin/${id}`, {
        headers: getAuthHeaders(token),
    });

    const data: ApiResponse<ProviderWithTreatments> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch provider');
    }

    return data.data;
}

