'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    Plus,
    Pencil,
    Search,
    Info,
    X,
} from 'lucide-react';
import { useTreatment, useUpdateTreatment } from '@/hooks/use-treatments';
import { useProviders } from '@/hooks/use-providers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

export default function EditTreatmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Data Fetching
    const { data: treatment, isLoading, error } = useTreatment(id);
    const updateMutation = useUpdateTreatment();
    const { data: allProviders = [] } = useProviders({ status: 'ACTIVE' });

    // Form State
    const [formData, setFormData] = useState<Partial<CreateTreatmentPayload>>({});
    const [providerSearch, setProviderSearch] = useState('');
    const [biomarkers, setBiomarkers] = useState<{ name: string; operator: string; value: string }[]>([]);
    const [linkedProviderIds, setLinkedProviderIds] = useState<string[]>([]);
    const [showAddProvider, setShowAddProvider] = useState(false);

    // Populate form data
    useEffect(() => {
        if (treatment) {
            setFormData({
                providerId: treatment.providerId,
                name: treatment.name,
                slug: treatment.slug,
                description: treatment.description || '',
                category: treatment.category,
                supportedCategories: treatment.supportedCategories || '',
                isActive: treatment.isActive,
                includeInMatching: treatment.includeInMatching,
                forceRankingOverride: treatment.forceRankingOverride || '',
                requiresBloodTest: treatment.requiresBloodTest,
                injectionBased: treatment.injectionBased,
                prescriptionRequired: treatment.prescriptionRequired,
                requiresBiomarkers: treatment.requiresBiomarkers,
                minAge: treatment.minAge,
                maxAge: treatment.maxAge,
                allowedGenders: treatment.allowedGenders,
                additionalNotes: treatment.additionalNotes || '',
            });

            // Load linked providers from treatmentProviders (new) or fall back to eligibleProviders
            if (treatment.treatmentProviders && treatment.treatmentProviders.length > 0) {
                // Sort by isPrimary to ensure primary provider is first
                const sortedProviders = [...treatment.treatmentProviders].sort((a, b) =>
                    (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
                );
                setLinkedProviderIds(sortedProviders.map((tp) => tp.providerId));
            } else if (treatment.eligibleProviders && treatment.eligibleProviders.length > 0) {
                setLinkedProviderIds(treatment.eligibleProviders.map((p) => p.id));
            } else if (treatment.providerId) {
                setLinkedProviderIds([treatment.providerId]);
            }

            // Load biomarkers from treatment
            if (treatment.treatmentBiomarkers && treatment.treatmentBiomarkers.length > 0) {
                setBiomarkers(
                    treatment.treatmentBiomarkers.map((tb: { biomarker: { name: string }; minValue?: number | null; maxValue?: number | null }) => ({
                        name: tb.biomarker.name,
                        operator: tb.minValue ? '<' : '>',
                        value: (tb.minValue || tb.maxValue || '').toString(),
                    }))
                );
            }
        }
    }, [treatment]);

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

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.category) {
                alert('Please fill in required fields');
                return;
            }

            await updateMutation.mutateAsync({
                id,
                payload: {
                    ...formData,
                    category: formData.category!,
                    name: formData.name!,
                    providerIds: linkedProviderIds,
                },
            });

            alert('Treatment updated successfully');
        } catch (error) {
            console.error('Failed to update treatment', error);
        }
    };

    // Provider management functions
    const toggleProvider = (providerId: string) => {
        setLinkedProviderIds((prev) =>
            prev.includes(providerId)
                ? prev.filter((id) => id !== providerId)
                : [...prev, providerId]
        );
    };

    const setPrimaryProvider = (providerId: string) => {
        setLinkedProviderIds((prev) => [
            providerId,
            ...prev.filter((id) => id !== providerId),
        ]);
    };

    const removeProvider = (providerId: string) => {
        setLinkedProviderIds((prev) => prev.filter((id) => id !== providerId));
    };

    // Get linked providers with full details
    const linkedProviders = linkedProviderIds
        .map((id) => allProviders.find((p) => p.id === id))
        .filter(Boolean);

    // Filter providers for adding (exclude already linked)
    const availableProviders = allProviders.filter(
        (p) => !linkedProviderIds.includes(p.id)
    );
    const filteredAvailableProviders = availableProviders.filter((p) =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase())
    );

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
    if (error || !treatment) return <div className="text-center py-20 text-red-500">Failed to load treatment</div>;

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
                <h1 className="text-2xl font-bold text-slate-900">Treatment Details</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Define and configure the details for the treatment pathway for better matching.
                </p>
            </div>

            {/* Treatment Name Heading */}
            <h2 className="text-xl font-bold text-slate-900 mb-4">
                {treatment.name}
            </h2>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    {/* Treatment Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Treatment Name</label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="bg-white border-slate-200 h-10"
                        />
                    </div>

                    {/* Category */}
                    <SelectField
                        label="Category/Concern"
                        value={formData.category || ''}
                        onChange={(val) => handleChange('category', val as TreatmentCategory)}
                        options={CATEGORIES}
                    />

                    {/* Status */}
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

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="bg-white border-slate-200 resize-none"
                    />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
                    >
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                    </button>
                </div>
            </div>

            {/* Recommendation Settings Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Recommendation Settings</h3>
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Solution Properties</h3>
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Eligibility Overview</h3>

                <div className="space-y-5">
                    {/* Row 1 */}
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
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">BIOMARKER</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">OPERATOR</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-32">VALUE</th>
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

            {/* List of Linked Providers Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Linked Providers ({linkedProviders.length})</h3>
                    <button
                        type="button"
                        onClick={() => setShowAddProvider(!showAddProvider)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 bg-white hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors border border-teal-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add Provider
                    </button>
                </div>

                {/* Add Provider Panel */}
                {showAddProvider && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-slate-700">Select Providers to Add</h4>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search provider..."
                                    value={providerSearch}
                                    onChange={(e) => setProviderSearch(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                            {filteredAvailableProviders.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    {providerSearch ? 'No providers match your search' : 'All providers are already linked'}
                                </div>
                            ) : (
                                filteredAvailableProviders.map((provider) => (
                                    <div
                                        key={provider.id}
                                        onClick={() => {
                                            toggleProvider(provider.id);
                                            setShowAddProvider(false);
                                            setProviderSearch('');
                                        }}
                                        className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-teal-50 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{provider.name}</p>
                                            <p className="text-xs text-slate-500">{provider.supportedRegions?.join(', ') || 'No regions'}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-teal-600" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[40%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {linkedProviders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        No providers linked. Click "Add Provider" to link providers.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                linkedProviders.map((provider, index) => {
                                    if (!provider) return null;
                                    const isPrimary = index === 0;
                                    return (
                                        <TableRow key={provider.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{provider.name}</span>
                                                    <span className="text-xs text-slate-500">{provider.supportedRegions?.join(', ') || 'No Region Set'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isPrimary ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                                        Primary
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setPrimaryProvider(provider.id)}
                                                        className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                                                    >
                                                        Set as Primary
                                                    </button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center text-xs font-medium ${provider.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {provider.status === 'ACTIVE' ? 'Active' : provider.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/providers/${provider.id}/edit`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {linkedProviders.length > 1 && (
                                                        <button
                                                            onClick={() => removeProvider(provider.id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Remove provider"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Advanced Rules Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Advanced Rules</h3>
                    <Link
                        href={`/admin/treatments/${id}/rules/new`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 bg-white hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors border border-teal-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Rule
                    </Link>
                </div>

                {/* Info Tip */}
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3 mb-4 text-blue-900 text-sm">
                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    <p>Tip: Use matching rules to control when and how this treatment appears in user recommendations.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[60%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Rule Name</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {treatment.matchingRules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                        No matching rules defined.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                treatment.matchingRules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell>
                                            <span className="font-medium text-slate-700">{rule.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center text-xs font-medium ${rule.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/admin/treatments/${id}/rules/${rule.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
