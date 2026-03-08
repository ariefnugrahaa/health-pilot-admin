import { api } from '@/lib/api-client';

export interface BloodTestOrderListItem {
  id: string;
  userName: string;
  email: string | null;
  labName: string;
  bookingDate: string;
  timeSlot: string;
  status: string;
  resultStatus: 'Uploaded' | 'Not Uploaded' | 'Reviewed';
  resultFileName: string | null;
  reviewedAt: string | null;
  bloodTestId: string | null;
}

export interface BloodTestOrderDetail {
  id: string;
  userName: string;
  email: string | null;
  selectedLab: string;
  labAddress: string;
  bookingDate: string;
  timeSlot: string;
  bookingStatus: string;
  resultStatus: 'Uploaded' | 'Not Uploaded' | 'Reviewed';
  resultFileName: string | null;
  resultFileType: string | null;
  resultUploadedAt: string | null;
  resultReviewed: boolean;
  reviewedAt: string | null;
  adminNotes: string | null;
  bloodTest: {
    id: string;
    status: string;
    panelType: string;
    orderedAt: string | null;
    resultsReceivedAt: string | null;
  } | null;
}

export interface UpdateResultManagementPayload {
  adminNotes?: string;
  resultReviewed?: boolean;
  resultFileName?: string | null;
  resultFileType?: string | null;
  clearResultFile?: boolean;
}

export interface BloodTestOrderActionPayload {
  action: 'MARK_COMPLETED' | 'CANCEL_BOOKING' | 'RESCHEDULE';
  bookingDate?: string;
  timeSlot?: string;
}

export async function fetchBloodTestOrders(params?: {
  status?: string;
  search?: string;
}): Promise<BloodTestOrderListItem[]> {
  const query = new URLSearchParams();
  if (params?.status) {
    query.set('status', params.status);
  }
  if (params?.search) {
    query.set('search', params.search);
  }

  const response = await api.get(`/admin/blood-test-orders?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch blood test orders');
  }

  const json = await response.json();
  return json.data;
}

export async function fetchBloodTestOrder(id: string): Promise<BloodTestOrderDetail> {
  const response = await api.get(`/admin/blood-test-orders/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch blood test order');
  }

  const json = await response.json();
  return json.data;
}

export async function updateResultManagement(
  id: string,
  payload: UpdateResultManagementPayload
): Promise<BloodTestOrderDetail> {
  const response = await api.patch(`/admin/blood-test-orders/${id}/result-management`, payload);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update result management');
  }

  const detailResponse = await fetchBloodTestOrder(id);
  return detailResponse;
}

export async function runBloodTestOrderAction(
  id: string,
  payload: BloodTestOrderActionPayload
): Promise<BloodTestOrderDetail> {
  const response = await api.post(`/admin/blood-test-orders/${id}/actions`, payload);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update booking status');
  }

  const detailResponse = await fetchBloodTestOrder(id);
  return detailResponse;
}
