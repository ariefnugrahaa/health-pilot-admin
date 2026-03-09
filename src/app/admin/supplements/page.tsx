'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Power } from 'lucide-react';
import { useSupplements, useToggleSupplementStatus } from '@/hooks/use-supplements';
import { getCategoryLabel, type SupplementCategory } from '@/services/supplement-service';
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
import { cn } from '@/lib/utils';

// ==========================================
// Category Pill (specific to supplements)
// ==========================================

function CategoryPill({ category }: { category: SupplementCategory }) {
  const colorMap: Record<string, string> = {
    VITAMIN: 'bg-amber-50 text-amber-700',
    MINERAL: 'bg-blue-50 text-blue-700',
    HERB: 'bg-green-50 text-green-700',
    AMINO_ACID: 'bg-purple-50 text-purple-700',
    PROBIOTIC: 'bg-pink-50 text-pink-700',
    OMEGA: 'bg-cyan-50 text-cyan-700',
    ENZYME: 'bg-orange-50 text-orange-700',
    ADAPTOGEN: 'bg-indigo-50 text-indigo-700',
    LIFESTYLE_CHANGE: 'bg-teal-50 text-teal-700',
    OTHER: 'bg-slate-50 text-slate-700',
  };

  const colorClass = colorMap[category] || colorMap.OTHER;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colorClass)}>
      {getCategoryLabel(category)}
    </span>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export default function SupplementsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const confirm = useConfirm();

  const { data: supplements = [], isLoading, error, refetch } = useSupplements({
    status: statusFilter,
    search: search || undefined,
  });

  const toggleMutation = useToggleSupplementStatus();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Supplement`,
      description: `Are you sure you want to ${action} this supplement?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: currentStatus ? 'destructive' : 'default',
    });
    if (confirmed) {
      toggleMutation.mutate({ id, isActive: !currentStatus });
    }
  };

  const activeCount = supplements.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Supplements"
        subtitle="Manage over-the-counter supplements shown in user recommendations."
        count={activeCount}
        countLabel="Active"
        action={
          <Link
            href="/admin/supplements/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Supplement
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          size="sm"
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
          <LoadingState message="Loading supplements..." />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : supplements.length === 0 ? (
          <EmptyState
            message="No supplements found"
            description={
              search || statusFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Add your first supplement to get started'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Supplement Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Categories
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Linked Retailers
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Matching
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplements.map((supplement) => (
                <TableRow key={supplement.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {supplement.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusPill variant={getActiveStatusVariant(supplement.isActive)} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <CategoryPill category={supplement.category} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {supplement.linkedRetailers} Retailer{supplement.linkedRetailers !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusPill variant={supplement.isActive ? 'included' : 'not_included'} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/supplements/${supplement.id}/edit`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(supplement.id, supplement.isActive)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title={supplement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
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
