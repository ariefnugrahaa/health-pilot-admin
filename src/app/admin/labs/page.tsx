'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLabs, useDeleteLab } from '@/hooks/use-labs';
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

// ==========================================
// Main Page Component
// ==========================================

export default function LabsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const confirm = useConfirm();

  const { data: labs = [], isLoading, error, refetch } = useLabs({
    status: statusFilter,
    search: search || undefined,
  });

  const deleteMutation = useDeleteLab();

  const handleDelete = async (id: string, labName: string) => {
    const confirmed = await confirm({
      title: 'Delete Lab',
      description: `Are you sure you want to delete "${labName}"? This action cannot be undone.`,
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
        title="Labs"
        subtitle="Manage partner laboratories, configure availability, and control blood test booking settings."
        action={
          <Link
            href="/admin/labs/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Lab
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
          <LoadingState message="Loading labs..." />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : labs.length === 0 ? (
          <EmptyState
            message="No labs found"
            description={
              search || statusFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Add your first lab to get started'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  LAB NAME
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  LOCATION
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  SERVICE TYPE
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  RESULT TIME
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  STATUS
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  SLOTS CONFIGURED
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((lab) => (
                <TableRow key={lab.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {lab.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {lab.city}, {lab.state}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusPill variant={lab.serviceTypes.includes('HOME_VISIT') ? 'home_visit' : 'on_site'} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {lab.resultTimeDays}-{lab.resultTimeDays + 2} days
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusPill variant={getActiveStatusVariant(lab.isActive)} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {calculateTotalCapacity(lab.operatingDays)} total weekly capacity
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/labs/${lab.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(lab.id, lab.name)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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

// Helper function
function calculateTotalCapacity(operatingDays: { capacity: number }[] | undefined): number {
  if (!operatingDays) return 0;
  return operatingDays.reduce((total, day) => total + (day.capacity || 0), 0);
}
