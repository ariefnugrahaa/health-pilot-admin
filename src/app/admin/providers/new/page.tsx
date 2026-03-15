'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Mail, Phone, Building2, Stethoscope, Link2, Percent, MapPin, CheckSquare } from 'lucide-react';
import { createProvider } from '@/services/provider-service';
import { PROVIDER_CATEGORY_OPTIONS, type ProviderCategory } from '@/lib/provider-categories';

// ==========================================
// Constants
// ==========================================

const PROVIDER_TYPES = [
    { value: 'Individual', label: 'Individual' },
    { value: 'Clinic', label: 'Clinic' },
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Telehealth', label: 'Telehealth' },
    { value: 'Laboratory', label: 'Laboratory' },
];

const COUNTRIES = [
    'United States of America',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Singapore',
];

const COMMISSION_TYPES = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'tiered', label: 'Tiered' },
];

// ==========================================
// Form State Interface
// ==========================================

interface ProviderFormState {
    // Provider Information
    providerName: string;
    businessName: string;
    websiteUrl: string;
    contactEmail: string;
    contactPhone: string;
    countryLocation: string;
    providerType: string;
    prescriptionCapable: string; // 'yes' | 'no'

    // Solutions Summary
    category: ProviderCategory | '';
    affiliateLink: string;
    commissionType: string;
    commissionPercentage: string;
}

// ==========================================
// Select Component
// ==========================================

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    icon,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: ReadonlyArray<{ value: string; label: string }>;
    placeholder?: string;
    required?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full h-10 ${icon ? 'pl-10' : 'px-3'} py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
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
// Input Field with Icon
// ==========================================

function InputWithIcon({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full h-10 ${icon ? 'pl-10' : 'px-3'} pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                />
            </div>
        </div>
    );
}

// ==========================================
// Radio Group Component
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
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === option.value
                                ? 'border-teal-600 bg-teal-600'
                                : 'border-slate-300 bg-white'
                                }`}
                            onClick={() => onChange(option.value)}
                        >
                            {value === option.value && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function AddProviderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<ProviderFormState>({
        // Provider Information
        providerName: '',
        businessName: '',
        websiteUrl: '',
        contactEmail: '',
        contactPhone: '',
        countryLocation: 'United States of America',
        providerType: 'Individual',
        prescriptionCapable: 'yes',

        // Solutions Summary
        category: '',
        affiliateLink: '',
        commissionType: 'percentage',
        commissionPercentage: '',
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

        if (!form.providerName.trim()) {
            setError('Provider name is required');
            return;
        }

        if (!form.category) {
            setError('Category is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Convert percentage to decimal (e.g., 10% -> 0.10)
            let commissionRate: number | undefined;
            if (form.commissionPercentage) {
                const percentage = parseFloat(form.commissionPercentage);
                if (!isNaN(percentage)) {
                    commissionRate = percentage / 100;
                }
            }

            await createProvider({
                name: form.providerName.trim(),
                slug: generateSlug(form.providerName),
                category: form.category,
                websiteUrl: form.websiteUrl || undefined,
                businessName: form.businessName || undefined,
                providerType: form.providerType || undefined,
                contactEmail: form.contactEmail || undefined,
                contactPhone: form.contactPhone || undefined,
                supportedRegions: form.countryLocation ? [form.countryLocation] : [],
                acceptsBloodTests: form.prescriptionCapable === 'yes',
                affiliateLink: form.affiliateLink || undefined,
                commissionRate,
            });

            router.push('/admin/providers');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create provider');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in pb-10">
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
                <h1 className="text-2xl font-bold text-slate-900">
                    Add New Provider
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Manually create a provider profile inside HealthPilot.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Provider Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-5">
                        Provider Information
                    </h2>

                    <div className="space-y-5">
                        {/* Row 1: Provider Name & Business Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputWithIcon
                                label="Provider Name"
                                value={form.providerName}
                                onChange={(val) => updateField('providerName', val)}
                                placeholder="Dr. Emily Carter"
                                required
                            />
                            <InputWithIcon
                                label="Business Name"
                                value={form.businessName}
                                onChange={(val) => updateField('businessName', val)}
                                placeholder="Wellness Clinic Ltd"
                            />
                        </div>

                        {/* Row 2: Website URL & Contact Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputWithIcon
                                label="Website URL"
                                value={form.websiteUrl}
                                onChange={(val) => updateField('websiteUrl', val)}
                                placeholder="https://example.com"
                                type="url"
                            />
                            <InputWithIcon
                                label="Contact Email"
                                value={form.contactEmail}
                                onChange={(val) => updateField('contactEmail', val)}
                                placeholder="contact@example.com"
                                type="email"
                                required
                            />
                        </div>

                        {/* Row 3: Primary Category, Country/Location, Provider Type, Prescription Capable */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <SelectField
                                label="Primary Category"
                                value={form.category}
                                onChange={(val) => updateField('category', val as ProviderCategory)}
                                options={PROVIDER_CATEGORY_OPTIONS}
                                placeholder="Select category"
                                required
                            />
                            <SelectField
                                label="Country / Location Coverage"
                                value={form.countryLocation}
                                onChange={(val) => updateField('countryLocation', val)}
                                options={COUNTRIES.map((c) => ({ value: c, label: c === 'United States of America' ? 'New York City, NY' : c }))}
                                icon={<MapPin className="w-4 h-4" />}
                            />
                            <SelectField
                                label="Provider Type"
                                value={form.providerType}
                                onChange={(val) => updateField('providerType', val)}
                                options={PROVIDER_TYPES}
                            />
                            <RadioGroup
                                label="Prescription Capable?"
                                value={form.prescriptionCapable}
                                onChange={(val) => updateField('prescriptionCapable', val)}
                                options={[
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Solutions Summary Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-5">
                        Solutions Summary
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <SelectField
                            label="Linked Solutions"
                            value=""
                            onChange={() => {}}
                            options={[{ value: 'linked', label: 'Linked Solutions (+6)' }]}
                            icon={<CheckSquare className="w-4 h-4 text-teal-600" />}
                        />

                        {/* Affiliate Link */}
                        <InputWithIcon
                            label="Affiliate Link"
                            value={form.affiliateLink}
                            onChange={(val) => updateField('affiliateLink', val)}
                            placeholder="https://partner.com/ref/healthpilot"
                            required
                        />

                        {/* Commission Type */}
                        <SelectField
                            label="Commission Type"
                            value={form.commissionType}
                            onChange={(val) => updateField('commissionType', val)}
                            options={COMMISSION_TYPES}
                        />

                        {/* Commission % */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Commission %</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={form.commissionPercentage}
                                    onChange={(e) => updateField('commissionPercentage', e.target.value)}
                                    placeholder="15"
                                    className="w-full h-10 px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 pb-4 border-b border-transparent">
                    <Link
                        href="/admin/providers"
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            'Save Provider'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
