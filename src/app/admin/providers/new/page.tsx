'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { createProvider } from '@/services/provider-service';
import { Input } from '@/components/ui/input';

// ==========================================
// Constants
// ==========================================

const PROVIDER_TYPES = ['Individual', 'Clinic', 'Hospital', 'Telehealth', 'Laboratory'];

const PROVIDER_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const REGIONS = [
    'United States of America',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Singapore',
];

const LOCATIONS = [
    'New York City, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'London, UK',
    'Manchester, UK',
    'Toronto, CA',
    'Sydney, AU',
];

const COVERAGE_TYPES = ['Onsite', 'Remote', 'Hybrid'];

// ==========================================
// Form State Interface
// ==========================================

interface ProviderFormState {
    name: string;
    providerType: string;
    status: string;
    includeInMatching: boolean;
    region: string;
    location: string;
    coverageType: string;
}

// ==========================================
// Select Component (custom styled)
// ==========================================

// ==========================================
// Select Component (custom styled)
// ==========================================

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
    icon,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        {icon}
                    </div>
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full h-10 ${icon ? 'pl-10 pr-10' : 'px-3'
                        } py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Main Page Component
// ==========================================

export default function AddProviderPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<ProviderFormState>({
        name: '',
        providerType: 'Individual',
        status: 'ACTIVE',
        includeInMatching: true,
        region: 'United States of America',
        location: 'New York City, NY',
        coverageType: 'Onsite',
    });

    const updateField = <K extends keyof ProviderFormState>(
        field: K,
        value: ProviderFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError('Provider name is required');
            return;
        }

        if (!accessToken) {
            setError('Authentication required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createProvider(accessToken, {
                name: form.name.trim(),
                slug: generateSlug(form.name),
                supportedRegions: form.location ? [form.location] : [],
                acceptsBloodTests: form.includeInMatching,
            });

            router.push('/admin/providers');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create provider');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            {/* Back Link */}
            <Link
                href="/admin/providers"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Providers
            </Link>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-slate-900">
                    Add New Provider
                </h1>
                <p className="text-slate-500 mt-1 text-base">
                    Set up provider details and availability
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-heading font-bold text-slate-900 mb-6">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <Input
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Dr. Sarah Lee"
                                className="bg-white border-slate-200 h-10 rounded-lg"
                            />
                        </div>

                        {/* Provider Type */}
                        <SelectField
                            label="Provider Type"
                            value={form.providerType}
                            onChange={(val) => updateField('providerType', val)}
                            options={PROVIDER_TYPES.map((t) => ({ value: t, label: t }))}
                        />

                        {/* Status */}
                        <SelectField
                            label="Status"
                            value={form.status}
                            onChange={(val) => updateField('status', val)}
                            options={PROVIDER_STATUSES}
                        />

                        {/* Eligibility Status */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Eligibility Status
                            </label>
                            <div className="h-10 px-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.includeInMatching}
                                        onChange={(e) =>
                                            updateField('includeInMatching', e.target.checked)
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-teal-600 peer-checked:border-teal-600 flex items-center justify-center transition-colors">
                                        {form.includeInMatching && (
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                                <span className="text-sm text-slate-600">
                                    Include in matching &quot;Yes/No&quot;
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Coverage Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-heading font-bold text-slate-900 mb-6">
                        Location & Coverage
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* City/Region */}
                        <SelectField
                            label="City/Region"
                            value={form.region}
                            onChange={(val) => updateField('region', val)}
                            options={REGIONS.map((r) => ({ value: r, label: r }))}
                        />

                        {/* Location */}
                        <SelectField
                            label="Location"
                            value={form.location}
                            onChange={(val) => updateField('location', val)}
                            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
                            icon={<MapPin className="w-4 h-4" />}
                        />

                        {/* Coverage Type */}
                        <SelectField
                            label="Coverage Type"
                            value={form.coverageType}
                            onChange={(val) => updateField('coverageType', val)}
                            options={COVERAGE_TYPES.map((c) => ({ value: c, label: c }))}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/providers"
                        className="px-6 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
