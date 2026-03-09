'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// Component Props
// ==========================================

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  label?: string;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================
// Component
// ==========================================

export function FilterDropdown<T extends string>({
  value,
  onChange,
  options,
  label = 'Filter',
  placeholder = 'Select...',
  className,
  size = 'sm',
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const buttonSizes = {
    sm: 'h-10 px-4 py-2 text-sm rounded-lg',
    md: 'h-11 px-4 py-2 text-sm rounded-lg',
    lg: 'h-[72px] min-w-[300px] px-7 text-[20px] rounded-[18px]',
  };

  const dropdownSizes = {
    sm: 'w-48 rounded-lg py-1',
    md: 'w-48 rounded-lg py-1',
    lg: 'w-full rounded-[18px] p-2',
  };

  const optionSizes = {
    sm: 'px-4 py-2 text-sm rounded-none',
    md: 'px-4 py-2 text-sm rounded-none',
    lg: 'px-4 py-3 text-[18px] rounded-[12px]',
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center justify-between gap-2 border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 transition-colors',
          buttonSizes[size]
        )}
      >
        <span>
          {label}: {displayLabel}
        </span>
        <ChevronDown className={cn('text-slate-400', size === 'lg' ? 'w-6 h-6' : 'w-4 h-4')} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full z-20 mt-1 border border-slate-200 bg-white shadow-lg',
            dropdownSizes[size]
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full text-left transition-colors hover:bg-slate-50',
                optionSizes[size],
                value === option.value
                  ? 'text-teal-600 font-medium bg-teal-50'
                  : 'text-slate-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Predefined Filter Options
// ==========================================

export const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const PROVIDER_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_APPROVAL', label: 'Incomplete' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const ORDER_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'SCHEDULED', label: 'SCHEDULED' },
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];
