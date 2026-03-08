'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Pencil,
  ChevronDown,
  Power,
} from 'lucide-react';
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

function MatchingPill({ included }: { included: boolean }) {
  if (included) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-900 text-slate-900">
        Included
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
      Not Included
    </span>
  );
}

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {getCategoryLabel(category)}
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

export default function SupplementsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // React Query
  const { data: supplements = [], isLoading, error, refetch } = useSupplements({
    status: statusFilter,
    search: search || undefined,
  });

  const toggleMutation = useToggleSupplementStatus();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this supplement?`)) {
      toggleMutation.mutate({ id, isActive: !currentStatus });
    }
  };

  const activeCount = supplements.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Supplements
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Manage over-the-counter supplements shown in user recommendations.
          </p>
        </div>
        <Link
          href="/admin/supplements/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Supplement
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

      {/* Supplements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading supplements...</p>
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
        ) : supplements.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-slate-500 font-medium">No supplements found</p>
              <p className="text-slate-400 text-sm mt-1">
                {search || statusFilter !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Add your first supplement to get started'}
              </p>
            </div>
          </div>
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
                    <StatusPill isActive={supplement.isActive} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <CategoryPill category={supplement.category} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600 text-sm">
                    {supplement.linkedRetailers} Retailer{supplement.linkedRetailers !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <MatchingPill included={supplement.isActive} />
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
