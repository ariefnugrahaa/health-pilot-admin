'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProviders } from '@/hooks/use-providers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AddProviderMenu } from '@/components/providers/AddProviderMenu';
import {
    PageHeader,
    SearchInput,
    FilterDropdown,
    StatusPill,
    LoadingState,
    EmptyState,
    ErrorState,
    getProviderStatusVariant,
    PROVIDER_STATUS_FILTER_OPTIONS,
} from '@/components/shared';

export default function ProvidersPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAddMenu, setShowAddMenu] = useState(false);

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
            <PageHeader
                title="Providers"
                subtitle="Manage providers that appear in user recommendations"
                count={activeCount}
                countLabel="Active"
                action={
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
                }
            />

            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    size="md"
                    className="w-72"
                />
                <FilterDropdown
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                    options={PROVIDER_STATUS_FILTER_OPTIONS}
                    label="Status"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <LoadingState message="Loading providers..." />
                ) : error ? (
                    <ErrorState message={error.message} onRetry={() => refetch()} />
                ) : providers.length === 0 ? (
                    <EmptyState
                        message="No providers found"
                        description={
                            search || statusFilter !== 'All'
                                ? 'Try adjusting your filters'
                                : 'Add your first provider to get started'
                        }
                    />
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
                                        <StatusPill variant={getProviderStatusVariant(provider.status)} />
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
                                        <StatusPill
                                            variant={
                                                provider.status === 'ACTIVE' && provider.acceptsBloodTests
                                                    ? 'included'
                                                    : 'not_included'
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
