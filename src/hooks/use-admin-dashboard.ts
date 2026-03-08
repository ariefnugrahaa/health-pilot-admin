import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { getAdminDashboard, type AdminDashboardData } from '@/services/admin-dashboard-service';

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
};

export function useAdminDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<AdminDashboardData, Error>({
    queryKey: adminDashboardKeys.all,
    queryFn: getAdminDashboard,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}
