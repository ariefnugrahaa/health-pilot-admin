export const PROVIDER_CATEGORY_OPTIONS = [
    { value: 'LOW_ENERGY', label: 'Low Energy' },
    { value: 'DIGESTIVE_DISCOMFORT', label: 'Digestive Discomfort' },
    { value: 'POOR_SLEEP', label: 'Poor Sleep' },
    { value: 'GUT', label: 'Gut' },
    { value: 'WEIGHT_MANAGEMENT', label: 'Weight Management' },
] as const;

export type ProviderCategory = (typeof PROVIDER_CATEGORY_OPTIONS)[number]['value'];

export function getProviderCategoryLabel(category: string | null | undefined): string {
    return PROVIDER_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || 'Uncategorized';
}
