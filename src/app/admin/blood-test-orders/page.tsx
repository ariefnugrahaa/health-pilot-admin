'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronDown, Eye, Search } from 'lucide-react';
import { useBloodTestOrders } from '@/hooks/use-blood-test-orders';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_OPTIONS = ['All', 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;

function formatBookingDate(value: string): string {
  return format(new Date(value), 'EEE, MMM d yyyy');
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  if (normalized === 'COMPLETED') {
    return (
      <span className="inline-flex min-w-[136px] items-center justify-center rounded-full border border-[#36a269] px-4 py-2 text-[15px] font-medium text-[#22925b]">
        COMPLETED
      </span>
    );
  }

  if (normalized === 'CANCELLED') {
    return (
      <span className="inline-flex min-w-[136px] items-center justify-center rounded-full border border-[#d0d5dd] px-4 py-2 text-[15px] font-medium text-[#667085]">
        CANCELLED
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-[136px] items-center justify-center rounded-full border border-[#4d8cc6] px-4 py-2 text-[15px] font-medium text-[#2d6ea8]">
      {normalized}
    </span>
  );
}

function ResultStatusPill({ status }: { status: 'Uploaded' | 'Not Uploaded' | 'Reviewed' }) {
  if (status === 'Uploaded') {
    return (
      <span className="inline-flex rounded-full border border-[#2f3b4d] px-4 py-2 text-[15px] text-[#2f3b4d]">
        Uploaded
      </span>
    );
  }

  if (status === 'Reviewed') {
    return (
      <span className="inline-flex rounded-full border border-[#0f9a89] px-4 py-2 text-[15px] text-[#0f9a89]">
        Reviewed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-[#98a2b3] px-4 py-2 text-[15px] text-[#98a2b3]">
      Not Uploaded
    </span>
  );
}

export default function BloodTestOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const { data: orders = [], isLoading, error, refetch } = useBloodTestOrders({
    status: statusFilter,
    search: search || undefined,
  });

  const tableRows = useMemo(() => orders, [orders]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="border-b border-[#e4e7ec] pb-5">
        <h1 className="text-[56px] font-semibold tracking-[-0.04em] text-[#202124]">
          Blood Test Orders
        </h1>
        <p className="mt-3 text-[22px] text-[#5f6368]">
          Track, manage, and update the lifecycle of all user blood test bookings.
        </p>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="relative w-full max-w-[420px]">
          <Search className="absolute left-7 top-1/2 h-7 w-7 -translate-y-1/2 text-[#98a2b3]" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-[72px] rounded-[18px] border-[#d0d5dd] bg-white pl-16 text-[20px] text-[#202124] placeholder:text-[#98a2b3]"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusDropdown((current) => !current)}
            className="flex h-[72px] min-w-[300px] items-center justify-between rounded-[18px] border border-[#d0d5dd] bg-white px-7 text-[20px] text-[#344054]"
          >
            <span>Status: {statusFilter === 'All' ? 'All' : statusFilter}</span>
            <ChevronDown className="h-6 w-6 text-[#667085]" />
          </button>

          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-full rounded-[18px] border border-[#d0d5dd] bg-white p-2 shadow-lg">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`w-full rounded-[12px] px-4 py-3 text-left text-[18px] ${
                      statusFilter === option ? 'bg-[#effcfb] text-[#129b99]' : 'text-[#344054]'
                    }`}
                    onClick={() => {
                      setStatusFilter(option);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {option === 'All' ? 'All' : option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#d0d5dd] bg-white">
        {isLoading ? (
          <div className="py-24 text-center text-[18px] text-[#5f6368]">Loading blood test orders...</div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-[18px] text-[#c43d3d]">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-[18px] text-[#129b99] underline"
            >
              Try again
            </button>
          </div>
        ) : tableRows.length === 0 ? (
          <div className="py-24 text-center text-[18px] text-[#5f6368]">
            No blood test orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e4e7ec] bg-[#f9fafb] hover:bg-[#f9fafb]">
                <TableHead className="px-8 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  USER
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  LAB
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  DATE
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  TIME
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  STATUS
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  RESULT STATUS
                </TableHead>
                <TableHead className="px-6 py-6 text-[16px] font-semibold uppercase tracking-wide text-[#344054]">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((order) => (
                <TableRow key={order.id} className="border-b border-[#e4e7ec] last:border-b-0">
                  <TableCell className="px-8 py-9 text-[20px] text-[#475467]">
                    {order.userName}
                  </TableCell>
                  <TableCell className="px-6 py-9 text-[20px] text-[#475467]">
                    {order.labName}
                  </TableCell>
                  <TableCell className="px-6 py-9 text-[20px] text-[#475467]">
                    {formatBookingDate(order.bookingDate)}
                  </TableCell>
                  <TableCell className="px-6 py-9 text-[20px] text-[#475467]">
                    {order.timeSlot}
                  </TableCell>
                  <TableCell className="px-6 py-9">
                    <StatusPill status={order.status} />
                  </TableCell>
                  <TableCell className="px-6 py-9">
                    <ResultStatusPill status={order.resultStatus} />
                  </TableCell>
                  <TableCell className="px-6 py-9">
                    <Link
                      href={`/admin/blood-test-orders/${order.id}`}
                      className="inline-flex h-[60px] w-[76px] items-center justify-center rounded-[16px] border border-[#14b8a6] text-[#129b99] transition-colors hover:bg-[#effcfb]"
                    >
                      <Eye className="h-7 w-7" />
                    </Link>
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
