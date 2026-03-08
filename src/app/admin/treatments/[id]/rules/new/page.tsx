'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCreateMatchingRule } from '@/hooks/use-treatments';
import { RuleBuilderForm } from '@/components/treatments/RuleBuilderForm';
import type { CreateMatchingRulePayload } from '@/services/treatment-service';

export default function NewMatchingRulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: treatmentId } = use(params);
    const router = useRouter();
    const createMutation = useCreateMatchingRule();

    const handleSubmit = async (data: CreateMatchingRulePayload) => {
        try {
            await createMutation.mutateAsync({
                treatmentId,
                payload: data,
            });
            router.push(`/admin/treatments/${treatmentId}`);
        } catch (error) {
            console.error('Failed to create matching rule', error);
        }
    };

    return (
        <div className="mx-auto space-y-6 animate-fade-in pb-10">
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
                            Rule Builder
                        </h1>
                        <p className="text-slate-500 mt-1 text-base">
                            Configure a custom matching rule for provider and treatment logic.
                        </p>
                    </div>
                </div>
            </div>

            <RuleBuilderForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                onCancel={() => router.push(`/admin/treatments/${treatmentId}`)}
            />
        </div>
    );
}
