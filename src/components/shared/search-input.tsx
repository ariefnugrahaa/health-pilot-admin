'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ==========================================
// Component Props
// ==========================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================
// Component
// ==========================================

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
  size = 'sm',
}: SearchInputProps) {
  const containerSizes = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80 max-w-[420px]',
  };

  const inputSizes = {
    sm: 'h-10 pl-10 text-sm',
    md: 'h-11 pl-10 text-base',
    lg: 'h-[72px] pl-16 text-[20px] rounded-[18px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-4 h-4 left-3',
    lg: 'w-7 h-7 left-7',
  };

  return (
    <div className={cn('relative', containerSizes[size], className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-slate-400',
          iconSizes[size]
        )}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'bg-white border-slate-200',
          inputSizes[size],
          inputClassName
        )}
      />
    </div>
  );
}
