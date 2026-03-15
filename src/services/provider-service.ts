/**
 * Provider Service
 * Handles all provider-related API calls for the admin dashboard
 */

import { api } from '@/lib/api-client';
import type { ProviderCategory } from '@/lib/provider-categories';

// ============================================
// Types
// ============================================

export interface ProviderListItem {
    id: string;
    name: string;
    slug: string;
    category: ProviderCategory | null;
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
    category?: ProviderCategory;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    businessName?: string;
    providerType?: string;
    contactEmail?: string;
    contactPhone?: string;
    registrationNumber?: string;
    supportedRegions: string[];
    apiEndpoint?: string;
    webhookUrl?: string;
    acceptsBloodTests: boolean;
    affiliateLink?: string;
    commissionRate?: number;
    subscriptionShare?: number;
}

export interface ProviderDetail {
    id: string;
    name: string;
    slug: string;
    category: ProviderCategory | null;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    businessName: string | null;
    providerType: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    registrationNumber: string | null;
    supportedRegions: string[];
    apiEndpoint: string | null;
    webhookUrl: string | null;
    acceptsBloodTests: boolean;
    affiliateLink: string | null;
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
// Service Functions
// ============================================

/**
 * Fetch all providers for admin list view
 */
export async function getProviders(
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
    const url = `/providers/admin/list${queryString ? `?${queryString}` : ''}`;

    const res = await api.get(url);

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
    payload: CreateProviderPayload
): Promise<ProviderDetail> {
    const res = await api.post('/providers', payload);

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
    id: string,
    payload: Partial<CreateProviderPayload> & { status?: string }
): Promise<ProviderDetail> {
    const res = await api.patch(`/providers/${id}`, payload);

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
export async function getProviderById(id: string): Promise<ProviderWithTreatments> {
    const res = await api.get(`/providers/admin/${id}`);

    const data: ApiResponse<ProviderWithTreatments> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch provider');
    }

    return data.data;
}

// ============================================
// Provider Invite Functions
// ============================================

export interface InviteProviderPayload {
    category?: ProviderCategory;
    email?: string;
    expiresInDays?: number; // Default 7 days
    isReusable?: boolean;
    notes?: string;
}

export interface InviteProviderResponse {
    inviteId: string;
    inviteToken: string;
    inviteUrl: string;
    expiresAt: string;
    category: ProviderCategory | null;
}

/**
 * Generate a provider invite link (admin only)
 */
export async function generateInviteLink(
    payload: InviteProviderPayload
): Promise<InviteProviderResponse> {
    const res = await api.post('/providers/invite/generate', payload);

    const data: ApiResponse<InviteProviderResponse> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate invite link');
    }

    return data.data;
}

// ============================================
// Public Provider Onboarding (no auth required)
// ============================================

export interface OnboardingFormData {
    // Basic Info
    name: string;
    category: ProviderCategory;
    businessName: string;
    providerType: string;
    description: string;
    websiteUrl: string;
    logoUrl?: string;

    // Contact Info
    contactEmail: string;
    contactPhone: string;

    // Business Details
    registrationNumber: string;
    supportedRegions: string[];
    acceptsBloodTests: boolean;

    // Optional Integration Details
    apiEndpoint?: string;
    webhookUrl?: string;

    // Affiliate Settings
    affiliateLink?: string;
    commissionRate?: number;
    subscriptionShare?: number;
}

export interface ValidateInviteResponse {
    valid: boolean;
    inviteId: string;
    email: string | null;
    expiresAt: string;
    category: ProviderCategory | null;
}

/**
 * Validate an invite token (public, no auth)
 */
export async function validateInviteToken(token: string): Promise<ValidateInviteResponse> {
    const res = await api.get(`/providers/invite/validate?token=${token}`, { skipAuthRefresh: true });

    const data: ApiResponse<ValidateInviteResponse> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Invalid or expired invite');
    }

    return data.data;
}

/**
 * Submit provider onboarding form (public, no auth)
 */
export async function submitOnboardingForm(
    inviteToken: string,
    formData: OnboardingFormData
): Promise<{ success: boolean; providerId: string; message: string }> {
    const res = await api.post(`/providers/invite/${inviteToken}/submit`, formData, { skipAuthRefresh: true });

    const data: ApiResponse<{ providerId: string; message: string }> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit onboarding form');
    }

    return { success: true, ...data.data };
}
