import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/lib/toast';
import {
    getTreatments,
    getTreatment,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    createMatchingRule,
    updateMatchingRule,
    deleteMatchingRule,
    type TreatmentListItem,
    type TreatmentFilters,
    type TreatmentDetail,
    type CreateTreatmentPayload,
    type CreateMatchingRulePayload,
    type MatchingRule,
} from '@/services/treatment-service';

// ============================================
// Query Keys
// ============================================

export const treatmentKeys = {
    all: ['treatments'] as const,
    lists: () => [...treatmentKeys.all, 'list'] as const,
    list: (filters: TreatmentFilters) => [...treatmentKeys.lists(), filters] as const,
    details: () => [...treatmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...treatmentKeys.details(), id] as const,
};

// ============================================
// Queries
// ============================================

export function useTreatments(filters?: TreatmentFilters) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery<TreatmentListItem[], Error>({
        queryKey: treatmentKeys.list(filters ?? {}),
        queryFn: () => getTreatments(filters),
        enabled: isAuthenticated,
    });
}

export function useTreatment(id: string) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery<TreatmentDetail, Error>({
        queryKey: treatmentKeys.detail(id),
        queryFn: () => getTreatment(id),
        enabled: isAuthenticated && !!id,
    });
}

// ============================================
// Mutations
// ============================================

export function useCreateTreatment() {
    const queryClient = useQueryClient();

    return useMutation<TreatmentDetail, Error, CreateTreatmentPayload>({
        mutationFn: (payload) => createTreatment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
            toast.created('Treatment');
        },
        onError: (error) => {
            toast.createError('treatment', error.message);
        },
    });
}

export function useUpdateTreatment() {
    const queryClient = useQueryClient();

    return useMutation<
        TreatmentDetail,
        Error,
        { id: string; payload: Partial<CreateTreatmentPayload> }
    >({
        mutationFn: ({ id, payload }) => updateTreatment(id, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.id),
            });
            toast.updated('Treatment');
        },
        onError: (error) => {
            toast.updateError('treatment', error.message);
        },
    });
}

export function useDeleteTreatment() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: (id) => deleteTreatment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
            toast.deleted('Treatment');
        },
        onError: (error) => {
            toast.deleteError('treatment', error.message);
        },
    });
}

export function useCreateMatchingRule() {
    const queryClient = useQueryClient();

    return useMutation<
        MatchingRule,
        Error,
        { treatmentId: string; payload: CreateMatchingRulePayload }
    >({
        mutationFn: ({ treatmentId, payload }) => createMatchingRule(treatmentId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
            toast.success('Matching rule created');
        },
        onError: (error) => {
            toast.error('Failed to create matching rule', { description: error.message });
        },
    });
}

export function useUpdateMatchingRule() {
    const queryClient = useQueryClient();

    return useMutation<
        MatchingRule,
        Error,
        { treatmentId: string; ruleId: string; payload: Partial<CreateMatchingRulePayload> }
    >({
        mutationFn: ({ treatmentId, ruleId, payload }) => updateMatchingRule(treatmentId, ruleId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
            toast.success('Matching rule updated');
        },
        onError: (error) => {
            toast.error('Failed to update matching rule', { description: error.message });
        },
    });
}

export function useDeleteMatchingRule() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { treatmentId: string; ruleId: string }>({
        mutationFn: ({ treatmentId, ruleId }) => deleteMatchingRule(treatmentId, ruleId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
            toast.success('Matching rule deleted');
        },
        onError: (error) => {
            toast.error('Failed to delete matching rule', { description: error.message });
        },
    });
}
