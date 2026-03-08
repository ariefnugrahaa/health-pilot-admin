// ============================================
// Lab Service - API calls for lab management
// ============================================

import { api } from '@/lib/api-client';

export interface OperatingDay {
  day: string;
  capacity: number;
  timeSlots: { start: string; end: string }[];
}

export interface Lab {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string | null;
  serviceTypes: string[];
  resultTimeDays: number;
  isActive: boolean;
  operatingDays: OperatingDay[];
  autoConfirmBooking: boolean;
  allowReschedule: boolean;
  cancellationWindowHours: number | null;
  requireManualConfirmation: boolean;
  createdAt: string;
  updatedAt: string;
  // Derived fields for list display
  location?: string;
  serviceType?: string;
  resultTime?: string;
  slotsConfigured?: string;
  bookingsCount?: number;
}

export interface CreateLabPayload {
  name: string;
  city: string;
  state: string;
  address?: string;
  serviceTypes?: string[];
  resultTimeDays?: number;
  isActive?: boolean;
  operatingDays?: OperatingDay[];
  autoConfirmBooking?: boolean;
  allowReschedule?: boolean;
  cancellationWindowHours?: number;
  requireManualConfirmation?: boolean;
}

export type UpdateLabPayload = Partial<CreateLabPayload>;

// ============================================
// Fetch Labs
// ============================================
export async function fetchLabs(params?: {
  status?: string;
  search?: string;
}): Promise<Lab[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const response = await api.get(`/admin/labs?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch labs');
  }

  const json = await response.json();
  return json.data;
}

// ============================================
// Fetch Single Lab
// ============================================
export async function fetchLab(id: string): Promise<Lab> {
  const response = await api.get(`/admin/labs/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch lab');
  }

  const json = await response.json();
  return json.data;
}

// ============================================
// Create Lab
// ============================================
export async function createLab(payload: CreateLabPayload): Promise<Lab> {
  const response = await api.post('/admin/labs', payload);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create lab');
  }

  const json = await response.json();
  return json.data;
}

// ============================================
// Update Lab
// ============================================
export async function updateLab(id: string, payload: UpdateLabPayload): Promise<Lab> {
  const response = await api.patch(`/admin/labs/${id}`, payload);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update lab');
  }

  const json = await response.json();
  return json.data;
}

// ============================================
// Delete Lab
// ============================================
export async function deleteLab(id: string): Promise<void> {
  const response = await api.delete(`/admin/labs/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete lab');
  }
}
