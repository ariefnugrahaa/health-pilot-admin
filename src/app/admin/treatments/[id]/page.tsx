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
} from 'lucide-react';
import { useTreatment, useUpdateTreatment } from '@/hooks/use-treatments';
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

export default function EditTreatmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Data Fetching
    const { data: treatment, isLoading, error } = useTreatment(id);
    const updateMutation = useUpdateTreatment();

    // Form State
    const [formData, setFormData] = useState<Partial<CreateTreatmentPayload>>({});
    const [providerSearch, setProviderSearch] = useState('');

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
            });
        }
    }, [treatment]);

    const handleChange = (field: keyof CreateTreatmentPayload, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.category) {
                alert('Please fill in required fields');
                return;
            }

            // Ensure supportedCategories is undefined if empty to avoid Type errors if backend expects exact types
            // But here our service types allow string | null | undefined.
            await updateMutation.mutateAsync({
                id,
                payload: {
                    ...formData,
                    category: formData.category!,
                    name: formData.name!
                },
            });

            alert('Treatment updated successfully');
        } catch (error) {
            console.error('Failed to update treatment', error);
        }
    };

    // Filter providers based on search
    const filteredProviders = treatment?.eligibleProviders?.filter(p =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
        p.supportedRegions.some(r => r.toLowerCase().includes(providerSearch.toLowerCase()))
    ) || [];

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
                <h1 className="text-2xl font-heading font-bold text-slate-900">
                    Treatment Details
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Define and configure the details for the treatment pathway for better matching.
                </p>
            </div>

            {/* Treatment Name Heading */}
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">
                {treatment.name}
            </h2>

            {/* ======================================== */}
            {/* Basic Information Card */}
            {/* ======================================== */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-10 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Treatment Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Treatment Name
                        </Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="bg-white border-slate-200"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Category/Concern
                        </Label>
                        <Select
                            onValueChange={(val) => handleChange('category', val)}
                            value={formData.category}
                        >
                            <SelectTrigger className="bg-white border-slate-200">
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
                            <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description - Full Width */}
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Description
                        </Label>
                        <Textarea
                            rows={4}
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="bg-white border-slate-200 resize-none"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
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

            {/* ======================================== */}
            {/* List of Providers Section */}
            {/* ======================================== */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-bold text-slate-900">
                        List of Providers
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search provider..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            className="pl-9 h-9 text-sm bg-white"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[50%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligible Providers</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProviders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                        No providers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProviders.map((provider) => (
                                    <TableRow key={provider.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{provider.name}</span>
                                                <span className="text-xs text-slate-500">{provider.supportedRegions.join(', ') || 'No Region Set'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center text-xs font-medium ${provider.status === 'ACTIVE' ? 'text-slate-600' : 'text-slate-400'
                                                }`}>
                                                {provider.status === 'ACTIVE' ? 'Active' : provider.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/admin/providers/${provider.id}/edit`}
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

            {/* ======================================== */}
            {/* Matching Rules Section */}
            {/* ======================================== */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-bold text-slate-900">
                        Matching Rules
                    </h3>
                    <Link
                        href={`/admin/treatments/${id}/rules/new`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 bg-white hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors border border-teal-200 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Rule
                    </Link>
                </div>

                {/* Tip Banner */}
                <div className="flex items-center gap-3 bg-teal-50 rounded-lg px-4 py-3 mb-4 text-teal-900 text-sm">
                    <div className="bg-teal-200 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-serif shrink-0">
                        i
                    </div>
                    <p>Tip. Use matching rules to control eligibility based on user data.</p>
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
                                            <span className={`inline-flex items-center text-xs font-medium ${rule.isActive ? 'text-slate-600' : 'text-slate-400'}`}>
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
