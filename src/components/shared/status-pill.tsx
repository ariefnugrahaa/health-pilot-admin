import { cn } from '@/lib/utils';

// ==========================================
// Status Configuration
// ==========================================

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'completed'
  | 'cancelled'
  | 'scheduled'
  | 'uploaded'
  | 'reviewed'
  | 'not_uploaded'
  | 'included'
  | 'not_included'
  | 'home_visit'
  | 'on_site';

interface StatusConfig {
  label: string;
  classes: string;
}

const STATUS_CONFIG: Record<StatusVariant, StatusConfig> = {
  active: {
    label: 'ACTIVE',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  inactive: {
    label: 'INACTIVE',
    classes: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  pending: {
    label: 'INCOMPLETE SETUP',
    classes: 'bg-slate-900 text-white border-slate-900',
  },
  suspended: {
    label: 'SUSPENDED',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  completed: {
    label: 'COMPLETED',
    classes: 'border-[#36a269] text-[#22925b]',
  },
  cancelled: {
    label: 'CANCELLED',
    classes: 'border-[#d0d5dd] text-[#667085]',
  },
  scheduled: {
    label: 'SCHEDULED',
    classes: 'border-[#4d8cc6] text-[#2d6ea8]',
  },
  uploaded: {
    label: 'Uploaded',
    classes: 'border-[#2f3b4d] text-[#2f3b4d]',
  },
  reviewed: {
    label: 'Reviewed',
    classes: 'border-[#0f9a89] text-[#0f9a89]',
  },
  not_uploaded: {
    label: 'Not Uploaded',
    classes: 'border-[#98a2b3] text-[#98a2b3]',
  },
  included: {
    label: 'Included',
    classes: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  not_included: {
    label: 'Not Included',
    classes: 'bg-white text-slate-400 border-slate-200',
  },
  home_visit: {
    label: 'Home visit available',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  on_site: {
    label: 'On-site only',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

// ==========================================
// Component Props
// ==========================================

interface StatusPillProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================
// Component
// ==========================================

export function StatusPill({ variant, label, className, size = 'sm' }: StatusPillProps) {
  const config = STATUS_CONFIG[variant];

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-4 py-2 text-[15px]',
    lg: 'px-4 py-2 text-[15px] min-w-[136px] justify-center',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border',
        config.classes,
        sizeClasses[size],
        className
      )}
    >
      {label || config.label}
    </span>
  );
}

// ==========================================
// Helper Functions for Common Patterns
// ==========================================

/**
 * Map a boolean isActive to StatusVariant
 */
export function getActiveStatusVariant(isActive: boolean): StatusVariant {
  return isActive ? 'active' : 'inactive';
}

/**
 * Map provider status string to StatusVariant
 */
export function getProviderStatusVariant(status: string): StatusVariant {
  const mapping: Record<string, StatusVariant> = {
    ACTIVE: 'active',
    PENDING_APPROVAL: 'pending',
    SUSPENDED: 'suspended',
    INACTIVE: 'inactive',
  };
  return mapping[status] || 'inactive';
}

/**
 * Map blood test order status to StatusVariant
 */
export function getOrderStatusVariant(status: string): StatusVariant {
  const normalized = status.toUpperCase();
  const mapping: Record<string, StatusVariant> = {
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    SCHEDULED: 'scheduled',
    PENDING: 'scheduled',
  };
  return mapping[normalized] || 'scheduled';
}

/**
 * Map result status to StatusVariant
 */
export function getResultStatusVariant(status: string): StatusVariant {
  const mapping: Record<string, StatusVariant> = {
    Uploaded: 'uploaded',
    Reviewed: 'reviewed',
    'Not Uploaded': 'not_uploaded',
  };
  return mapping[status] || 'not_uploaded';
}
