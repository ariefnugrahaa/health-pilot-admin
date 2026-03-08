import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
    getProviders,
    getProviderById,
    createProvider,
    updateProvider,
    generateInviteLink,
    type ProviderListItem,
    type ProviderWithTreatments,
    type CreateProviderPayload,
    type ProviderDetail,
    type InviteProviderPayload,
    type InviteProviderResponse,
} from '@/services/provider-service';

// ============================================
// Query Keys
// ============================================

export const providerKeys = {
    all: ['providers'] as const,
    lists: () => [...providerKeys.all, 'list'] as const,
    list: (filters: { status?: string; search?: string }) =>
        [...providerKeys.lists(), filters] as const,
    details: () => [...providerKeys.all, 'detail'] as const,
    detail: (id: string) => [...providerKeys.details(), id] as const,
};

// ============================================
// Queries
// ============================================

/**
 * Fetch providers list with optional filters.
 * Automatically handles loading, error, caching and refetch.
 */
export function useProviders(filters?: { status?: string; search?: string }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery<ProviderListItem[], Error>({
        queryKey: providerKeys.list(filters ?? {}),
        queryFn: () => getProviders(filters),
        enabled: isAuthenticated,
    });
}

/**
 * Fetch a single provider by ID with linked treatments.
 */
export function useProvider(id: string) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery<ProviderWithTreatments, Error>({
        queryKey: providerKeys.detail(id),
        queryFn: () => getProviderById(id),
        enabled: isAuthenticated && !!id,
    });
}

// ============================================
// Mutations
// ============================================

/**
 * Create a new provider.
 * Automatically invalidates the provider list cache on success.
 */
export function useCreateProvider() {
    const queryClient = useQueryClient();

    return useMutation<ProviderDetail, Error, CreateProviderPayload>({
        mutationFn: (payload) => createProvider(payload),
        onSuccess: () => {
            // Invalidate the list so it refetches with the new provider
            queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
        },
    });
}

/**
 * Update an existing provider.
 * Automatically invalidates both the list and detail cache on success.
 */
export function useUpdateProvider() {
    const queryClient = useQueryClient();

    return useMutation<
        ProviderDetail,
        Error,
        { id: string; payload: Partial<CreateProviderPayload> & { status?: string } }
    >({
        mutationFn: ({ id, payload }) => updateProvider(id, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: providerKeys.detail(variables.id),
            });
        },
    });
}

/**
 * Generate a provider invite link.
 */
export function useGenerateInviteLink() {
    return useMutation<InviteProviderResponse, Error, InviteProviderPayload>({
        mutationFn: (payload) => generateInviteLink(payload),
    });
}
