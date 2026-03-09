import { cn } from '@/lib/utils';

// ==========================================
// Component Props
// ==========================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'large';
}

// ==========================================
// Component
// ==========================================

export function PageHeader({
  title,
  subtitle,
  count,
  countLabel = 'Active',
  action,
  className,
  variant = 'default',
}: PageHeaderProps) {
  if (variant === 'large') {
    return (
      <div className={cn('border-b border-[#e4e7ec] pb-5', className)}>
        <h1 className="text-[56px] font-semibold tracking-[-0.04em] text-[#202124]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[22px] text-[#5f6368]">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          {title}
          {count !== undefined && (
            <span className="text-slate-400 font-normal text-xl ml-2">
              ({count} {countLabel})
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-slate-500 mt-1 text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
