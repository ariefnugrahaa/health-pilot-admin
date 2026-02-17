import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
    getProviders,
    getProviderById,
    createProvider,
    updateProvider,
    type ProviderListItem,
    type ProviderWithTreatments,
    type CreateProviderPayload,
    type ProviderDetail,
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
    const accessToken = useAuthStore((s) => s.accessToken);

    return useQuery<ProviderListItem[], Error>({
        queryKey: providerKeys.list(filters ?? {}),
        queryFn: () => {
            if (!accessToken) throw new Error('Not authenticated');
            return getProviders(accessToken, filters);
        },
        enabled: !!accessToken,
    });
}

/**
 * Fetch a single provider by ID with linked treatments.
 */
export function useProvider(id: string) {
    const accessToken = useAuthStore((s) => s.accessToken);

    return useQuery<ProviderWithTreatments, Error>({
        queryKey: providerKeys.detail(id),
        queryFn: () => {
            if (!accessToken) throw new Error('Not authenticated');
            return getProviderById(accessToken, id);
        },
        enabled: !!accessToken && !!id,
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
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<ProviderDetail, Error, CreateProviderPayload>({
        mutationFn: (payload) => {
            if (!accessToken) throw new Error('Not authenticated');
            return createProvider(accessToken, payload);
        },
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
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<
        ProviderDetail,
        Error,
        { id: string; payload: Partial<CreateProviderPayload> & { status?: string } }
    >({
        mutationFn: ({ id, payload }) => {
            if (!accessToken) throw new Error('Not authenticated');
            return updateProvider(accessToken, id, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: providerKeys.detail(variables.id),
            });
        },
    });
}
