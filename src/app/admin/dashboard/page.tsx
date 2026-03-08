'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Loader2,
  Microscope,
  Pill,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';

type StatCard = {
  label: string;
  value: string;
  icon: React.ElementType;
  iconClassName: string;
  iconWrapperClassName: string;
};

type DetailRow = {
  label: string;
  value: string;
  href?: string;
  positive?: boolean;
  trending?: boolean;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function OverviewCard({ label, value, icon: Icon, iconClassName, iconWrapperClassName }: StatCard) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 sm:text-[15px]">{label}</p>
          <p className="text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-[38px]">
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrapperClassName}`}>
          <Icon className={`h-6 w-6 ${iconClassName}`} strokeWidth={2.1} />
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  title,
  rows,
}: {
  title: string;
  rows: DetailRow[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[28px] font-bold tracking-[-0.04em] text-slate-950">{title}</h2>
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {rows.map((row, index) => {
          const content = (
            <div
              className={`flex items-center justify-between gap-4 px-6 py-5 ${
                index < rows.length - 1 ? 'border-b border-slate-200' : ''
              }`}
            >
              <span className="text-[15px] font-medium text-slate-600 sm:text-[16px]">
                {row.label}
              </span>
              <span
                className={`flex items-center gap-2 text-lg font-bold tracking-[-0.03em] ${
                  row.positive ? 'text-emerald-500' : 'text-slate-900'
                }`}
              >
                {row.value}
                {row.trending ? <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.2} /> : null}
                {row.href ? <ChevronRight className="h-4.5 w-4.5 text-slate-400" strokeWidth={2.2} /> : null}
              </span>
            </div>
          );

          if (!row.href) {
            return <div key={row.label}>{content}</div>;
          }

          return (
            <Link
              key={row.label}
              href={row.href}
              className="block transition-colors hover:bg-slate-50/80"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DashboardLoadingState() {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-6 py-8 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading dashboard metrics...</span>
      </div>
    </div>
  );
}

function DashboardErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Dashboard data could not be loaded</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.firstName?.trim() || 'Admin';
  const { data, isLoading, error } = useAdminDashboard();

  const overviewStats: StatCard[] = [
    {
      label: 'Total Users',
      value: formatNumber(data?.overview.totalUsers ?? 0),
      icon: Users,
      iconClassName: 'text-[#0ea5a4]',
      iconWrapperClassName: 'bg-[#e9fbfa]',
    },
    {
      label: 'Active Providers',
      value: formatNumber(data?.overview.activeProviders ?? 0),
      icon: UserCheck,
      iconClassName: 'text-[#0f7aa7]',
      iconWrapperClassName: 'bg-[#e9f6fc]',
    },
    {
      label: 'Active Treatments',
      value: formatNumber(data?.overview.activeTreatments ?? 0),
      icon: FileText,
      iconClassName: 'text-[#4f33d1]',
      iconWrapperClassName: 'bg-[#efebff]',
    },
    {
      label: 'Active Supplements',
      value: formatNumber(data?.overview.activeSupplements ?? 0),
      icon: Pill,
      iconClassName: 'text-[#a2870a]',
      iconWrapperClassName: 'bg-[#faf5e8]',
    },
    {
      label: 'Active Labs',
      value: formatNumber(data?.overview.activeLabs ?? 0),
      icon: Microscope,
      iconClassName: 'text-[#b42374]',
      iconWrapperClassName: 'bg-[#fbe8f2]',
    },
    {
      label: 'Orders Requiring Action',
      value: formatNumber(data?.overview.ordersRequiringAction ?? 0),
      icon: ClipboardCheck,
      iconClassName: 'text-[#b86b09]',
      iconWrapperClassName: 'bg-[#fdf0e5]',
    },
  ];

  const engineRows: DetailRow[] = [
    {
      label: 'Treatments Configured in Engine',
      value: formatNumber(data?.recommendationEngine.treatmentsConfigured ?? 0),
    },
    {
      label: 'Supplements Configured in Engine',
      value: formatNumber(data?.recommendationEngine.supplementsConfigured ?? 0),
    },
    {
      label: 'Matching Conflicts Detected',
      value: formatNumber(data?.recommendationEngine.matchingConflictsDetected ?? 0),
      href: '/admin/treatments',
    },
  ];

  const bookingRows: DetailRow[] = [
    {
      label: 'Bookings This Week',
      value: formatNumber(data?.bookingsDiagnostics.bookingsThisWeek ?? 0),
    },
    {
      label: 'Completion Rate',
      value: `${data?.bookingsDiagnostics.completionRate ?? 0}%`,
      positive: (data?.bookingsDiagnostics.completionRate ?? 0) > 0,
      trending: (data?.bookingsDiagnostics.completionRate ?? 0) > 0,
    },
    {
      label: 'Result Awaiting Review',
      value: formatNumber(data?.bookingsDiagnostics.resultsAwaitingReview ?? 0),
    },
  ];

  const operationalRows: DetailRow[] = [
    {
      label: 'Providers Incomplete',
      value: formatNumber(data?.operationalAttention.providersIncomplete ?? 0),
      href: '/admin/providers',
    },
    {
      label: 'Labs without Schedule',
      value: formatNumber(data?.operationalAttention.labsWithoutSchedule ?? 0),
      href: '/admin/labs',
    },
    {
      label: 'Orders Overdue',
      value: formatNumber(data?.operationalAttention.ordersOverdue ?? 0),
      href: '/admin/blood-test-orders',
    },
  ];

  return (
    <div className="animate-fade-in pb-10">
      <section className="max-w-[1400px] space-y-9">
        <div className="space-y-3 pt-2">
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="max-w-4xl text-base leading-7 text-slate-500 sm:text-lg">
            A real-time overview of platform performance, engine activity, and operational risk.
          </p>
        </div>

        {error ? <DashboardErrorState message={error.message} /> : null}

        <div className="border-t border-slate-200 pt-10">
          <section className="space-y-6">
            <h2 className="text-[28px] font-bold tracking-[-0.04em] text-slate-950">Overview</h2>
            {isLoading && !data ? (
              <DashboardLoadingState />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {overviewStats.map((stat) => (
                  <OverviewCard key={stat.label} {...stat} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="grid grid-cols-1 gap-6 pt-6 xl:grid-cols-3">
          <DetailPanel title="Recommendation Engine" rows={engineRows} />
          <DetailPanel title="Bookings & Diagnostics" rows={bookingRows} />
          <DetailPanel title="Operational Attention" rows={operationalRows} />
        </section>
      </section>
    </div>
  );
}
