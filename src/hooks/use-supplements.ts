import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
  getSupplements,
  getSupplementById,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  type SupplementListItem,
  type SupplementDetail,
  type CreateSupplementPayload,
} from '@/services/supplement-service';

// ============================================
// Query Keys
// ============================================

export const supplementKeys = {
  all: ['supplements'] as const,
  lists: () => [...supplementKeys.all, 'list'] as const,
  list: (filters: { status?: string; search?: string }) =>
    [...supplementKeys.lists(), filters] as const,
  details: () => [...supplementKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplementKeys.details(), id] as const,
};

// ============================================
// Queries
// ============================================

/**
 * Fetch supplements list with optional filters.
 */
export function useSupplements(filters?: { status?: string; search?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<SupplementListItem[], Error>({
    queryKey: supplementKeys.list(filters ?? {}),
    queryFn: () => getSupplements(filters),
    enabled: isAuthenticated,
  });
}

/**
 * Fetch a single supplement by ID.
 */
export function useSupplement(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<SupplementDetail, Error>({
    queryKey: supplementKeys.detail(id),
    queryFn: () => getSupplementById(id),
    enabled: isAuthenticated && !!id,
  });
}

// ============================================
// Mutations
// ============================================

/**
 * Create a new supplement.
 */
export function useCreateSupplement() {
  const queryClient = useQueryClient();

  return useMutation<SupplementDetail, Error, CreateSupplementPayload>({
    mutationFn: (payload) => createSupplement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.lists() });
    },
  });
}

/**
 * Update an existing supplement.
 */
export function useUpdateSupplement() {
  const queryClient = useQueryClient();

  return useMutation<
    SupplementDetail,
    Error,
    { id: string; payload: Partial<CreateSupplementPayload> }
  >({
    mutationFn: ({ id, payload }) => updateSupplement(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: supplementKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Delete a supplement.
 */
export function useDeleteSupplement() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteSupplement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.lists() });
    },
  });
}

/**
 * Toggle supplement active status.
 */
export function useToggleSupplementStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    SupplementDetail,
    Error,
    { id: string; isActive: boolean }
  >({
    mutationFn: ({ id, isActive }) => updateSupplement(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.lists() });
    },
  });
}
