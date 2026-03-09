'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Power } from 'lucide-react';
import { useTreatments, useDeleteTreatment } from '@/hooks/use-treatments';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    PageHeader,
    SearchInput,
    FilterDropdown,
    StatusPill,
    LoadingState,
    EmptyState,
    ErrorState,
    useConfirm,
    getActiveStatusVariant,
    STATUS_FILTER_OPTIONS,
} from '@/components/shared';

export default function TreatmentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const confirm = useConfirm();

    const { data: treatments = [], isLoading, error, refetch } = useTreatments({
        search: search || undefined,
        status: statusFilter,
    });

    const deleteMutation = useDeleteTreatment();

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Delete Treatment',
            description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            variant: 'destructive',
        });
        if (confirmed) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <PageHeader
                title="Treatments"
                subtitle="Manage treatment pathways used in health assessments."
                action={
                    <Link
                        href="/admin/treatments/new"
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Treatment
                    </Link>
                }
            />

            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    size="md"
                    className="w-80"
                />
                <FilterDropdown
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                    options={STATUS_FILTER_OPTIONS}
                    label="Status"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <LoadingState message="Loading treatments..." />
                ) : error ? (
                    <ErrorState message="Failed to load treatments" onRetry={() => refetch()} />
                ) : treatments.length === 0 ? (
                    <EmptyState message="No treatments found" />
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
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Provider
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {treatments.map((treatment) => (
                                <TableRow key={treatment.id} className="hover:bg-slate-50/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {treatment.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {treatment.category}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <StatusPill variant={getActiveStatusVariant(treatment.isActive)} />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-slate-600 text-sm">
                                        {treatment.provider.name}
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/treatments/${treatment.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(treatment.id, treatment.name)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Power className="w-3.5 h-3.5" />
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
