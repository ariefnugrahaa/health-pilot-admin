import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
    getIntakeFlows,
    getIntakeFlow,
    createIntakeFlow,
    updateIntakeFlow,
    deleteIntakeFlow,
    publishIntakeFlow,
    archiveIntakeFlow,
    setDefaultIntakeFlow,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    createField,
    updateField,
    deleteField,
    reorderFields,
    type IntakeFlow,
    type CreateIntakeFlowInput,
    type UpdateIntakeFlowInput,
    type CreateSectionInput,
    type UpdateSectionInput,
    type CreateFieldInput,
    type UpdateFieldInput,
} from '@/services/intake-service';

// ============================================
// Types
// ============================================

export interface IntakeFlowFilters {
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    assignedTo?: string;
}

// ============================================
// Intake Flow Queries
// ============================================

export function useIntakeFlows(filters?: IntakeFlowFilters, options?: UseQueryOptions<IntakeFlow[], Error>) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: ['intake-flows', filters],
        queryFn: () => getIntakeFlows(filters),
        enabled: isAuthenticated,
        ...options,
    });
}

export function useIntakeFlow(id: string, options?: UseQueryOptions<IntakeFlow, Error>) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: ['intake-flow', id],
        queryFn: () => getIntakeFlow(id),
        enabled: isAuthenticated && !!id,
        ...options,
    });
}

// ============================================
// Intake Flow Mutations
// ============================================

export function useCreateIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateIntakeFlowInput) => createIntakeFlow(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useUpdateIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateIntakeFlowInput }) =>
            updateIntakeFlow(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
            queryClient.invalidateQueries({ queryKey: ['intake-flow', id] });
        },
    });
}

export function useDeleteIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteIntakeFlow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function usePublishIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => publishIntakeFlow(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
            queryClient.invalidateQueries({ queryKey: ['intake-flow', id] });
        },
    });
}

export function useArchiveIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => archiveIntakeFlow(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
            queryClient.invalidateQueries({ queryKey: ['intake-flow', id] });
        },
    });
}

export function useSetDefaultIntakeFlow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => setDefaultIntakeFlow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

// ============================================
// Section Mutations
// ============================================

export function useCreateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSectionInput) => createSection(data),
        onSuccess: (_, { intakeFlowId }) => {
            queryClient.invalidateQueries({ queryKey: ['intake-flow', intakeFlowId] });
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useUpdateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSectionInput }) =>
            updateSection(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useDeleteSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useReorderSections() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sectionIds: string[]) => reorderSections(sectionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

// ============================================
// Field Mutations
// ============================================

export function useCreateField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFieldInput) => createField(data),
        onSuccess: (_, { sectionId }) => {
            queryClient.invalidateQueries({ queryKey: ['intake-flow', sectionId] });
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useUpdateField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFieldInput }) =>
            updateField(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useDeleteField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteField(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}

export function useReorderFields() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (fieldIds: string[]) => reorderFields(fieldIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intake-flows'] });
        },
    });
}
