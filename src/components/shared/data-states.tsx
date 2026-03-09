import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// Loading State
// ==========================================

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: 'spinner' | 'skeleton';
}

export function LoadingState({
  message = 'Loading...',
  className,
  variant = 'spinner',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 p-6', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// ==========================================
// Empty State
// ==========================================

interface EmptyStateProps {
  message?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  message = 'No data found',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="text-center">
        <p className="text-slate-500 font-medium">{message}</p>
        {description && (
          <p className="text-slate-400 text-sm mt-1">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

// ==========================================
// Error State
// ==========================================

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'inline' | 'card';
}

export function ErrorState({
  message = 'An error occurred',
  onRetry,
  className,
  variant = 'inline',
}: ErrorStateProps) {
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-[20px] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Data could not be loaded</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="text-center">
        <p className="text-red-500 font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-teal-600 hover:underline text-sm"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Combined Table State Handler
// ==========================================

interface TableStateHandlerProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function TableStateHandler({
  isLoading,
  error,
  isEmpty,
  loadingMessage,
  emptyMessage = 'No data found',
  emptyDescription,
  onRetry,
  children,
}: TableStateHandlerProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  return <>{children}</>;
}
