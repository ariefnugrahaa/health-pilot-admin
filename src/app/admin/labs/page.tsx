'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Pencil,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useLabs, useDeleteLab } from '@/hooks/use-labs';
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
// Status Display Helpers
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

function ServiceTypePill({ types }: { types: string[] }) {
  if (types.includes('HOME_VISIT')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        Home visit available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      On-site only
    </span>
  );
}

// ==========================================
// Status Filter Options
// ==========================================

const STATUS_OPTIONS = ['All', 'ACTIVE', 'INACTIVE'];
const STATUS_LABELS: Record<string, string> = {
  All: 'All',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

// ==========================================
// Main Page Component
// ==========================================

export default function LabsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // React Query
  const { data: labs = [], isLoading, error, refetch } = useLabs({
    status: statusFilter,
    search: search || undefined,
  });

  const deleteMutation = useDeleteLab();

  const handleDelete = async (id: string, labName: string) => {
    if (confirm(`Are you sure you want to delete "${labName}"? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete lab');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Labs
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Manage partner laboratories, configure availability, and control blood test booking settings.
          </p>
        </div>
        <Link
          href="/admin/labs/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Lab
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-64">
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
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      statusFilter === opt
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

      {/* Labs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading labs...</p>
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
        ) : labs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-slate-500 font-medium">No labs found</p>
              <p className="text-slate-400 text-sm mt-1">
                {search || statusFilter !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Add your first lab to get started'}
              </p>
            </div>
          </div>
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
                    <ServiceTypePill types={lab.serviceTypes} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {lab.resultTimeDays}-{lab.resultTimeDays + 2} days
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusPill isActive={lab.isActive} />
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
