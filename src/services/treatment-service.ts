import { api } from '@/lib/api-client';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: { timestamp: string };
    error?: { code: string; message: string };
}

// ============================================
// Types
// ============================================

export type TreatmentCategory =
    | 'HORMONE_THERAPY'
    | 'WEIGHT_MANAGEMENT'
    | 'SEXUAL_HEALTH'
    | 'MENTAL_HEALTH'
    | 'LONGEVITY'
    | 'SKIN_HEALTH'
    | 'HAIR_HEALTH'
    | 'SLEEP_OPTIMIZATION'
    | 'COGNITIVE_ENHANCEMENT'
    | 'GENERAL_WELLNESS';

export interface TreatmentListItem {
    id: string;
    name: string;
    slug: string;
    category: TreatmentCategory;
    isActive: boolean;
    priceOneTime: string | null;
    priceSubscription: string | null;
    currency: string;
    createdAt: string;
    updatedAt: string;
    provider: {
        id: string;
        name: string;
    };
    treatmentProviders?: TreatmentProvider[];
    _count: {
        matchingRules: number;
    };
}

export interface TreatmentProvider {
    id: string;
    treatmentId: string;
    providerId: string;
    isPrimary: boolean;
    createdAt: string;
    provider: {
        id: string;
        name: string;
        slug: string;
        status: string;
    };
}

export type MatchingRuleOperator =
    | 'EQUALS'
    | 'NOT_EQUALS'
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'CONTAINS'
    | 'IN_LIST';

export interface MatchingRule {
    id: string;
    treatmentId: string;
    name: string;
    description: string | null;
    field: string;
    operator: MatchingRuleOperator;
    value: string;
    weight: number;
    isRequired: boolean;
    isActive: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
    // New fields
    triggerSource?: string;
    evaluationTiming?: string;
    providerCapabilities?: string[];
    locationConstraints?: string[];
    availabilityStatus?: string;
    linkedTreatments?: string[];
    confidence?: string;
    explanation?: string;
    exclusionReasons?: string[];
}

export interface CreateMatchingRulePayload {
    name: string;
    description?: string;
    field?: string;
    operator?: MatchingRuleOperator;
    value?: string;
    weight?: number;
    isRequired?: boolean;
    isActive?: boolean;
    priority?: number;
    // New fields
    triggerSource?: string;
    evaluationTiming?: string;
    providerCapabilities?: string[];
    locationConstraints?: string[];
    availabilityStatus?: string;
    linkedTreatments?: string[];
    confidence?: string;
    explanation?: string;
    exclusionReasons?: string[];
}

export interface TreatmentDetail {
    id: string;
    providerId: string;
    name: string;
    slug: string;
    description: string | null;
    category: TreatmentCategory;
    supportedCategories: string | null;
    // Recommendation Settings
    includeInMatching: boolean;
    forceRankingOverride: string | null;
    // Solution Properties
    requiresBloodTest: boolean;
    injectionBased: boolean;
    prescriptionRequired: boolean;
    // Eligibility Overview
    requiresBiomarkers: boolean;
    minAge: number | null;
    maxAge: number | null;
    allowedGenders: string[];
    additionalNotes: string | null;
    // Pricing
    priceOneTime: string | null;
    priceSubscription: string | null;
    subscriptionFrequency: string | null;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    provider: {
        id: string;
        name: string;
    };
    treatmentProviders?: TreatmentProvider[];
    matchingRules: MatchingRule[];
    treatmentBiomarkers: TreatmentBiomarker[];
    eligibleProviders: EligibleProvider[];
}

export interface TreatmentBiomarker {
    id: string;
    treatmentId: string;
    biomarkerId: string;
    isRequired: boolean;
    minValue: number | null;
    maxValue: number | null;
    biomarker: {
        id: string;
        name: string;
        slug: string;
        category: string;
    };
}

export interface EligibleProvider {
    id: string;
    name: string;
    slug: string;
    status: string;
    supportedRegions: string[];
}

export interface CreateTreatmentPayload {
    providerId?: string; // Deprecated: use providerIds
    providerIds?: string[]; // New: array of provider IDs
    name: string;
    slug: string;
    description?: string;
    category: TreatmentCategory;
    supportedCategories?: string;
    // Recommendation Settings
    includeInMatching?: boolean;
    forceRankingOverride?: string;
    // Solution Properties
    requiresBloodTest?: boolean;
    injectionBased?: boolean;
    prescriptionRequired?: boolean;
    // Eligibility Overview
    requiresBiomarkers?: boolean;
    minAge?: number | null;
    maxAge?: number | null;
    allowedGenders?: string[];
    additionalNotes?: string;
    // Pricing
    priceOneTime?: number | null;
    priceSubscription?: number | null;
    subscriptionFrequency?: string;
    currency?: string;
    isActive?: boolean;
}

export interface TreatmentFilters {
    status?: string;
    category?: string;
    search?: string;
    providerId?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all treatments (Admin)
 */
export async function getTreatments(
    filters?: TreatmentFilters
): Promise<TreatmentListItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.providerId) params.append('providerId', filters.providerId);

    const res = await api.get(`/treatments/admin/list?${params.toString()}`);

    const data: ApiResponse<TreatmentListItem[]> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch treatments');
    }

    return data.data;
}

/**
 * Get single treatment by ID
 */
export async function getTreatment(id: string): Promise<TreatmentDetail> {
    const res = await api.get(`/treatments/${id}`);

    const data: ApiResponse<TreatmentDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch treatment');
    }

    return data.data;
}

/**
 * Create new treatment
 */
export async function createTreatment(
    payload: CreateTreatmentPayload
): Promise<TreatmentDetail> {
    const res = await api.post('/treatments', payload);

    const data: ApiResponse<TreatmentDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create treatment');
    }

    return data.data;
}

/**
 * Update treatment
 */
export async function updateTreatment(
    id: string,
    payload: Partial<CreateTreatmentPayload>
): Promise<TreatmentDetail> {
    const res = await api.patch(`/treatments/${id}`, payload);

    const data: ApiResponse<TreatmentDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update treatment');
    }

    return data.data;
}

/**
 * Delete treatment
 */
export async function deleteTreatment(id: string): Promise<void> {
    const res = await api.delete(`/treatments/${id}`);

    if (!res.ok) {
        // Try to parse error message
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to delete treatment');
        } catch (e) {
            throw new Error('Failed to delete treatment');
        }
    }
}

/**
 * Create Matching Rule
 */
export async function createMatchingRule(
    treatmentId: string,
    payload: CreateMatchingRulePayload
): Promise<MatchingRule> {
    const res = await api.post(`/treatments/${treatmentId}/rules`, payload);

    const data: ApiResponse<MatchingRule> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create matching rule');
    }

    return data.data;
}

/**
 * Update Matching Rule
 */
export async function updateMatchingRule(
    treatmentId: string,
    ruleId: string,
    payload: Partial<CreateMatchingRulePayload>
): Promise<MatchingRule> {
    const res = await api.patch(`/treatments/${treatmentId}/rules/${ruleId}`, payload);

    const data: ApiResponse<MatchingRule> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update matching rule');
    }

    return data.data;
}

/**
 * Delete Matching Rule
 */
export async function deleteMatchingRule(
    treatmentId: string,
    ruleId: string
): Promise<void> {
    const res = await api.delete(`/treatments/${treatmentId}/rules/${ruleId}`);

    if (!res.ok) {
        try {
            // Attempt to get error message
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to delete matching rule');
        } catch (e) {
            throw new Error('Failed to delete matching rule');
        }
    }
}
