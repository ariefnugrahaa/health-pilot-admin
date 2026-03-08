import { api } from '@/lib/api-client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { timestamp: string };
  error?: { code: string; message: string };
}

export interface AdminDashboardData {
  overview: {
    totalUsers: number;
    activeProviders: number;
    activeTreatments: number;
    activeSupplements: number;
    activeLabs: number;
    ordersRequiringAction: number;
  };
  recommendationEngine: {
    treatmentsConfigured: number;
    supplementsConfigured: number;
    matchingConflictsDetected: number;
  };
  bookingsDiagnostics: {
    bookingsThisWeek: number;
    completionRate: number;
    resultsAwaitingReview: number;
  };
  operationalAttention: {
    providersIncomplete: number;
    labsWithoutSchedule: number;
    ordersOverdue: number;
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await api.get('/admin/dashboard');
  const data: ApiResponse<AdminDashboardData> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch admin dashboard');
  }

  return data.data;
}
