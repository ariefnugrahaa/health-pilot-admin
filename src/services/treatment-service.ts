const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function getAuthHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

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
    _count: {
        matchingRules: number;
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
    priceOneTime: string | null;
    priceSubscription: string | null;
    subscriptionFrequency: string | null;
    currency: string;
    minAge: number | null;
    maxAge: number | null;
    allowedGenders: string[];
    requiresBloodTest: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    provider: {
        id: string;
        name: string;
    };
    matchingRules: MatchingRule[];
    treatmentBiomarkers: unknown[];
    eligibleProviders: EligibleProvider[];
}

export interface EligibleProvider {
    id: string;
    name: string;
    slug: string;
    status: string;
    supportedRegions: string[];
}

export interface CreateTreatmentPayload {
    providerId: string;
    name: string;
    slug: string;
    description?: string;
    category: TreatmentCategory;
    supportedCategories?: string;
    priceOneTime?: number | null;
    priceSubscription?: number | null;
    subscriptionFrequency?: string;
    currency?: string;
    minAge?: number | null;
    maxAge?: number | null;
    allowedGenders?: string[];
    requiresBloodTest?: boolean;
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
    token: string,
    filters?: TreatmentFilters
): Promise<TreatmentListItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.providerId) params.append('providerId', filters.providerId);

    const res = await fetch(`${API_URL}/treatments/admin/list?${params.toString()}`, {
        headers: getAuthHeaders(token),
    });

    const data: ApiResponse<TreatmentListItem[]> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch treatments');
    }

    return data.data;
}

/**
 * Get single treatment by ID
 */
export async function getTreatment(
    token: string,
    id: string
): Promise<TreatmentDetail> {
    const res = await fetch(`${API_URL}/treatments/${id}`, {
        headers: getAuthHeaders(token),
    });

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
    token: string,
    payload: CreateTreatmentPayload
): Promise<TreatmentDetail> {
    const res = await fetch(`${API_URL}/treatments`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

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
    token: string,
    id: string,
    payload: Partial<CreateTreatmentPayload>
): Promise<TreatmentDetail> {
    const res = await fetch(`${API_URL}/treatments/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

    const data: ApiResponse<TreatmentDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update treatment');
    }

    return data.data;
}

/**
 * Delete treatment
 */
export async function deleteTreatment(
    token: string,
    id: string
): Promise<void> {
    const res = await fetch(`${API_URL}/treatments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });

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
    token: string,
    treatmentId: string,
    payload: CreateMatchingRulePayload
): Promise<MatchingRule> {
    const res = await fetch(`${API_URL}/treatments/${treatmentId}/rules`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

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
    token: string,
    treatmentId: string,
    ruleId: string,
    payload: Partial<CreateMatchingRulePayload>
): Promise<MatchingRule> {
    const res = await fetch(`${API_URL}/treatments/${treatmentId}/rules/${ruleId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

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
    token: string,
    treatmentId: string,
    ruleId: string
): Promise<void> {
    const res = await fetch(`${API_URL}/treatments/${treatmentId}/rules/${ruleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });

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

