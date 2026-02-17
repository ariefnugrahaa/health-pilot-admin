'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChevronDown,
    MapPin,
    Plus,
    Pencil,
    Loader2,
} from 'lucide-react';
import { useProvider, useUpdateProvider } from '@/hooks/use-providers';
import { Input } from '@/components/ui/input';
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
// Status / Eligibility Helpers
// ==========================================

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'INACTIVE', label: 'Inactive' },
];

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

    // Form state (initialized from server data)
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [eligibility, setEligibility] = useState(true);

    // Dropdowns
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // Success feedback
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Populate form when data loads
    useEffect(() => {
        if (provider) {
            setName(provider.name);
            setLocation(
                provider.supportedRegions.length > 0
                    ? provider.supportedRegions.join(', ')
                    : ''
            );
            setStatus(provider.status);
            setEligibility(provider.acceptsBloodTests);
        }
    }, [provider]);

    // Handle Save
    const handleSave = () => {
        setSaveSuccess(false);
        updateMutation.mutate(
            {
                id,
                payload: {
                    name,
                    status,
                    acceptsBloodTests: eligibility,
                    supportedRegions: location
                        .split(',')
                        .map((r) => r.trim())
                        .filter(Boolean),
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

    const selectedStatusLabel =
        STATUS_OPTIONS.find((s) => s.value === status)?.label || 'Active';

    // Available location options
    const LOCATION_OPTIONS = [
        'UK',
        'US',
        'EU',
        'New York City, NY',
        'London, UK',
        'Los Angeles, CA',
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Back Link */}
            <Link
                href="/admin/providers"
                className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Providers
            </Link>

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-slate-900">
                    Provider Profile Setup
                </h1>
                <p className="text-slate-500 mt-1 text-base">
                    Review and complete the provider&apos;s profile information for better
                    matching.
                </p>
            </div>

            {/* Provider Name */}
            <h2 className="text-2xl font-heading font-bold text-slate-900">
                {provider.name}
            </h2>

            {/* Profile Form Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white border-slate-200"
                        />
                    </div>

                    {/* Location */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Location
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                            className="w-full flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        >
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="flex-1 truncate">
                                {location || 'Select location'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                        {showLocationDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowLocationDropdown(false)}
                                />
                                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                                    {LOCATION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setLocation(opt);
                                                setShowLocationDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${location === opt
                                                ? 'text-teal-600 font-medium bg-teal-50'
                                                : 'text-slate-700'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Status
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {selectedStatusLabel}
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                        {showStatusDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowStatusDropdown(false)}
                                />
                                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setStatus(opt.value);
                                                setShowStatusDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${status === opt.value
                                                ? 'text-teal-600 font-medium bg-teal-50'
                                                : 'text-slate-700'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Eligibility for Matching */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Eligibility for Matching
                        </label>
                        <button
                            type="button"
                            onClick={() => setEligibility(!eligibility)}
                            className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${eligibility
                                ? 'border-teal-300 bg-teal-50 text-teal-700'
                                : 'border-slate-200 bg-white text-slate-500'
                                }`}
                        >
                            <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${eligibility
                                    ? 'border-teal-600 bg-teal-600'
                                    : 'border-slate-300'
                                    }`}
                            >
                                {eligibility && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </span>
                            {eligibility ? 'Included (ON)' : 'Not Included (OFF)'}
                        </button>
                        <p className="text-xs text-slate-400 mt-1.5">
                            Enable if this provider should be included in matching rules
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    {saveSuccess && (
                        <p className="text-sm text-emerald-600 font-medium animate-fade-in">
                            ✓ Changes saved successfully
                        </p>
                    )}
                    {updateMutation.error && (
                        <p className="text-sm text-red-500 font-medium">
                            {updateMutation.error.message}
                        </p>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                        {updateMutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Save
                    </button>
                </div>
            </div>

            {/* Linked Treatments Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                        Linked Treatments
                    </h3>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Treatment
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {provider.treatments.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <p className="text-slate-500 font-medium">
                                    No treatments linked yet
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Add treatments to this provider for matching
                                </p>
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
                                    <TableRow
                                        key={treatment.id}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {treatment.name}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <TreatmentStatusPill
                                                isActive={treatment.isActive}
                                            />
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
    );
}
