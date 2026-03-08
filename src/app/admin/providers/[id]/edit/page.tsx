'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Pencil,
    Loader2,
    Globe,
    Mail,
    Phone,
    Building2,
    Stethoscope,
    Link2,
    Percent,
} from 'lucide-react';
import { useProvider, useUpdateProvider } from '@/hooks/use-providers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// ==========================================
// Types
// ==========================================

interface EditProviderPageProps {
    params: Promise<{ id: string }>;
}

// ==========================================
// Constants
// ==========================================

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'INACTIVE', label: 'Inactive' },
];

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
// Form Components
// ==========================================

function InputWithIcon({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
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

function SelectField({
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
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                >
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

function TreatmentStatusPill({ isActive }: { isActive: boolean }) {
    if (isActive) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-400 border border-slate-200">
            Inactive
        </span>
    );
}

// ==========================================
// Main Component
// ==========================================

export default function EditProviderPage({ params }: EditProviderPageProps) {
    const { id } = use(params);
    const router = useRouter();

    // React Query: fetch provider + linked treatments
    const { data: provider, isLoading, error } = useProvider(id);

    // React Query: update mutation
    const updateMutation = useUpdateProvider();

    // Form state
    const [form, setForm] = useState({
        providerName: '',
        businessName: '',
        websiteUrl: '',
        contactEmail: '',
        contactPhone: '',
        countryLocation: 'United States of America',
        providerType: 'Individual',
        prescriptionCapable: 'yes',
        status: 'ACTIVE',
        linkedSolutions: false,
        affiliateLink: '',
        commissionType: 'percentage',
        commissionPercentage: '',
    });

    // Success feedback
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Populate form when data loads
    useEffect(() => {
        if (provider) {
            setForm({
                providerName: provider.name,
                businessName: provider.businessName || '',
                websiteUrl: provider.websiteUrl || '',
                contactEmail: provider.contactEmail || '',
                contactPhone: provider.contactPhone || '',
                countryLocation: provider.supportedRegions[0] || 'United States of America',
                providerType: provider.providerType || 'Individual',
                prescriptionCapable: provider.acceptsBloodTests ? 'yes' : 'no',
                status: provider.status,
                linkedSolutions: false,
                affiliateLink: provider.affiliateLink || '',
                commissionType: 'percentage',
                commissionPercentage: provider.commissionRate ? (provider.commissionRate * 100).toString() : '',
            });
        }
    }, [provider]);

    const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Handle Save
    const handleSave = () => {
        setSaveSuccess(false);

        // Convert percentage to decimal
        let commissionRate: number | undefined;
        if (form.commissionPercentage) {
            const percentage = parseFloat(form.commissionPercentage);
            if (!isNaN(percentage)) {
                commissionRate = percentage / 100;
            }
        }

        updateMutation.mutate(
            {
                id,
                payload: {
                    name: form.providerName,
                    websiteUrl: form.websiteUrl || undefined,
                    businessName: form.businessName || undefined,
                    providerType: form.providerType || undefined,
                    contactEmail: form.contactEmail || undefined,
                    contactPhone: form.contactPhone || undefined,
                    supportedRegions: form.countryLocation ? [form.countryLocation] : [],
                    acceptsBloodTests: form.prescriptionCapable === 'yes',
                    status: form.status,
                    affiliateLink: form.affiliateLink || undefined,
                    commissionRate,
                },
            },
            {
                onSuccess: () => {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                },
            }
        );
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <p className="text-slate-500 text-sm">Loading provider...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="space-y-6 animate-fade-in pb-10">
                <Link
                    href="/admin/providers"
                    className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Providers
                </Link>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <p className="text-red-500 font-medium">{error.message}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-teal-600 hover:underline text-sm"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    if (!provider) return null;

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
                <h1 className="text-2xl font-bold text-slate-900">Provider Profile Setup</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Review and complete the provider&apos;s profile information for better matching.
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Provider Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Provider Information</h2>

                    <div className="space-y-5">
                        {/* Row 1: Provider Name & Business Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputWithIcon
                                label="Provider Name"
                                value={form.providerName}
                                onChange={(val) => updateField('providerName', val)}
                                placeholder="Dr. Sarah Lee"
                                icon={<Stethoscope className="w-4 h-4" />}
                            />
                            <InputWithIcon
                                label="Business Name"
                                value={form.businessName}
                                onChange={(val) => updateField('businessName', val)}
                                placeholder="Health Clinic Inc."
                                icon={<Building2 className="w-4 h-4" />}
                            />
                        </div>

                        {/* Row 2: Website URL (full width) */}
                        <InputWithIcon
                            label="Website URL"
                            value={form.websiteUrl}
                            onChange={(val) => updateField('websiteUrl', val)}
                            placeholder="https://www.example.com"
                            type="url"
                            icon={<Globe className="w-4 h-4" />}
                        />

                        {/* Row 3: Contact Email & Contact Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputWithIcon
                                label="Contact Email"
                                value={form.contactEmail}
                                onChange={(val) => updateField('contactEmail', val)}
                                placeholder="contact@example.com"
                                type="email"
                                icon={<Mail className="w-4 h-4" />}
                            />
                            <InputWithIcon
                                label="Contact Phone"
                                value={form.contactPhone}
                                onChange={(val) => updateField('contactPhone', val)}
                                placeholder="+1 (555) 000-0000"
                                type="tel"
                                icon={<Phone className="w-4 h-4" />}
                            />
                        </div>

                        {/* Row 4: Country/Location, Provider Type, Prescription Capable */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <SelectField
                                label="Country / Location Coverage"
                                value={form.countryLocation}
                                onChange={(val) => updateField('countryLocation', val)}
                                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
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

                        {/* Row 5: Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <SelectField
                                label="Status"
                                value={form.status}
                                onChange={(val) => updateField('status', val)}
                                options={STATUS_OPTIONS}
                            />
                        </div>
                    </div>
                </div>

                {/* Solutions Summary Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Solutions Summary</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Linked Solutions */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Linked Solutions</label>
                            <div className="h-10 px-3 bg-white border border-slate-200 rounded-lg flex items-center">
                                <Checkbox
                                    label="+6"
                                    checked={form.linkedSolutions}
                                    onChange={(val) => updateField('linkedSolutions', val)}
                                />
                            </div>
                        </div>

                        {/* Affiliate Link */}
                        <InputWithIcon
                            label="Affiliate Link"
                            value={form.affiliateLink}
                            onChange={(val) => updateField('affiliateLink', val)}
                            placeholder="https://aff.example.com"
                            icon={<Link2 className="w-4 h-4" />}
                        />

                        {/* Commission Type */}
                        <SelectField
                            label="Commission Type"
                            value={form.commissionType}
                            onChange={(val) => updateField('commissionType', val)}
                            options={COMMISSION_TYPES}
                        />

                        {/* Commission % */}
                        <InputWithIcon
                            label="Commission %"
                            value={form.commissionPercentage}
                            onChange={(val) => updateField('commissionPercentage', val)}
                            placeholder="10"
                            icon={<Percent className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/providers"
                        className="px-5 py-2.5 text-sm font-medium text-teal-700 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>

                {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                        Changes saved successfully
                    </div>
                )}

                {updateMutation.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {updateMutation.error.message}
                    </div>
                )}

                {/* Linked Treatments Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Linked Treatments</h3>
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Treatment
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {provider.treatments.length === 0 ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <p className="text-slate-500 font-medium">No treatments linked yet</p>
                                    <p className="text-slate-400 text-sm mt-1">Add treatments to this provider for matching</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                                            Treatment Name
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {provider.treatments.map((treatment) => (
                                        <TableRow key={treatment.id} className="hover:bg-slate-50/50">
                                            <TableCell className="px-6 py-4">
                                                <p className="font-medium text-slate-900">{treatment.name}</p>
                                            </TableCell>
                                            <TableCell className="px-4 py-4">
                                                <TreatmentStatusPill isActive={treatment.isActive} />
                                            </TableCell>
                                            <TableCell className="px-4 py-4">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-teal-300 text-teal-600 hover:bg-teal-50 transition-colors"
                                                        title="Edit treatment"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
