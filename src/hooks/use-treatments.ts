import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
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
    const accessToken = useAuthStore((s) => s.accessToken);

    return useQuery<TreatmentListItem[], Error>({
        queryKey: treatmentKeys.list(filters ?? {}),
        queryFn: () => {
            if (!accessToken) throw new Error('Not authenticated');
            return getTreatments(accessToken, filters);
        },
        enabled: !!accessToken,
    });
}

export function useTreatment(id: string) {
    const accessToken = useAuthStore((s) => s.accessToken);

    return useQuery<TreatmentDetail, Error>({
        queryKey: treatmentKeys.detail(id),
        queryFn: () => {
            if (!accessToken) throw new Error('Not authenticated');
            return getTreatment(accessToken, id);
        },
        enabled: !!accessToken && !!id,
    });
}

// ============================================
// Mutations
// ============================================

export function useCreateTreatment() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<TreatmentDetail, Error, CreateTreatmentPayload>({
        mutationFn: (payload) => {
            if (!accessToken) throw new Error('Not authenticated');
            return createTreatment(accessToken, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
        },
    });
}

export function useUpdateTreatment() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<
        TreatmentDetail,
        Error,
        { id: string; payload: Partial<CreateTreatmentPayload> }
    >({
        mutationFn: ({ id, payload }) => {
            if (!accessToken) throw new Error('Not authenticated');
            return updateTreatment(accessToken, id, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteTreatment() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: (id) => {
            if (!accessToken) throw new Error('Not authenticated');
            return deleteTreatment(accessToken, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
        },
    });
}

export function useCreateMatchingRule() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<
        MatchingRule,
        Error,
        { treatmentId: string; payload: CreateMatchingRulePayload }
    >({
        mutationFn: ({ treatmentId, payload }) => {
            if (!accessToken) throw new Error('Not authenticated');
            return createMatchingRule(accessToken, treatmentId, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
        },
    });
}

export function useUpdateMatchingRule() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<
        MatchingRule,
        Error,
        { treatmentId: string; ruleId: string; payload: Partial<CreateMatchingRulePayload> }
    >({
        mutationFn: ({ treatmentId, ruleId, payload }) => {
            if (!accessToken) throw new Error('Not authenticated');
            return updateMatchingRule(accessToken, treatmentId, ruleId, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
        },
    });
}

export function useDeleteMatchingRule() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    return useMutation<void, Error, { treatmentId: string; ruleId: string }>({
        mutationFn: ({ treatmentId, ruleId }) => {
            if (!accessToken) throw new Error('Not authenticated');
            return deleteMatchingRule(accessToken, treatmentId, ruleId);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: treatmentKeys.detail(variables.treatmentId),
            });
        },
    });
}

