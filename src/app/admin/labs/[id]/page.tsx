'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Check, Plus, X, Trash2 } from 'lucide-react';
import { useLab, useUpdateLab } from '@/hooks/use-labs';
import { Input } from '@/components/ui/input';
import type { OperatingDay } from '@/services/lab-service';

// ==========================================
// Form Types
// ==========================================

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  capacity: number;
  timeSlots: TimeSlot[];
}

interface FormData {
  name: string;
  city: string;
  address: string;
  serviceType: 'HOME_VISIT' | 'ON_SITE' | 'BOTH';
  resultTimeDays: number;
  status: 'ACTIVE' | 'INACTIVE';
  operatingDays: DaySchedule[];
  autoConfirmBooking: boolean;
  allowReschedule: boolean;
  cancellationWindowHours: number;
  requireManualConfirmation: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CANCELLATION_OPTIONS = [
  { value: 12, label: '12 hours before appointment' },
  { value: 24, label: '24 hours before appointment' },
  { value: 48, label: '48 hours before appointment' },
  { value: 72, label: '72 hours before appointment' },
];

// ==========================================
// Dropdown Component
// ==========================================

function SimpleDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(String(opt.value));
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  value === opt.value ? 'text-teal-600 font-medium bg-teal-50' : 'text-slate-700'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// Time Slot Row Component
// ==========================================

function TimeSlotRow({
  slot,
  onUpdate,
  onRemove,
  canRemove,
}: {
  slot: TimeSlot;
  onUpdate: (slot: TimeSlot) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={slot.start}
        onChange={(e) => onUpdate({ ...slot, start: e.target.value })}
        className="w-28"
      />
      <Input
        type="time"
        value={slot.end}
        onChange={(e) => onUpdate({ ...slot, end: e.target.value })}
        className="w-28"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ==========================================
// Operating Day Section
// ==========================================

function OperatingDaySection({
  schedule,
  onUpdate,
  onRemove,
  canRemove,
  availableDays,
}: {
  schedule: DaySchedule;
  onUpdate: (schedule: DaySchedule) => void;
  onRemove: () => void;
  canRemove: boolean;
  availableDays: string[];
}) {
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const addTimeSlot = () => {
    onUpdate({
      ...schedule,
      timeSlots: [...schedule.timeSlots, { start: '09:00', end: '17:00' }],
    });
  };

  const updateTimeSlot = (index: number, slot: TimeSlot) => {
    const newSlots = [...schedule.timeSlots];
    newSlots[index] = slot;
    onUpdate({ ...schedule, timeSlots: newSlots });
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = schedule.timeSlots.filter((_, i) => i !== index);
    onUpdate({ ...schedule, timeSlots: newSlots });
  };

  // Include current day in available options
  const dayOptions = [...new Set([schedule.day, ...availableDays])];

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-4">
        {/* Day Dropdown */}
        <div className="relative w-40">
          <button
            type="button"
            onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-900">{schedule.day}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {dayDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDayDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                {dayOptions.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onUpdate({ ...schedule, day });
                      setDayDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      schedule.day === day ? 'text-teal-600 font-medium bg-teal-50' : 'text-slate-700'
                    }`}
                  >
                    {day}
                    {schedule.day === day && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={schedule.capacity}
            onChange={(e) => onUpdate({ ...schedule, capacity: parseInt(e.target.value) || 1 })}
            className="w-16 text-center"
          />
        </div>

        {/* Remove Day Button */}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-auto"
            title="Remove day"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Time Slots */}
      <div className="space-y-2 pl-1">
        {schedule.timeSlots.map((slot, index) => (
          <TimeSlotRow
            key={index}
            slot={slot}
            onUpdate={(s) => updateTimeSlot(index, s)}
            onRemove={() => removeTimeSlot(index)}
            canRemove={schedule.timeSlots.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={addTimeSlot}
          className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 mt-2"
        >
          <Plus className="w-4 h-4" />
          Add Time
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Toggle Switch Component
// ==========================================

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
          checked ? 'bg-teal-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div>
        <span className="font-medium text-slate-900">{label}</span>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
    </label>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function LabDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    city: '',
    address: '',
    serviceType: 'ON_SITE',
    resultTimeDays: 3,
    status: 'ACTIVE',
    operatingDays: [],
    autoConfirmBooking: true,
    allowReschedule: true,
    cancellationWindowHours: 24,
    requireManualConfirmation: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing lab
  const { data: lab, isLoading, error } = useLab(id);
  const updateMutation = useUpdateLab();

  // Populate form when data loads
  useEffect(() => {
    if (lab) {
      setFormData({
        name: lab.name,
        city: lab.city,
        address: lab.address || '',
        serviceType: lab.serviceTypes.includes('HOME_VISIT')
          ? lab.serviceTypes.includes('ON_SITE') ? 'BOTH' : 'HOME_VISIT'
          : 'ON_SITE',
        resultTimeDays: lab.resultTimeDays,
        status: lab.isActive ? 'ACTIVE' : 'INACTIVE',
        operatingDays: lab.operatingDays?.length > 0 ? lab.operatingDays : [],
        autoConfirmBooking: lab.autoConfirmBooking,
        allowReschedule: lab.allowReschedule,
        cancellationWindowHours: lab.cancellationWindowHours || 24,
        requireManualConfirmation: lab.requireManualConfirmation,
      });
    }
  }, [lab]);

  const updateField = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addOperatingDay = () => {
    setFormData((prev) => ({
      ...prev,
      operatingDays: [
        ...prev.operatingDays,
        { day: '', capacity: 5, timeSlots: [{ start: '09:00', end: '17:00' }] },
      ],
    }));
  };

  const updateOperatingDay = (index: number, schedule: DaySchedule) => {
    setFormData((prev) => {
      const newDays = [...prev.operatingDays];
      newDays[index] = schedule;
      return { ...prev, operatingDays: newDays };
    });
  };

  const removeOperatingDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      operatingDays: prev.operatingDays.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Lab name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const serviceTypes: string[] = [];
    if (formData.serviceType === 'HOME_VISIT') serviceTypes.push('HOME_VISIT');
    else if (formData.serviceType === 'ON_SITE') serviceTypes.push('ON_SITE');
    else {
      serviceTypes.push('HOME_VISIT', 'ON_SITE');
    }

    // Filter out empty days
    const validOperatingDays = formData.operatingDays.filter(d => d.day);

    const payload = {
      name: formData.name,
      city: formData.city,
      state: lab?.state || 'NY',
      address: formData.address || undefined,
      serviceTypes,
      resultTimeDays: formData.resultTimeDays,
      isActive: formData.status === 'ACTIVE',
      operatingDays: validOperatingDays,
      autoConfirmBooking: formData.autoConfirmBooking,
      allowReschedule: formData.allowReschedule,
      cancellationWindowHours: formData.cancellationWindowHours,
      requireManualConfirmation: formData.requireManualConfirmation,
    };

    try {
      await updateMutation.mutateAsync({ id, payload });
      router.push('/admin/labs');
    } catch (error) {
      console.error('Failed to update lab:', error);
    }
  };

  const serviceTypeOptions = [
    { value: 'HOME_VISIT', label: 'Home Visit' },
    { value: 'ON_SITE', label: 'On-site Only' },
    { value: 'BOTH', label: 'Both Available' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading lab details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error.message}</p>
          <Link
            href="/admin/labs"
            className="mt-3 text-teal-600 hover:underline text-sm inline-block"
          >
            Back to Labs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-10 py-4 -mx-6 md:-mx-10 mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin/labs')}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Labs
        </button>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Lab Details
        </h1>
        <p className="text-slate-500 mt-1 text-base">
          Configure how this lab operates, including availability, booking rules, and service settings.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
            Basic Information
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Lab Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lab Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Quest Diagnostics"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g., New York City, NY"
                  className={errors.city ? 'border-red-300' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="e.g., 123 Main St"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service Type
                </label>
                <SimpleDropdown
                  value={formData.serviceType}
                  onChange={(v) => updateField('serviceType', v)}
                  options={serviceTypeOptions}
                />
              </div>

              {/* Result Time Estimate */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Result Time Estimate
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={formData.resultTimeDays}
                    onChange={(e) => updateField('resultTimeDays', parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-slate-600 text-sm">days</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <SimpleDropdown
                  value={formData.status}
                  onChange={(v) => updateField('status', v)}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operating Schedule */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
            Operating Schedule
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {formData.operatingDays.length === 0 ? (
              <p className="text-slate-500 text-sm">No operating days configured.</p>
            ) : (
              <div className="space-y-4">
                {formData.operatingDays.map((schedule, index) => (
                  <OperatingDaySection
                    key={index}
                    schedule={schedule}
                    onUpdate={(s) => updateOperatingDay(index, s)}
                    onRemove={() => removeOperatingDay(index)}
                    canRemove={formData.operatingDays.length > 1}
                    availableDays={DAYS_OF_WEEK.filter(d => !formData.operatingDays.some(od => od.day === d))}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={addOperatingDay}
              className="w-full py-3 border border-dashed border-teal-300 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Operating Day
            </button>
          </div>
        </section>

        {/* Booking Rules */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
            Booking Rules
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <ToggleSwitch
              checked={formData.autoConfirmBooking}
              onChange={(v) => updateField('autoConfirmBooking', v)}
              label="Auto-confirm Bookings"
              description="Automatically confirm bookings without manual review"
            />

            <ToggleSwitch
              checked={formData.allowReschedule}
              onChange={(v) => updateField('allowReschedule', v)}
              label="Allow Reschedule"
              description="Allow patients to reschedule their appointments"
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cancellation Window
              </label>
              <SimpleDropdown
                value={formData.cancellationWindowHours}
                onChange={(v) => updateField('cancellationWindowHours', parseInt(v))}
                options={CANCELLATION_OPTIONS}
              />
            </div>

            <ToggleSwitch
              checked={formData.requireManualConfirmation}
              onChange={(v) => updateField('requireManualConfirmation', v)}
              label="Require Manual Confirmation"
              description="Require staff to manually confirm each booking"
            />
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/admin/labs"
            className="px-5 py-2.5 text-slate-600 hover:text-slate-700 font-medium text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            {updateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
