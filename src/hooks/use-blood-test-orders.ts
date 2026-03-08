import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchBloodTestOrder,
  fetchBloodTestOrders,
  runBloodTestOrderAction,
  updateResultManagement,
  type BloodTestOrderActionPayload,
  type BloodTestOrderDetail,
  type BloodTestOrderListItem,
  type UpdateResultManagementPayload,
} from '@/services/blood-test-order-service';

export const bloodTestOrderKeys = {
  all: ['blood-test-orders'] as const,
  list: (params?: { status?: string; search?: string }) =>
    ['blood-test-orders', 'list', params] as const,
  detail: (id: string) => ['blood-test-orders', 'detail', id] as const,
};

export function useBloodTestOrders(params?: {
  status?: string;
  search?: string;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<BloodTestOrderListItem[]>({
    queryKey: bloodTestOrderKeys.list(params),
    queryFn: () => fetchBloodTestOrders(params),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useBloodTestOrder(id: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<BloodTestOrderDetail>({
    queryKey: bloodTestOrderKeys.detail(id),
    queryFn: () => fetchBloodTestOrder(id),
    enabled: isAuthenticated && !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateBloodTestOrderResultManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateResultManagementPayload }) =>
      updateResultManagement(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bloodTestOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: bloodTestOrderKeys.detail(variables.id) });
    },
  });
}

export function useRunBloodTestOrderAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BloodTestOrderActionPayload }) =>
      runBloodTestOrderAction(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bloodTestOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: bloodTestOrderKeys.detail(variables.id) });
    },
  });
}
