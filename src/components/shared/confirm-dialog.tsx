'use client';

import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ==========================================
// Types
// ==========================================

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ==========================================
// Hook
// ==========================================

let confirmResolver: ((value: boolean) => void) | null = null;
let setDialogState: ((state: ConfirmState) => void) | null = null;

/**
 * Hook to show a confirmation dialog.
 * Returns a function that shows a dialog and resolves to true/false.
 *
 * @example
 * const confirm = useConfirm();
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete item?',
 *     description: 'This action cannot be undone.',
 *     variant: 'destructive',
 *   });
 *   if (confirmed) {
 *     deleteMutation.mutate(id);
 *   }
 * };
 */
export function useConfirm() {
  const [, setState] = useState<ConfirmState>({
    isOpen: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Register state setter
  setDialogState = setState;

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolver = resolve;

      const handleConfirm = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        resolve(true);
        confirmResolver = null;
      };

      const handleCancel = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        resolve(false);
        confirmResolver = null;
      };

      setState({
        isOpen: true,
        title: options.title ?? 'Are you sure?',
        description: options.description ?? 'This action cannot be undone.',
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? 'default',
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  }, []);

  return confirm;
}

// ==========================================
// Provider Component
// ==========================================

/**
 * Add this component at the root of your app (inside QueryProvider).
 * It renders the confirmation dialog globally.
 */
export function ConfirmDialogProvider() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Register state setter on mount
  useState(() => {
    setDialogState = setState;
  });

  const handleConfirm = () => {
    state.onConfirm();
  };

  const handleCancel = () => {
    state.onCancel();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  return (
    <AlertDialog open={state.isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          {state.description && (
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {state.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              state.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : ''
            }
          >
            {state.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
