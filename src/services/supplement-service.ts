/**
 * Supplement Service
 * Handles all supplement-related API calls for the admin dashboard
 */

import { api } from '@/lib/api-client';

// ============================================
// Types
// ============================================

export type SupplementCategory =
  | 'VITAMIN'
  | 'MINERAL'
  | 'HERB'
  | 'AMINO_ACID'
  | 'PROBIOTIC'
  | 'OMEGA'
  | 'ENZYME'
  | 'ADAPTOGEN'
  | 'LIFESTYLE_CHANGE'
  | 'OTHER';

export interface SupplementListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: SupplementCategory;
  isActive: boolean;
  affiliateLinks: Record<string, string> | null;
  targetSymptoms: string[];
  targetGoals: string[];
  linkedRetailers: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    supplementMatches: number;
  };
}

export interface SupplementDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: SupplementCategory;
  evidenceLevel: string | null;
  primaryBenefits: string[];
  recommendedDosage: string | null;
  dosageUnit: string | null;
  frequency: string | null;
  targetSymptoms: string[];
  targetGoals: string[];
  targetBiomarkers: string[];
  minAge: number | null;
  maxAge: number | null;
  allowedGenders: string[];
  contraindications: string[];
  interactions: string[];
  sideEffects: string[];
  safetyNotes: string | null;
  affiliateLinks: Record<string, string> | null;
  averagePrice: number | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplementPayload {
  name: string;
  slug: string;
  description?: string;
  category: SupplementCategory;
  evidenceLevel?: string;
  primaryBenefits?: string[];
  recommendedDosage?: string;
  dosageUnit?: string;
  frequency?: string;
  targetSymptoms?: string[];
  targetGoals?: string[];
  targetBiomarkers?: string[];
  minAge?: number | null;
  maxAge?: number | null;
  allowedGenders?: string[];
  contraindications?: string[];
  interactions?: string[];
  sideEffects?: string[];
  safetyNotes?: string;
  affiliateLinks?: Record<string, string>;
  averagePrice?: number | null;
  currency?: string;
  isActive?: boolean;
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
 * Fetch all supplements for admin list view
 */
export async function getSupplements(
  filters?: { status?: string; search?: string }
): Promise<SupplementListItem[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'All') {
    params.set('status', filters.status);
  }
  if (filters?.search) {
    params.set('search', filters.search);
  }

  const queryString = params.toString();
  const url = `/admin/supplements${queryString ? `?${queryString}` : ''}`;

  const res = await api.get(url);

  const data: ApiResponse<SupplementListItem[]> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch supplements');
  }

  return data.data;
}

/**
 * Fetch a single supplement by ID
 */
export async function getSupplementById(id: string): Promise<SupplementDetail> {
  const res = await api.get(`/admin/supplements/${id}`);

  const data: ApiResponse<SupplementDetail> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch supplement');
  }

  return data.data;
}

/**
 * Create a new supplement
 */
export async function createSupplement(
  payload: CreateSupplementPayload
): Promise<SupplementDetail> {
  const res = await api.post('/admin/supplements', payload);

  const data: ApiResponse<SupplementDetail> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to create supplement');
  }

  return data.data;
}

/**
 * Update an existing supplement
 */
export async function updateSupplement(
  id: string,
  payload: Partial<CreateSupplementPayload>
): Promise<SupplementDetail> {
  const res = await api.patch(`/admin/supplements/${id}`, payload);

  const data: ApiResponse<SupplementDetail> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to update supplement');
  }

  return data.data;
}

/**
 * Delete a supplement
 */
export async function deleteSupplement(id: string): Promise<void> {
  const res = await api.delete(`/admin/supplements/${id}`);

  const data: ApiResponse<{ message: string }> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to delete supplement');
  }
}

// ============================================
// Category Helpers
// ============================================

export const SUPPLEMENT_CATEGORIES: { value: SupplementCategory; label: string }[] = [
  { value: 'VITAMIN', label: 'Vitamin' },
  { value: 'MINERAL', label: 'Mineral' },
  { value: 'HERB', label: 'Herb' },
  { value: 'AMINO_ACID', label: 'Amino Acid' },
  { value: 'PROBIOTIC', label: 'Probiotic' },
  { value: 'OMEGA', label: 'Omega' },
  { value: 'ENZYME', label: 'Enzyme' },
  { value: 'ADAPTOGEN', label: 'Adaptogen' },
  { value: 'LIFESTYLE_CHANGE', label: 'Lifestyle Change' },
  { value: 'OTHER', label: 'Other' },
];

export function getCategoryLabel(category: SupplementCategory): string {
  return SUPPLEMENT_CATEGORIES.find((c) => c.value === category)?.label || category;
}
