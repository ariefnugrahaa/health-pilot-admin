'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useTreatment, useUpdateMatchingRule, useDeleteMatchingRule } from '@/hooks/use-treatments';
import { RuleBuilderForm } from '@/components/treatments/RuleBuilderForm';
import type { CreateMatchingRulePayload } from '@/services/treatment-service';

export default function EditMatchingRulePage({ params }: { params: Promise<{ id: string; ruleId: string }> }) {
    const { id: treatmentId, ruleId } = use(params);
    const router = useRouter();

    // Fetch Treatment to find the rule
    const { data: treatment, isLoading, error } = useTreatment(treatmentId);

    // Mutations
    const updateMutation = useUpdateMatchingRule();
    const deleteMutation = useDeleteMatchingRule();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this rule?')) {
            try {
                await deleteMutation.mutateAsync({ treatmentId, ruleId });
                router.push(`/admin/treatments/${treatmentId}`);
            } catch (error) {
                console.error('Failed to delete rule', error);
            }
        }
    };

    const handleSubmit = async (data: CreateMatchingRulePayload) => {
        try {
            await updateMutation.mutateAsync({
                treatmentId,
                ruleId,
                payload: data,
            });
            router.push(`/admin/treatments/${treatmentId}`);
        } catch (error) {
            console.error('Failed to update matching rule', error);
        }
    };

    if (isLoading) return <div className="flex justify-center py-20 animate-pulse text-teal-600">Loading rule...</div>;
    if (error || !treatment) return <div className="text-center py-20 text-red-500">Failed to load treatment</div>;

    // Find rule
    const rule = treatment.matchingRules.find(r => r.id === ruleId);
    if (!rule) return <div className="text-center py-20 text-red-500">Rule not found</div>;

    const initialData: Partial<CreateMatchingRulePayload> = {
        name: rule.name,
        description: rule.description || '',
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        weight: Number(rule.weight),
        isRequired: rule.isRequired,
        isActive: rule.isActive,
        priority: rule.priority,
        // New fields
        triggerSource: rule.triggerSource,
        evaluationTiming: rule.evaluationTiming,
        providerCapabilities: rule.providerCapabilities,
        locationConstraints: rule.locationConstraints,
        availabilityStatus: rule.availabilityStatus,
        linkedTreatments: rule.linkedTreatments,
        confidence: rule.confidence,
        explanation: rule.explanation,
        exclusionReasons: rule.exclusionReasons,
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <Link
                    href={`/admin/treatments/${treatmentId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Treatment Details
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">
                            Edit Matching Rule
                        </h1>
                        <p className="text-slate-500 mt-1 text-base">
                            Edit the configuration for this matching rule.
                        </p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Rule
                    </button>
                </div>
            </div>

            <RuleBuilderForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                onCancel={() => router.push(`/admin/treatments/${treatmentId}`)}
            />
        </div>
    );
}
