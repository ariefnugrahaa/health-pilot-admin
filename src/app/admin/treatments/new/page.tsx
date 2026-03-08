'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Info, Plus, X } from 'lucide-react';
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

const RANKING_OPTIONS = [
    { label: 'Best Match', value: 'BEST_MATCH' },
    { label: 'High Priority', value: 'HIGH_PRIORITY' },
    { label: 'Low Priority', value: 'LOW_PRIORITY' },
];

const GENDER_OPTIONS = [
    { label: 'None', value: 'NONE' },
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
];

// ==========================================
// Form Components
// ==========================================

function RadioGroup({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="flex items-center gap-6 h-10">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === option.value ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'}`}
                            onClick={() => onChange(option.value)}
                        >
                            {value === option.value && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function Checkbox({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <div
                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${checked ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'}`}
                onClick={() => onChange(!checked)}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

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
        includeInMatching: true,
        requiresBloodTest: false,
        injectionBased: false,
        prescriptionRequired: false,
        requiresBiomarkers: false,
        currency: 'GBP',
        allowedGenders: [],
    });
    const [biomarkers, setBiomarkers] = useState<{ name: string; operator: string; value: string }[]>([]);
    const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

    const handleChange = (field: keyof CreateTreatmentPayload, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addBiomarker = () => {
        setBiomarkers([...biomarkers, { name: '', operator: '<', value: '' }]);
    };

    const removeBiomarker = (index: number) => {
        setBiomarkers(biomarkers.filter((_, i) => i !== index));
    };

    const updateBiomarker = (index: number, field: string, value: string) => {
        const updated = [...biomarkers];
        updated[index] = { ...updated[index], [field]: value };
        setBiomarkers(updated);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.category) {
                alert('Please fill in Treatment Name and Primary Category.');
                return;
            }

            if (linkedProviders.length === 0) {
                alert('Please select at least one provider.');
                return;
            }

            const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            await createMutation.mutateAsync({
                ...formData,
                slug,
                providerIds: linkedProviders,
                name: formData.name!,
                category: formData.category!,
            } as CreateTreatmentPayload);

            router.push('/admin/treatments');
        } catch (error) {
            console.error('Failed to create treatment', error);
        }
    };

    const toggleProvider = (providerId: string) => {
        setLinkedProviders((prev) =>
            prev.includes(providerId)
                ? prev.filter((id) => id !== providerId)
                : [...prev, providerId]
        );
    };

    const setPrimaryProvider = (providerId: string) => {
        // Move the selected provider to the first position (primary)
        setLinkedProviders((prev) => [
            providerId,
            ...prev.filter((id) => id !== providerId),
        ]);
    };

    return (
        <div className="animate-fade-in pb-10">
            {/* Back Link */}
            <Link
                href="/admin/treatments"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Treatments
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Add New Treatment</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Define what this treatment is and when it should appear.
                </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Basic Information</h2>

                    <div className="space-y-5">
                        {/* Row 1: Treatment Name & Primary Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Treatment Name</label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Back Pain Management"
                                    className="bg-white border-slate-200 h-10"
                                />
                            </div>
                            <SelectField
                                label="Primary Category"
                                value={formData.category || ''}
                                onChange={(val) => handleChange('category', val as TreatmentCategory)}
                                options={CATEGORIES}
                                placeholder="Select category"
                            />
                        </div>

                        {/* Row 2: Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <SelectField
                                label="Status"
                                value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                                onChange={(val) => handleChange('isActive', val === 'ACTIVE')}
                                options={[
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'INACTIVE', label: 'Inactive' },
                                    { value: 'DRAFT', label: 'Draft' },
                                ]}
                            />
                        </div>

                        {/* Row 3: Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <Textarea
                                rows={4}
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="This treatment program focuses on managing and alleviating back pain through a combination of physical therapy, exercise and pain management strategies."
                                className="bg-white border-slate-200 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Recommendation Settings Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Recommendation Settings</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Include in Matching</label>
                            <Checkbox
                                label="Included"
                                checked={formData.includeInMatching || false}
                                onChange={(val) => handleChange('includeInMatching', val)}
                            />
                        </div>
                        <SelectField
                            label="Force Ranking Override"
                            value={formData.forceRankingOverride || ''}
                            onChange={(val) => handleChange('forceRankingOverride', val)}
                            options={RANKING_OPTIONS}
                            placeholder="Best Match"
                        />
                    </div>
                </div>

                {/* Solution Properties Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Solution Properties</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <RadioGroup
                            label="Requires Blood Test?"
                            value={formData.requiresBloodTest ? 'yes' : 'no'}
                            onChange={(val) => handleChange('requiresBloodTest', val === 'yes')}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                        />
                        <RadioGroup
                            label="Injection-based?"
                            value={formData.injectionBased ? 'yes' : 'no'}
                            onChange={(val) => handleChange('injectionBased', val === 'yes')}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                        />
                        <RadioGroup
                            label="Prescription Required?"
                            value={formData.prescriptionRequired ? 'yes' : 'no'}
                            onChange={(val) => handleChange('prescriptionRequired', val === 'yes')}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                        />
                    </div>
                </div>

                {/* Eligibility Overview Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Eligibility Overview</h2>

                    <div className="space-y-5">
                        {/* Row 1: Requires Biomarkers, Age, Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <RadioGroup
                                label="Requires Biomarkers?"
                                value={formData.requiresBiomarkers ? 'yes' : 'no'}
                                onChange={(val) => handleChange('requiresBiomarkers', val === 'yes')}
                                options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Age Restrictions</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={formData.minAge || ''}
                                        onChange={(e) => handleChange('minAge', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="17"
                                        className="bg-white border-slate-200 h-10 w-20"
                                    />
                                    <span className="text-slate-500">to</span>
                                    <Input
                                        type="number"
                                        value={formData.maxAge || ''}
                                        onChange={(e) => handleChange('maxAge', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="40"
                                        className="bg-white border-slate-200 h-10 w-20"
                                    />
                                    <span className="text-slate-500 text-sm">years</span>
                                </div>
                            </div>
                            <SelectField
                                label="Gender Restrictions"
                                value={formData.allowedGenders?.[0] || 'NONE'}
                                onChange={(val) => handleChange('allowedGenders', val === 'NONE' ? [] : [val])}
                                options={GENDER_OPTIONS}
                            />
                        </div>

                        {/* Biomarker Table */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Biomarker Requirements</label>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Biomarker</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">Operator</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-32">Value</th>
                                            <th className="w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {biomarkers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-6 text-slate-500 text-sm">
                                                    No biomarkers added
                                                </td>
                                            </tr>
                                        ) : (
                                            biomarkers.map((biomarker, index) => (
                                                <tr key={index} className="border-t border-slate-100">
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={biomarker.name}
                                                            onChange={(e) => updateBiomarker(index, 'name', e.target.value)}
                                                            placeholder="Ferritin"
                                                            className="bg-white border-slate-200 h-9"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={biomarker.operator}
                                                            onChange={(e) => updateBiomarker(index, 'operator', e.target.value)}
                                                            className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                        >
                                                                <option value="<">&lt;</option>
                                                                <option value="<=">&le;</option>
                                                                <option value=">">&gt;</option>
                                                                <option value=">=">&ge;</option>
                                                                <option value="=">=</option>
                                                            </select>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={biomarker.value}
                                                            onChange={(e) => updateBiomarker(index, 'value', e.target.value)}
                                                            placeholder="50"
                                                            className="bg-white border-slate-200 h-9"
                                                        />
                                                    </td>
                                                    <td className="px-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBiomarker(index)}
                                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                type="button"
                                onClick={addBiomarker}
                                className="mt-2 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add Biomarker
                            </button>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Additional Notes</label>
                            <Textarea
                                rows={3}
                                value={formData.additionalNotes || ''}
                                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                                placeholder="Enter any additional eligibility criteria, special requirements, or notes..."
                                className="bg-white border-slate-200 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Linked Providers Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-900">Linked Providers</h2>
                        <span className="text-sm text-slate-500">{linkedProviders.length} selected</span>
                    </div>

                    {/* Provider Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Select Providers</label>

                        {/* Available Providers List */}
                        <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                            {providers.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No active providers available
                                </div>
                            ) : (
                                providers.map((provider) => {
                                    const isSelected = linkedProviders.includes(provider.id);
                                    const isPrimary = linkedProviders[0] === provider.id;
                                    return (
                                        <div
                                            key={provider.id}
                                            className={`flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-teal-50' : ''}`}
                                            onClick={() => toggleProvider(provider.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'}`}
                                                >
                                                    {isSelected && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{provider.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {provider.supportedRegions?.join(', ') || 'No regions'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-2">
                                                    {isPrimary && (
                                                        <span className="px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                                                            Primary
                                                        </span>
                                                    )}
                                                    {!isPrimary && linkedProviders.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPrimaryProvider(provider.id);
                                                            }}
                                                            className="px-2 py-0.5 text-xs text-teal-600 hover:bg-teal-100 rounded transition-colors"
                                                        >
                                                            Set as Primary
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Selected Providers Summary */}
                    {linkedProviders.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-slate-700">Selected Providers ({linkedProviders.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {linkedProviders.map((providerId, index) => {
                                    const provider = providers.find(p => p.id === providerId);
                                    if (!provider) return null;
                                    return (
                                        <div
                                            key={providerId}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${index === 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'}`}
                                        >
                                            {index === 0 && (
                                                <span className="w-2 h-2 rounded-full bg-teal-600" />
                                            )}
                                            {provider.name}
                                            <button
                                                type="button"
                                                onClick={() => toggleProvider(providerId)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/treatments"
                        className="px-5 py-2.5 text-sm font-medium text-teal-700 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Treatment
                    </button>
                </div>
            </form>
        </div>
    );
}
