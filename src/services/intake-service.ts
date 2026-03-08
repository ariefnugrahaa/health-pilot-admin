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

export type FieldType = 'TEXT' | 'NUMBER' | 'EMAIL' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'RADIO' | 'CHECKBOX' | 'TEXTAREA' | 'PHONE' | 'BOOLEAN';
export type IntakeFlowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface IntakeFlowScoringDomain {
    id: string;
    name: string;
    weight: number;
    enabled: boolean;
}

export interface IntakeFlowRiskBucket {
    id: string;
    minScore: number;
    maxScore: number;
    label: string;
    color: string;
    description?: string;
}

export type IntakeFlowBloodMarkerOperator = '>' | '>=' | '<' | '<=' | '=';
export type IntakeFlowBloodMarkerActionType = 'ADD' | 'SUBTRACT' | 'SET';
export type IntakeFlowRuleJoinOperator = 'AND' | 'OR';
export type IntakeFlowRuleConditionType = 'TAG_EXISTS' | 'RISK_LEVEL' | 'DOMAIN_SCORE';
export type IntakeFlowRuleActionType = 'INCLUDE_PATHWAY' | 'EXCLUDE_PATHWAY' | 'ADD_TAG';

export interface IntakeFlowBloodMarkerRule {
    id: string;
    marker: string;
    operator: IntakeFlowBloodMarkerOperator;
    value: number;
    actionType: IntakeFlowBloodMarkerActionType;
    scoreModifier: number;
    targetDomainId: string;
}

export interface IntakeFlowRuleCondition {
    id: string;
    type: IntakeFlowRuleConditionType;
    value: string;
}

export interface IntakeFlowRuleAction {
    id: string;
    type: IntakeFlowRuleActionType;
    value: string;
}

export interface IntakeFlowActionRule {
    id: string;
    name: string;
    conditionOperator: IntakeFlowRuleJoinOperator;
    actionOperator: IntakeFlowRuleJoinOperator;
    conditions: IntakeFlowRuleCondition[];
    actions: IntakeFlowRuleAction[];
}

export interface IntakeFlowRecommendationPriorityItem {
    id: string;
    label: string;
    order: number;
}

export interface IntakeFlowRiskHeadlineMapping {
    id: string;
    riskBucketId: string;
    headline: string;
    summary: string;
}

export interface IntakeFlowTagSignalMapping {
    id: string;
    tag: string;
    insightParagraph: string;
}

export interface IntakeFlowOutputMappingConfig {
    recommendationPriority: IntakeFlowRecommendationPriorityItem[];
    riskHeadlineMappings: IntakeFlowRiskHeadlineMapping[];
    tagSignalMappings: IntakeFlowTagSignalMapping[];
}

export interface IntakeFlowScoringConfig {
    domains: IntakeFlowScoringDomain[];
    riskBuckets: IntakeFlowRiskBucket[];
    bloodMarkerRules?: IntakeFlowBloodMarkerRule[];
    rules?: IntakeFlowActionRule[];
    outputMapping?: IntakeFlowOutputMappingConfig | null;
}

export interface IntakeFlow {
    id: string;
    name: string;
    description: string | null;
    status: IntakeFlowStatus;
    version: number;
    isDefault: boolean;
    assignedTo: string | null;
    scoringConfig: IntakeFlowScoringConfig | null;
    publishedAt: string | null;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
    sections: IntakeFlowSection[];
}

export interface IntakeFlowSection {
    id: string;
    intakeFlowId: string;
    title: string;
    description: string | null;
    order: number;
    isOptional: boolean;
    fields: IntakeFlowField[];
}

export interface IntakeFlowField {
    id: string;
    sectionId: string;
    fieldKey: string;
    label: string;
    type: FieldType;
    placeholder: string | null;
    helperText: string | null;
    isRequired: boolean;
    order: number;
    validationRules: Record<string, unknown> | null;
    options: Array<{ value: string; label: string; description?: string }> | null;
    dependsOnField: string | null;
    dependsOnValue: string | null;
}

export interface CreateIntakeFlowInput {
    name: string;
    description?: string;
    assignedTo?: string;
    scoringConfig?: IntakeFlowScoringConfig | null;
}

export interface UpdateIntakeFlowInput {
    name?: string;
    description?: string;
    status?: IntakeFlowStatus;
    assignedTo?: string;
    isDefault?: boolean;
    scoringConfig?: IntakeFlowScoringConfig | null;
}

export interface CreateSectionInput {
    intakeFlowId: string;
    title: string;
    description?: string;
    order: number;
    isOptional?: boolean;
}

export interface UpdateSectionInput {
    title?: string;
    description?: string;
    isOptional?: boolean;
}

