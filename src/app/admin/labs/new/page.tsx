'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Plus, Trash2, MapPin } from 'lucide-react';
import { useCreateLab } from '@/hooks/use-labs';
import { Input } from '@/components/ui/input';

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
  serviceType: {
    homeVisit: boolean;
    onSite: boolean;
  };
  resultTimeEstimate: string;
  status: 'ACTIVE' | 'INACTIVE';
  operatingDays: DaySchedule[];
  autoConfirmBooking: boolean;
  allowReschedule: boolean;
  cancellationWindowHours: number;
  requireManualConfirmation: boolean;
}

const initialFormData: FormData = {
  name: '',
  city: '',
  address: '',
  serviceType: {
    homeVisit: false,
    onSite: true,
  },
  resultTimeEstimate: '1-2 days',
  status: 'ACTIVE',
  operatingDays: [],
  autoConfirmBooking: true,
  allowReschedule: true,
  cancellationWindowHours: 24,
  requireManualConfirmation: false,
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CANCELLATION_OPTIONS = [
  { value: 12, label: '12 hours before appointment' },
  { value: 24, label: '24 hours before appointment' },
  { value: 48, label: '48 hours before appointment' },
  { value: 72, label: '72 hours before appointment' },
];

const RESULT_TIME_OPTIONS = [
  { value: '1-2 days', label: '1-2 days' },
  { value: '2-3 days', label: '2-3 days' },
  { value: '3-5 days', label: '3-5 days' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

// ==========================================
// Reusable UI Components
// ==========================================

function SimpleDropdown({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors h-10"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${value === opt.value ? 'text-teal-600 font-medium bg-teal-50' : 'text-slate-700'
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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'}`}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-teal-500' : 'border-slate-300 bg-white'}`}>
        {checked && <div className="w-2 h-2 rounded-full bg-teal-500" />}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-teal-500' : 'bg-slate-200'
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
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
    <div className="flex items-center gap-4">
      <Input
        type="time"
        value={slot.start}
        onChange={(e) => onUpdate({ ...slot, start: e.target.value })}
        className="w-40 h-10 border-slate-200"
      />
      <span className="text-slate-400 font-medium">-</span>
      <Input
        type="time"
        value={slot.end}
        onChange={(e) => onUpdate({ ...slot, end: e.target.value })}
        className="w-40 h-10 border-slate-200"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className={`p-2 transition-colors ${canRemove ? 'text-slate-400 hover:text-red-500' : 'text-slate-200 cursor-not-allowed'}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function NewLabPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateLab();

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

  const updateServiceType = (key: 'homeVisit' | 'onSite', checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: {
        ...prev.serviceType,
        [key]: checked,
      },
    }));
  };

  const addOperatingDay = () => {
    setFormData((prev) => ({
      ...prev,
      operatingDays: [
        ...prev.operatingDays,
        { day: '', capacity: 5, timeSlots: [{ start: '09:00', end: '12:00' }] },
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
    if (formData.serviceType.homeVisit) serviceTypes.push('HOME_VISIT');
    if (formData.serviceType.onSite) serviceTypes.push('ON_SITE');

    const cityParts = formData.city.split(',');
    const city = cityParts[0].trim();
    const state = cityParts[1]?.trim() || 'NY';

    const validOperatingDays = formData.operatingDays.filter(d => d.day);

    const payload = {
      name: formData.name,
      city,
      state,
      address: formData.address || undefined,
      serviceTypes,
      resultTimeDays: parseInt(formData.resultTimeEstimate.split('-')[1] || formData.resultTimeEstimate) || 3,
      isActive: formData.status === 'ACTIVE',
      operatingDays: validOperatingDays,
      autoConfirmBooking: formData.autoConfirmBooking,
      allowReschedule: formData.allowReschedule,
      cancellationWindowHours: formData.cancellationWindowHours,
      requireManualConfirmation: formData.requireManualConfirmation,
    };

    try {
      await createMutation.mutateAsync(payload);
      router.push('/admin/labs');
    } catch (error) {
      console.error('Failed to create lab:', error);
    }
  };

  return (
    <div className="pb-20 w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin/labs')}
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-500 text-sm font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Labs
        </button>
        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">
          Lab Details
        </h1>
        <p className="text-slate-500">
          Configure how this lab operates, including availability, booking rules, and service settings.
        </p>
      </div>

      <div className="border-b border-slate-200 mb-8 -mx-6 md:-mx-10 px-6 md:px-10" />

      {/* Form Content */}
      <div className="space-y-12">
        {/* Basic Information */}
        <section>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">
            Basic Information
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lab Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Lab Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Lab Name"
                  className={`h-10 ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* City / State */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  City / State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="New York City, NY"
                    className={`h-10 pl-9 ${errors.city ? 'border-red-300' : 'border-slate-200'}`}
                  />
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Address"
                  className="h-10 border-slate-200"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">
                  Service Type
                </label>
                <div className="flex items-center gap-6 mt-1">
                  <Checkbox
                    label="Home visit available"
                    checked={formData.serviceType.homeVisit}
                    onChange={() => updateServiceType('homeVisit', !formData.serviceType.homeVisit)}
                  />
                  <Checkbox
                    label="On-site only"
                    checked={formData.serviceType.onSite}
                    onChange={() => updateServiceType('onSite', !formData.serviceType.onSite)}
                  />
                </div>
              </div>

              {/* Result Time Estimate */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Result Time Estimate
                </label>
                <SimpleDropdown
                  value={formData.resultTimeEstimate}
                  onChange={(v) => updateField('resultTimeEstimate', v)}
                  options={RESULT_TIME_OPTIONS}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Status
                </label>
                <SimpleDropdown
                  value={formData.status}
                  onChange={(v) => updateField('status', v)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            {/* Save Button for Basic Info */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 rounded-md font-medium text-sm transition-colors"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Schedule Configuration */}
        <section>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">
            Schedule Configuration
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {formData.operatingDays.map((schedule, index) => {
                const availableDays = DAYS_OF_WEEK.filter(
                  d => !formData.operatingDays.some(od => od.day === d) || d === schedule.day
                );

                return (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Operating Days */}
                      <div className="w-full md:w-56">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Operating Days
                        </label>
                        <SimpleDropdown
                          value={schedule.day}
                          onChange={(v) => updateOperatingDay(index, { ...schedule, day: v })}
                          options={availableDays.map(d => ({ value: d, label: d }))}
                          placeholder="Select day"
                        />
                      </div>

                      {/* Capacity */}
                      <div className="w-full md:w-28">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Capacity
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={schedule.capacity}
                          onChange={(e) => updateOperatingDay(index, { ...schedule, capacity: parseInt(e.target.value) || 1 })}
                          className="h-10 text-center border-slate-200"
                        />
                      </div>

                      {/* Time Slots */}
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Time Slots per Day
                        </label>
                        <div className="space-y-3">
                          {schedule.timeSlots.map((slot, slotIndex) => (
                            <TimeSlotRow
                              key={slotIndex}
                              slot={slot}
                              onUpdate={(s) => {
                                const newSlots = [...schedule.timeSlots];
                                newSlots[slotIndex] = s;
                                updateOperatingDay(index, { ...schedule, timeSlots: newSlots });
                              }}
                              onRemove={() => {
                                const newSlots = schedule.timeSlots.filter((_, i) => i !== slotIndex);
                                updateOperatingDay(index, { ...schedule, timeSlots: newSlots });
                              }}
                              canRemove={schedule.timeSlots.length > 1}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              updateOperatingDay(index, {
                                ...schedule,
                                timeSlots: [...schedule.timeSlots, { start: '09:00', end: '17:00' }]
                              });
                            }}
                            className="text-teal-500 hover:text-teal-600 font-medium text-sm flex items-center gap-1 mt-3"
                          >
                            <Plus className="w-4 h-4" />
                            Add Time
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addOperatingDay}
                className="w-full py-3.5 border border-teal-500 rounded-lg text-teal-500 hover:bg-teal-50 font-medium text-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Operating Day
              </button>
            </div>
          </div>
        </section>

        {/* Booking Rules */}
        <section>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">
            Booking Rules
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Auto-confirm */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">
                  Auto-confirm booking?
                </label>
                <div className="flex items-center gap-6">
                  <Radio
                    label="Yes"
                    checked={formData.autoConfirmBooking}
                    onChange={() => updateField('autoConfirmBooking', true)}
                  />
                  <Radio
                    label="No"
                    checked={!formData.autoConfirmBooking}
                    onChange={() => updateField('autoConfirmBooking', false)}
                  />
                </div>
              </div>

              {/* Allow reschedule */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">
                  Allow reschedule?
                </label>
                <div className="flex items-center gap-6">
                  <Radio
                    label="Yes"
                    checked={formData.allowReschedule}
                    onChange={() => updateField('allowReschedule', true)}
                  />
                  <Radio
                    label="No"
                    checked={!formData.allowReschedule}
                    onChange={() => updateField('allowReschedule', false)}
                  />
                </div>
              </div>

              {/* Cancellation window */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Cancellation window
                </label>
                <SimpleDropdown
                  value={formData.cancellationWindowHours}
                  onChange={(v) => updateField('cancellationWindowHours', parseInt(v))}
                  options={CANCELLATION_OPTIONS}
                />
              </div>

              {/* Require manual confirmation */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Require manual confirmation?
                </label>
                <div className="flex items-center mt-1">
                  <ToggleSwitch
                    checked={formData.requireManualConfirmation}
                    onChange={(v) => updateField('requireManualConfirmation', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
