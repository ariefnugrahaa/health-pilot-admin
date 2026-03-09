'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useBloodTestOrders } from '@/hooks/use-blood-test-orders';
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
  getOrderStatusVariant,
  getResultStatusVariant,
  ORDER_STATUS_FILTER_OPTIONS,
} from '@/components/shared';

function formatBookingDate(value: string): string {
  return format(new Date(value), 'EEE, MMM d yyyy');
}

export default function BloodTestOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data: orders = [], isLoading, error, refetch } = useBloodTestOrders({
    status: statusFilter,
    search: search || undefined,
  });

  const tableRows = useMemo(() => orders, [orders]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <PageHeader
        title="Blood Test Orders"
        subtitle="Track, manage, and update the lifecycle of all user blood test bookings."
        variant="large"
      />

      <div className="flex items-center justify-between gap-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          size="lg"
        />
        <FilterDropdown
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          options={ORDER_STATUS_FILTER_OPTIONS}
          label="Status"
          size="lg"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#d0d5dd] bg-white">
        {isLoading ? (
          <LoadingState message="Loading blood test orders..." />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : tableRows.length === 0 ? (
          <EmptyState message="No blood test orders found." />
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
                    <StatusPill variant={getOrderStatusVariant(order.status)} size="lg" />
                  </TableCell>
                  <TableCell className="px-6 py-9">
                    <StatusPill variant={getResultStatusVariant(order.resultStatus)} size="md" />
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