export interface CreateFieldInput {
    sectionId: string;
    intakeFlowId: string;
    fieldKey: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    helperText?: string;
    isRequired?: boolean;
    order: number;
    validationRules?: Record<string, unknown>;
    options?: Array<{ value: string; label: string; description?: string }>;
    dependsOnField?: string;
    dependsOnValue?: string;
}

export interface UpdateFieldInput {
    fieldKey?: string;
    label?: string;
    type?: FieldType;
    placeholder?: string;
    helperText?: string;
    isRequired?: boolean;
    validationRules?: Record<string, unknown>;
    options?: Array<{ value: string; label: string; description?: string }>;
    dependsOnField?: string;
    dependsOnValue?: string;
}

// ============================================
// Intake Flow API Functions
// ============================================

export async function getIntakeFlows(
    filters?: { status?: string; assignedTo?: string }
): Promise<IntakeFlow[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const res = await api.get(`/admin/intake-flows?${params.toString()}`);

    const data: ApiResponse<IntakeFlow[]> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch intake flows');
    }

    return data.data;
}

export async function getIntakeFlow(id: string): Promise<IntakeFlow> {
    const res = await api.get(`/admin/intake-flows/${id}`);

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch intake flow');
    }

    return data.data;
}

export async function createIntakeFlow(
    payload: CreateIntakeFlowInput
): Promise<IntakeFlow> {
    const res = await api.post('/admin/intake-flows', payload);

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create intake flow');
    }

    return data.data;
}

export async function updateIntakeFlow(
    id: string,
    payload: UpdateIntakeFlowInput
): Promise<IntakeFlow> {
    const res = await api.patch(`/admin/intake-flows/${id}`, payload);

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update intake flow');
    }

    return data.data;
}

export async function deleteIntakeFlow(id: string): Promise<void> {
    const res = await api.delete(`/admin/intake-flows/${id}`);

    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to delete intake flow');
        } catch {
            throw new Error('Failed to delete intake flow');
        }
    }
}

export async function publishIntakeFlow(id: string): Promise<IntakeFlow> {
    const res = await api.post(`/admin/intake-flows/${id}/publish`, {});

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to publish intake flow');
    }

    return data.data;
}

export async function archiveIntakeFlow(id: string): Promise<IntakeFlow> {
    const res = await api.post(`/admin/intake-flows/${id}/archive`, {});

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to archive intake flow');
    }

    return data.data;
}

export async function setDefaultIntakeFlow(id: string): Promise<IntakeFlow> {
    const res = await api.post(`/admin/intake-flows/${id}/set-default`, {});

    const data: ApiResponse<IntakeFlow> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to set default intake flow');
    }

    return data.data;
}

// ============================================
// Section API Functions
// ============================================

export async function createSection(payload: CreateSectionInput): Promise<IntakeFlowSection> {
    const res = await api.post('/admin/intake-flows/sections', payload);

    const data: ApiResponse<IntakeFlowSection> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create section');
    }

    return data.data;
}

export async function updateSection(
    id: string,
    payload: UpdateSectionInput
): Promise<IntakeFlowSection> {
    const res = await api.patch(`/admin/intake-flows/sections/${id}`, payload);

    const data: ApiResponse<IntakeFlowSection> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update section');
    }

    return data.data;
}

export async function deleteSection(id: string): Promise<void> {
    const res = await api.delete(`/admin/intake-flows/sections/${id}`);

    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to delete section');
        } catch {
            throw new Error('Failed to delete section');
        }
    }
}

export async function reorderSections(sectionIds: string[]): Promise<void> {
    const res = await api.post('/admin/intake-flows/sections/reorder', { sectionIds });

    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to reorder sections');
        } catch {
            throw new Error('Failed to reorder sections');
        }
    }
}

// ============================================
// Field API Functions
// ============================================

export async function createField(payload: CreateFieldInput): Promise<IntakeFlowField> {
    const res = await api.post('/admin/intake-flows/fields', payload);

    const data: ApiResponse<IntakeFlowField> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create field');
    }

    return data.data;
}

export async function updateField(
    id: string,
    payload: UpdateFieldInput
): Promise<IntakeFlowField> {
    const res = await api.patch(`/admin/intake-flows/fields/${id}`, payload);

    const data: ApiResponse<IntakeFlowField> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update field');
    }

    return data.data;
}

export async function deleteField(id: string): Promise<void> {
    const res = await api.delete(`/admin/intake-flows/fields/${id}`);

    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to delete field');
        } catch {
            throw new Error('Failed to delete field');
        }
    }
}

export async function reorderFields(fieldIds: string[]): Promise<void> {
    const res = await api.post('/admin/intake-flows/fields/reorder', { fieldIds });

    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data.error?.message || 'Failed to reorder fields');
        } catch {
            throw new Error('Failed to reorder fields');
        }
    }
}
