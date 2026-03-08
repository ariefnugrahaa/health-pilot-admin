import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchLabs,
  fetchLab,
  createLab,
  updateLab,
  deleteLab,
  type Lab,
  type CreateLabPayload,
  type UpdateLabPayload,
} from '@/services/lab-service';

import type { UseMutationOptions } from '@tanstack/react-query';

// ============================================
// Query Keys
// ============================================
export const labKeys = {
  all: ['labs'] as const,
  list: (params?: { status?: string; search?: string }) => ['labs', 'list', params] as const,
  detail: (id: string) => ['labs', 'detail', id] as const,
};

// ============================================
// Fetch Labs List
// ============================================
export function useLabs(params?: {
  status?: string;
  search?: string;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: labKeys.list(params),
    queryFn: () => fetchLabs(params),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// Fetch Single Lab
// ============================================
export function useLab(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: labKeys.detail(id),
    queryFn: () => fetchLab(id),
    enabled: isAuthenticated && !!id,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Create Lab Mutation
// ============================================
export function useCreateLab(options?: UseMutationOptions<Lab, Error, CreateLabPayload>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabPayload) => createLab(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all });
    },
    ...options,
  });
}

// ============================================
// Update Lab Mutation
// ============================================
export function useUpdateLab(options?: UseMutationOptions<Lab, Error, { id: string; payload: UpdateLabPayload }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLabPayload }) =>
      updateLab(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: labKeys.all });
      queryClient.invalidateQueries({ queryKey: labKeys.detail(variables.id) });
    },
    ...options,
  });
}

// ============================================
// Toggle Lab Status Mutation
// ============================================
export function useToggleLabStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateLab(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all });
    },
  });
}

// ============================================
// Delete Lab Mutation
// ============================================
export function useDeleteLab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLab(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all });
    },
  });
}
