'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useCreateTreatment } from '@/hooks/use-treatments';
import { useProviders } from '@/hooks/use-providers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CreateTreatmentPayload, TreatmentCategory } from '@/services/treatment-service';

// ==========================================
// Constants
// ==========================================

const CATEGORIES: { label: string; value: TreatmentCategory }[] = [
    { label: 'Hormone Therapy', value: 'HORMONE_THERAPY' },
    { label: 'Weight Management', value: 'WEIGHT_MANAGEMENT' },
    { label: 'Hair Health', value: 'HAIR_HEALTH' },
    { label: 'Sexual Health', value: 'SEXUAL_HEALTH' },
    { label: 'Mental Health', value: 'MENTAL_HEALTH' },
    { label: 'Longevity', value: 'LONGEVITY' },
    { label: 'Skin Health', value: 'SKIN_HEALTH' },
    { label: 'Sleep Optimization', value: 'SLEEP_OPTIMIZATION' },
    { label: 'Cognitive Enhancement', value: 'COGNITIVE_ENHANCEMENT' },
    { label: 'General Wellness', value: 'GENERAL_WELLNESS' },
];

// ==========================================
// Main Component
// ==========================================

export default function AddTreatmentPage() {
    const router = useRouter();
    const createMutation = useCreateTreatment();
    const { data: providers = [] } = useProviders({ status: 'ACTIVE' });

    // Form State
    const [formData, setFormData] = useState<Partial<CreateTreatmentPayload>>({
        isActive: true,
        requiresBloodTest: false,
        currency: 'GBP',
        allowedGenders: ['MALE', 'FEMALE'],
    });
    const [capabilities, setCapabilities] = useState('');

    const handleChange = (field: keyof CreateTreatmentPayload, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.category) {
                alert('Please fill in Treatment Name and Category/Concern.');
                return;
            }

            // Auto-generate slug from name
            const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Use first provider if not explicitly selected
            const providerId = formData.providerId || (providers.length > 0 ? providers[0].id : undefined);
            if (!providerId) {
                alert('No provider available. Please create a provider first.');
                return;
            }

            await createMutation.mutateAsync({
                ...formData,
                slug,
                providerId,
                name: formData.name!,
                category: formData.category!,
                supportedCategories: capabilities || undefined,
            } as CreateTreatmentPayload);

            router.push('/admin/treatments');
        } catch (error) {
            console.error('Failed to create treatment', error);
        }
    };

    return (
        <div className="animate-fade-in pb-10">
            {/* Back Link */}
            <Link
                href="/admin/treatments"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Treatment
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-heading font-bold text-slate-900">
                    Add New Treatment
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Define what this treatment is and when it should appear.
                </p>
            </div>

            {/* ======================================== */}
            {/* Basic Information Section */}
            {/* ======================================== */}
            <section className="mb-8">
                <h2 className="text-lg font-heading font-bold text-slate-900 mb-4">
                    Basic Information
                </h2>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {/* Treatment Name */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Treatment Name
                            </Label>
                            <Input
                                placeholder="Back Pain Management"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="bg-slate-50 border-slate-200 text-sm"
                            />
                        </div>

                        {/* Category/Concern */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Category/Concern
                            </Label>
                            <Select
                                onValueChange={(val) => handleChange('category', val)}
                                value={formData.category}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Status
                            </Label>
                            <Select
                                value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                                onValueChange={(val) => handleChange('isActive', val === 'ACTIVE')}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 md:row-span-1">
                            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Description
                            </Label>
                            <Textarea
                                rows={3}
                                placeholder="This treatment program focuses on..."
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="bg-slate-50 border-slate-200 text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================== */}
            {/* Capabilities Section */}
            {/* ======================================== */}
            <section className="mb-10">
                <h2 className="text-lg font-heading font-bold text-slate-900 mb-4">
                    Capabilities
                </h2>

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                    {/* Supported Treatment Categories */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-900">
                            Supported Treatment Categories
                        </Label>
                        <Textarea
                            rows={3}
                            placeholder="This treatment program focuses on managing and alleviating conditions through a combination of therapies, exercise and management strategies."
                            value={capabilities}
                            onChange={(e) => setCapabilities(e.target.value)}
                            className="bg-slate-50 border-slate-200 text-sm resize-none"
                        />
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                        <Info className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600 italic">
                            This provider won&apos;t appear in recommendations until required fields are complete.
                        </p>
                    </div>
                </div>
            </section>

            {/* ======================================== */}
            {/* Footer Actions */}
            {/* ======================================== */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                <Link
                    href="/admin/treatments"
                    className="px-5 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {createMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Save
                </button>
            </div>
        </div>
    );
}
