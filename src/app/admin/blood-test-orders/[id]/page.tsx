'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Check, Loader2, Upload } from 'lucide-react';
import {
  useBloodTestOrder,
  useRunBloodTestOrderAction,
  useUpdateBloodTestOrderResultManagement,
} from '@/hooks/use-blood-test-orders';
import type { BloodTestOrderDetail } from '@/services/blood-test-order-service';

function formatBookingDate(value: string): string {
  return format(new Date(value), 'EEE, MMM d yyyy');
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  if (normalized === 'COMPLETED') {
    return (
      <span className="inline-flex min-w-[184px] items-center justify-center rounded-full border border-[#4d8cc6] px-6 py-3 text-[18px] font-medium text-[#2d6ea8]">
        COMPLETED
      </span>
    );
  }

  if (normalized === 'CANCELLED') {
    return (
      <span className="inline-flex min-w-[184px] items-center justify-center rounded-full border border-[#d0d5dd] px-6 py-3 text-[18px] font-medium text-[#667085]">
        CANCELLED
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-[184px] items-center justify-center rounded-full border border-[#4d8cc6] px-6 py-3 text-[18px] font-medium text-[#2d6ea8]">
      {normalized}
    </span>
  );
}

function BloodTestOrderHeaderActions({
  orderId,
  bookingDate,
  timeSlot,
}: {
  orderId: string;
  bookingDate: string;
  timeSlot: string;
}) {
  const runAction = useRunBloodTestOrderAction();
  const [showActions, setShowActions] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(bookingDate.slice(0, 10));
  const [rescheduleTime, setRescheduleTime] = useState(timeSlot);

  const handleAction = async (action: 'MARK_COMPLETED' | 'CANCEL_BOOKING') => {
    try {
      await runAction.mutateAsync({
        id: orderId,
        payload: { action },
      });
      setShowActions(false);
    } catch (nextError) {
      alert(nextError instanceof Error ? nextError.message : 'Failed to update booking');
    }
  };

  const handleReschedule = async () => {
    try {
      await runAction.mutateAsync({
        id: orderId,
        payload: {
          action: 'RESCHEDULE',
          bookingDate: rescheduleDate,
          timeSlot: rescheduleTime,
        },
      });
      setShowReschedule(false);
      setShowActions(false);
    } catch (nextError) {
      alert(nextError instanceof Error ? nextError.message : 'Failed to reschedule booking');
    }
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowActions((current) => !current)}
          className="flex h-[76px] min-w-[320px] items-center justify-center rounded-[18px] bg-[#14b8a6] px-8 text-[24px] font-medium text-white"
        >
          Actions
        </button>

        {showActions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
            <div className="absolute right-0 top-full z-20 mt-3 w-[320px] overflow-hidden rounded-[18px] border border-[#d0d5dd] bg-white shadow-lg">
              <button
                type="button"
                className="block w-full border-b border-[#e4e7ec] px-5 py-4 text-left text-[20px] font-medium text-[#202124]"
                onClick={() => handleAction('MARK_COMPLETED')}
              >
                Mark as Completed
              </button>
              <p className="border-b border-[#e4e7ec] px-5 pb-4 -mt-3 text-left text-[16px] text-[#98a2b3]">
                Manually enter provider details
              </p>
              <button
                type="button"
                className="block w-full border-b border-[#e4e7ec] px-5 py-4 text-left text-[20px] font-medium text-[#202124]"
                onClick={() => handleAction('CANCEL_BOOKING')}
              >
                Cancel Booking
              </button>
              <p className="border-b border-[#e4e7ec] px-5 pb-4 -mt-3 text-left text-[16px] text-[#98a2b3]">
                Manually enter provider details
              </p>
              <button
                type="button"
                className="block w-full px-5 py-4 text-left text-[20px] font-medium text-[#202124]"
                onClick={() => setShowReschedule(true)}
              >
                Reschedule
              </button>
              <p className="-mt-3 px-5 pb-4 text-left text-[16px] text-[#98a2b3]">
                Send invitation link to provider
              </p>
            </div>
          </>
        )}
      </div>

      {showReschedule && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-8 shadow-xl">
            <h3 className="text-[32px] font-semibold text-[#202124]">Reschedule Booking</h3>
            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-[18px] font-semibold text-[#202124]">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                  className="h-[60px] w-full rounded-[16px] border border-[#d0d5dd] px-4 text-[18px]"
                />
              </div>
              <div>
                <label className="mb-2 block text-[18px] font-semibold text-[#202124]">
                  New Time Slot
                </label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                  placeholder="e.g. 1.00-2.00 PM"
                  className="h-[60px] w-full rounded-[16px] border border-[#d0d5dd] px-4 text-[18px]"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowReschedule(false)}
                className="rounded-[16px] border border-[#14b8a6] px-6 py-3 text-[18px] font-medium text-[#129b99]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReschedule}
                disabled={runAction.isPending}
                className="rounded-[16px] bg-[#14b8a6] px-6 py-3 text-[18px] font-medium text-white disabled:opacity-60"
              >
                {runAction.isPending ? 'Updating...' : 'Save Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BloodTestOrderDetailContent({
  order,
  orderId,
}: {
  order: BloodTestOrderDetail;
  orderId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateResultManagement = useUpdateBloodTestOrderResultManagement();
  const [notes, setNotes] = useState(order.adminNotes ?? '');
  const [markReviewed, setMarkReviewed] = useState(order.resultReviewed);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSaveResultManagement = async () => {
    try {
      await updateResultManagement.mutateAsync({
        id: orderId,
        payload: {
          adminNotes: notes,
          resultReviewed: markReviewed,
          ...(selectedFile
            ? {
                resultFileName: selectedFile.name,
                resultFileType: selectedFile.type || 'application/octet-stream',
              }
            : {}),
        },
      });
      setSelectedFile(null);
    } catch (nextError) {
      alert(nextError instanceof Error ? nextError.message : 'Failed to save changes');
    }
  };

  return (
    <>
      <section>
        <h2 className="text-[48px] font-semibold tracking-[-0.04em] text-[#202124]">
          Booking Information
        </h2>

        <div className="mt-8 rounded-[24px] border border-[#d0d5dd] bg-white p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">User Name</label>
              <div className="rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054]">
                {order.userName}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">Email</label>
              <div className="rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054]">
                {order.email || 'Anonymous User'}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">Selected Lab</label>
              <div className="rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054]">
                {order.selectedLab}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">Date</label>
              <div className="rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054]">
                {formatBookingDate(order.bookingDate)}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">Time</label>
              <div className="rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054]">
                {order.timeSlot}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[18px] font-semibold text-[#202124]">Booking Status</label>
              <div className="pt-1">
                <StatusPill status={order.bookingStatus} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[48px] font-semibold tracking-[-0.04em] text-[#202124]">
          Result Management
        </h2>

        <div className="mt-8 rounded-[24px] border border-[#d0d5dd] bg-white p-6">
          <div>
            <label className="mb-4 block text-[18px] font-semibold text-[#202124]">
              Upload Result File
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-[#9be7df] bg-[#effcfb] px-6 text-center"
            >
              <Upload className="h-14 w-14 text-[#202124]" />
              <p className="mt-6 text-[32px] font-semibold text-[#202124]">
                Upload laboratory result files for this user.
              </p>
              <p className="mt-3 text-[22px] text-[#5f6368]">Supported formats: PDF, PNG, JPG.</p>
              <p className="mt-5 text-[18px] font-semibold text-[#202124]">OR</p>
              <span className="mt-3 text-[20px] font-semibold text-[#0f7f73] underline">
                Browse files
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </button>

            <div className="mt-4 text-[16px] text-[#667085]">
              {selectedFile
                ? `Selected file: ${selectedFile.name}`
                : order.resultFileName
                  ? `Current file: ${order.resultFileName}`
                  : 'No file uploaded yet.'}
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-4 block text-[18px] font-semibold text-[#202124]">Add Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add something notes..."
              className="min-h-[150px] w-full rounded-[16px] border border-[#d0d5dd] px-5 py-4 text-[18px] text-[#344054] outline-none placeholder:text-[#98a2b3]"
            />
          </div>

          <label className="mt-6 flex items-center gap-4 rounded-[16px] border border-[#d0d5dd] px-5 py-5 text-[20px] text-[#202124]">
            <button
              type="button"
              onClick={() => setMarkReviewed((current) => !current)}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] border ${
                markReviewed ? 'border-[#14b8a6] bg-[#14b8a6] text-white' : 'border-[#98a2b3] bg-white text-transparent'
              }`}
            >
              <Check className="h-5 w-5" />
            </button>
            Mark as Reviewed
          </label>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveResultManagement}
              disabled={updateResultManagement.isPending}
              className="rounded-[16px] bg-[#14b8a6] px-8 py-4 text-[18px] font-medium text-white disabled:opacity-60"
            >
              {updateResultManagement.isPending ? 'Saving...' : 'Save Result Management'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BloodTestOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useBloodTestOrder(params.id);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-start justify-between gap-6 border-b border-[#e4e7ec] pb-6">
        <div>
          <Link
            href="/admin/blood-test-orders"
            className="inline-flex items-center gap-2 text-[18px] font-medium text-[#14b8a6]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Blood Test Order
          </Link>
          <h1 className="mt-8 text-[56px] font-semibold tracking-[-0.04em] text-[#202124]">
            Order Details
          </h1>
          <p className="mt-3 text-[22px] text-[#5f6368]">
            Review booking information and manage appointment and result status.
          </p>
        </div>

        {order ? (
          <BloodTestOrderHeaderActions
            key={`${order.id}-${order.bookingDate}-${order.timeSlot}`}
            orderId={params.id}
            bookingDate={order.bookingDate}
            timeSlot={order.timeSlot}
          />
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-[18px] text-[#5f6368]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#14b8a6]" />
        </div>
      ) : error || !order ? (
        <div className="rounded-[24px] border border-[#f1c8c8] bg-[#fff6f6] p-8 text-[18px] text-[#c43d3d]">
          {error?.message || 'Unable to load order'}
        </div>
      ) : (
        <BloodTestOrderDetailContent
          key={`${order.id}-${order.bookingStatus}-${order.resultStatus}-${order.resultFileName ?? 'none'}-${order.resultReviewed ? 'reviewed' : 'pending'}-${order.adminNotes ?? ''}`}
          order={order}
          orderId={params.id}
        />
      )}
    </div>
  );
}
