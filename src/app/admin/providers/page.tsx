'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
} from 'lucide-react';
import { useProviders } from '@/hooks/use-providers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AddProviderMenu } from '@/components/providers/AddProviderMenu';

// ==========================================
// Status Display Helpers
// ==========================================

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    ACTIVE: {
        label: 'ACTIVE',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    PENDING_APPROVAL: {
        label: 'INCOMPLETE SETUP',
        classes: 'bg-slate-900 text-white border-slate-900',
    },
    SUSPENDED: {
        label: 'SUSPENDED',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    INACTIVE: {
        label: 'INACTIVE',
        classes: 'bg-white text-slate-500 border-slate-200',
    },
};

function StatusPill({ status }: { status: string }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
        >
            {config.label}
        </span>
    );
}

function EligibilityPill({ included }: { included: boolean }) {
    if (included) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                Included
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-400 border border-slate-200">
            Not Included
        </span>
    );
}

// ==========================================
// Status Filter Options
// ==========================================

const STATUS_OPTIONS = ['All', 'ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'INACTIVE'];
const STATUS_LABELS: Record<string, string> = {
    All: 'All',
    ACTIVE: 'Active',
    PENDING_APPROVAL: 'Incomplete',
    SUSPENDED: 'Suspended',
    INACTIVE: 'Inactive',
};

// ==========================================
// Main Page Component
// ==========================================

export default function ProvidersPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    // React Query handles loading, error, caching, and refetch automatically
    const {
        data: providers = [],
        isLoading,
        error,
        refetch,
    } = useProviders({
        status: statusFilter,
        search: search || undefined,
    });

    const activeCount = providers.filter((p) => p.status === 'ACTIVE').length;

    const handleAddManual = () => {
        router.push('/admin/providers/new');
    };

    const handleInviteProvider = () => {
        router.push('/admin/providers/invite');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900">
                        Providers{' '}
                        <span className="text-slate-400 font-normal text-xl">
                            ({activeCount} Active)
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-base">
                        Manage providers that appear in user recommendations
                    </p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Provider
                    </button>
                    <AddProviderMenu
                        isOpen={showAddMenu}
                        onClose={() => setShowAddMenu(false)}
                        onAddManual={handleAddManual}
                        onInviteProvider={handleInviteProvider}
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white border-slate-200"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Status: {STATUS_LABELS[statusFilter]}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {showStatusDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowStatusDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setStatusFilter(opt);
                                            setShowStatusDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${statusFilter === opt
                                                ? 'text-teal-600 font-medium bg-teal-50'
                                                : 'text-slate-700'
                                            }`}
                                    >
                                        {STATUS_LABELS[opt]}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Providers Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Loading providers...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-red-500 font-medium">{error.message}</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-3 text-teal-600 hover:underline text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-slate-500 font-medium">No providers found</p>
                            <p className="text-slate-400 text-sm mt-1">
                                {search || statusFilter !== 'All'
                                    ? 'Try adjusting your filters'
                                    : 'Add your first provider to get started'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                                    Provider Name
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Status
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Location/Coverage
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Linked Treatments
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Eligibility
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {providers.map((provider) => (
                                <TableRow key={provider.id} className="hover:bg-slate-50/50">
                                    <TableCell className="px-6 py-4">
                                        <p className="font-medium text-slate-900">
                                            {provider.name}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <StatusPill status={provider.status} />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-slate-600 text-sm">
                                        {provider.supportedRegions.length > 0
                                            ? provider.supportedRegions.join(', ')
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-slate-600 text-sm">
                                        {provider._count.treatments > 0
                                            ? `${provider._count.treatments} Treatment${provider._count.treatments !== 1 ? 's' : ''}`
                                            : '0 Treatments'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <EligibilityPill
                                            included={
                                                provider.status === 'ACTIVE' &&
                                                provider.acceptsBloodTests
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/providers/${provider.id}/edit`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-300 transition-colors"
                                                title="Edit provider"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                                                title="Delete provider"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
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
    );
}
