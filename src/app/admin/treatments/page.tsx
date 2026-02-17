'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    Power,
} from 'lucide-react';
import { useTreatments, useDeleteTreatment } from '@/hooks/use-treatments';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// ==========================================
// Status Helper
// ==========================================

function StatusPill({ isActive }: { isActive: boolean }) {
    if (isActive) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            INACTIVE
        </span>
    );
}

// ==========================================
// Main Component
// ==========================================

export default function TreatmentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // React Query
    const { data: treatments = [], isLoading, error } = useTreatments({
        search: search || undefined,
        status: statusFilter,
    });

    const deleteMutation = useDeleteTreatment();

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900">
                        Treatments
                    </h1>
                    <p className="text-slate-500 mt-1 text-base">
                        Manage treatment pathways used in health assessments.
                    </p>
                </div>
                <Link
                    href="/admin/treatments/new"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add New Treatment
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white border-slate-200"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Status: {statusFilter === 'All' ? 'All' : statusFilter === 'ACTIVE' ? 'Active' : 'Inactive'}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {showStatusDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowStatusDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                {['All', 'ACTIVE', 'INACTIVE'].map((opt) => (
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
                                        {opt === 'All' ? 'All' : opt === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Loading treatments...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-20 text-red-500">
                        Failed to load treatments
                    </div>
                ) : treatments.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-slate-500">
                        No treatments found
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
                                        <StatusPill isActive={treatment.isActive} />
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
