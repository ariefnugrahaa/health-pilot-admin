'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useIntakeFlow } from '@/hooks/use-intake-flows';
import { cn } from '@/lib/utils';
import type { IntakeFlowField, IntakeFlowFieldValidationRules } from '@/types/intake';

function normalizeValidationRules(
  rules: IntakeFlowFieldValidationRules | Record<string, unknown> | null | undefined,
): IntakeFlowFieldValidationRules {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
    return {};
  }

  return rules as IntakeFlowFieldValidationRules;
}

function parseNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function getSliderConfig(field: IntakeFlowField) {
  const validationRules = normalizeValidationRules(field.validationRules);
  if (field.type !== 'NUMBER' || validationRules.renderAs !== 'slider') {
    return null;
  }

  const min = typeof validationRules.min === 'number' ? validationRules.min : 1;
  const configuredMax = typeof validationRules.max === 'number' ? validationRules.max : 10;
  const max = configuredMax > min ? configuredMax : min + 1;
  const step = typeof validationRules.step === 'number' && validationRules.step > 0
    ? validationRules.step
    : 1;

  return {
    min,
    max,
    step,
    leftLabel: validationRules.leftLabel,
    rightLabel: validationRules.rightLabel,
    showValue: validationRules.showValue !== false,
  };
}

function getSliderFillPercentage(value: number | undefined, min: number, max: number): number {
  if (value === undefined || max <= min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
}

function getChoiceColumns(field: IntakeFlowField): string {
  const validationRules = normalizeValidationRules(field.validationRules);

  if (validationRules.choiceStyle !== 'card-grid') {
    return 'grid-cols-1';
  }

  if (validationRules.columns === 3) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }

  return 'grid-cols-1 sm:grid-cols-2';
}

function isFieldVisible(field: IntakeFlowField, values: Record<string, unknown>): boolean {
  if (!field.dependsOnField) {
    return true;
  }

  const dependentValue = values[field.dependsOnField];
  if (dependentValue === undefined || dependentValue === null || dependentValue === '') {
    return false;
  }

  if (!field.dependsOnValue || field.dependsOnValue.trim() === '') {
    return Array.isArray(dependentValue) ? dependentValue.length > 0 : Boolean(dependentValue);
  }

  const expectedValues = field.dependsOnValue
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (expectedValues.length === 0) {
    return true;
  }

  if (Array.isArray(dependentValue)) {
    const normalizedArray = dependentValue.map((value) => String(value).toLowerCase());
    return expectedValues.some((expectedValue) => normalizedArray.includes(expectedValue));
  }

  return expectedValues.includes(String(dependentValue).toLowerCase());
}

function pruneHiddenFieldValues(
  fields: IntakeFlowField[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const nextValues = { ...values };

  let didChange = true;
  while (didChange) {
    didChange = false;
    const visibleFieldKeys = new Set(
      fields.filter((field) => isFieldVisible(field, nextValues)).map((field) => field.fieldKey),
    );

    for (const field of fields) {
      if (!visibleFieldKeys.has(field.fieldKey) && field.fieldKey in nextValues) {
        delete nextValues[field.fieldKey];
        didChange = true;
      }
    }
  }

  return nextValues;
}

export default function PreviewIntakeFlowPage() {
  const router = useRouter();
  const { id } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const { data: flow, isLoading, error } = useIntakeFlow(id as string);
  const prunedFormData = useMemo(
    () => pruneHiddenFieldValues((flow?.sections ?? []).flatMap((section) => section.fields), formData),
    [flow?.sections, formData]
  );
  const visibleSections = useMemo(
    () =>
      (flow?.sections ?? []).filter((section) => {
        if (section.fields.length === 0) {
          return true;
        }
        return section.fields.some((field) => isFieldVisible(field, prunedFormData));
      }),
    [flow?.sections, prunedFormData]
  );
  const safeCurrentSectionIndex =
    visibleSections.length === 0 ? 0 : Math.min(currentSection, visibleSections.length - 1);
  const currentSectionData = visibleSections[safeCurrentSectionIndex];
  const visibleFields = currentSectionData?.fields.filter((field) => isFieldVisible(field, prunedFormData)) ?? [];
  const isLastSection = safeCurrentSectionIndex === visibleSections.length - 1;
  const isFirstSection = safeCurrentSectionIndex === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load intake flow for preview. Please try again later.
        </div>
      </div>
    );
  }


  const handleNext = () => {
    if (!isLastSection) {
      setCurrentSection(safeCurrentSectionIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstSection) {
      setCurrentSection(safeCurrentSectionIndex - 1);
    } else {
      router.push(`/admin/intake/${flow.id}/edit`);
    }
  };

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setFormData((prev) =>
      pruneHiddenFieldValues(
        (flow?.sections ?? []).flatMap((section) => section.fields),
        {
          ...prev,
          [fieldKey]: value,
        },
      )
    );
  };

  const renderField = (field: IntakeFlowField) => {
    const value = prunedFormData[field.fieldKey];

    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            placeholder={field.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        );
      case 'EMAIL':
        return (
          <input
            type="email"
            placeholder={field.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        );
      case 'NUMBER':
        if (getSliderConfig(field)) {
          const sliderConfig = getSliderConfig(field);
          const parsedValue = parseNumericValue(value);
          const sliderValue = parsedValue ?? sliderConfig!.min;
          const fillPercentage = getSliderFillPercentage(parsedValue, sliderConfig!.min, sliderConfig!.max);

          return (
            <div className="space-y-3">
              <input
                aria-label={field.label}
                type="range"
                min={sliderConfig!.min}
                max={sliderConfig!.max}
                step={sliderConfig!.step}
                value={sliderValue}
                onChange={(event) => handleFieldChange(field.fieldKey, Number(event.target.value))}
                className={cn(
                  'h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent',
                  '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full',
                  '[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#0f766e] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md',
                  '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent',
                  '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#0f766e] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md'
                )}
                style={{
                  background: `linear-gradient(to right, #0f766e 0%, #0f766e ${fillPercentage}%, #d9f2ee ${fillPercentage}%, #d9f2ee 100%)`,
                }}
              />
              <div className="flex items-center justify-between gap-4 text-sm text-gray-500">
                <span>{sliderConfig!.leftLabel ?? sliderConfig!.min}</span>
                <span className="text-right">{sliderConfig!.rightLabel ?? sliderConfig!.max}</span>
              </div>
            </div>
          );
        }

        return (
          <input
            type="number"
            placeholder={field.placeholder || ''}
            value={typeof value === 'number' ? value : ''}
            onChange={(e) =>
              handleFieldChange(
                field.fieldKey,
                e.target.value === '' ? '' : parseFloat(e.target.value)
              )
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
          />
        );
      case 'PHONE':
        return (
          <input
            type="tel"
            placeholder={field.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        );
      case 'SELECT':
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'RADIO':
        return (
          <div className={cn('grid gap-3', getChoiceColumns(field))}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-[72px] cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                  value === option.value
                    ? 'border-[#08514e] bg-[#08514e] text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-teal-300 hover:bg-gray-50'
                )}
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {option.description && (
                    <span className={cn('block text-xs', value === option.value ? 'text-white/80' : 'text-gray-500')}>
                      {option.description}
                    </span>
                  )}
                </div>
                <input
                  type="radio"
                  name={field.fieldKey}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleFieldChange(field.fieldKey, option.value)}
                  className="sr-only"
                />
                <span className={cn(
                  'ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                  value === option.value ? 'border-white bg-white text-[#08514e]' : 'border-gray-300'
                )}>
                  {value === option.value ? '✓' : ''}
                </span>
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className={cn('grid gap-3', getChoiceColumns(field))}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-[72px] cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                  Array.isArray(value) && value.includes(option.value)
                    ? 'border-[#08514e] bg-[#08514e] text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-teal-300 hover:bg-gray-50'
                )}
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {option.description && (
                    <span
                      className={cn(
                        'block text-xs',
                        Array.isArray(value) && value.includes(option.value) ? 'text-white/80' : 'text-gray-500'
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleFieldChange(field.fieldKey, [...currentValue, option.value]);
                    } else {
                        handleFieldChange(field.fieldKey, currentValue.filter((v) => v !== option.value));
                    }
                  }}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                    Array.isArray(value) && value.includes(option.value)
                      ? 'border-white bg-white text-[#08514e]'
                      : 'border-gray-300'
                  )}
                >
                  {Array.isArray(value) && value.includes(option.value) ? '✓' : ''}
                </span>
              </label>
            ))}
          </div>
        );
      case 'BOOLEAN':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ].map((option) => {
              const selected = value === option.value;
              return (
                <label
                  key={`${field.id}-${String(option.value)}`}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    selected
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                  }`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <input
                    type="radio"
                    name={field.fieldKey}
                    checked={selected}
                    onChange={() => handleFieldChange(field.fieldKey, option.value)}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                </label>
              );
            })}
          </div>
        );
      case 'MULTI_SELECT':
        return (
          <div className={cn('grid gap-3', getChoiceColumns(field))}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-[72px] cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                  Array.isArray(value) && value.includes(option.value)
                    ? 'border-[#08514e] bg-[#08514e] text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-teal-300 hover:bg-gray-50'
                )}
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {option.description && (
                    <span
                      className={cn(
                        'block text-xs',
                        Array.isArray(value) && value.includes(option.value) ? 'text-white/80' : 'text-gray-500'
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleFieldChange(field.fieldKey, [...currentValue, option.value]);
                    } else {
                        handleFieldChange(field.fieldKey, currentValue.filter((v) => v !== option.value));
                    }
                  }}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                    Array.isArray(value) && value.includes(option.value)
                      ? 'border-white bg-white text-[#08514e]'
                      : 'border-gray-300'
                  )}
                >
                  {Array.isArray(value) && value.includes(option.value) ? '✓' : ''}
                </span>
              </label>
            ))}
          </div>
        );
      case 'BLOOD_TEST': {
        const bloodTestValue =
          value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
        const hasRecentBloodTest =
          typeof bloodTestValue.hasRecentBloodTest === 'boolean'
            ? bloodTestValue.hasRecentBloodTest
            : undefined;
        const uploadedFileNames = Array.isArray(bloodTestValue.uploadedFileNames)
          ? bloodTestValue.uploadedFileNames.map((item) => String(item))
          : [];
        const wearableFileNames = Array.isArray(bloodTestValue.wearableFileNames)
          ? bloodTestValue.wearableFileNames.map((item) => String(item))
          : [];
        const bloodTestDate =
          typeof bloodTestValue.bloodTestDate === 'string' ? bloodTestValue.bloodTestDate : '';

        const handleBloodTestChange = (patch: Record<string, unknown>) => {
          handleFieldChange(field.fieldKey, {
            ...bloodTestValue,
            ...patch,
          });
        };

        return (
          <div className="space-y-4 rounded-xl border border-gray-200 bg-[#f8fffd] p-5">
            <div>
              <h4 className="text-base font-semibold text-gray-900">{field.label}</h4>
              <p className="mt-1 text-sm text-gray-500">
                {field.helperText || 'Collect blood test uploads, date, and order intent in one step.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map((option) => {
                const selected = hasRecentBloodTest === option.value;
                return (
                  <button
                    key={`${field.id}-${String(option.value)}`}
                    type="button"
                    onClick={() => handleBloodTestChange({ hasRecentBloodTest: option.value })}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {hasRecentBloodTest === true && (
              <div className="space-y-4">
                <div className="rounded-xl border border-dashed border-teal-200 bg-white px-4 py-5 text-sm text-gray-500">
                  Upload area preview
                  {uploadedFileNames.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Files: {uploadedFileNames.join(', ')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date of blood test</label>
                  <input
                    type="date"
                    value={bloodTestDate}
                    onChange={(event) =>
                      handleBloodTestChange({ bloodTestDate: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                  Wearable upload preview
                  {wearableFileNames.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Files: {wearableFileNames.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasRecentBloodTest === false && (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
                The live intake will show an order-blood-test CTA for this path.
              </div>
            )}
          </div>
        );
      }
      default:
        return <div className="text-sm text-gray-500">Unknown field type: {field.type}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/admin/intake/${flow.id}/edit`)}
              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Edit
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Preview Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">{flow.name}</h1>
            {flow.description && (
              <p className="text-sm text-gray-500 mt-2">{flow.description}</p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {visibleSections.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full flex-1 ${
                      index === safeCurrentSectionIndex
                        ? 'bg-teal-600'
                        : index < safeCurrentSectionIndex
                        ? 'bg-teal-300'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Step {Math.min(safeCurrentSectionIndex + 1, visibleSections.length)} of {visibleSections.length}
              </span>
            </div>
          </div>

          {currentSectionData && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{currentSectionData.title}</h2>
                {currentSectionData.description && (
                  <p className="text-sm text-gray-500 mt-1">{currentSectionData.description}</p>
                )}
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(16,24,40,0.25)] md:p-8">
                <div className="space-y-8">
                  {visibleFields.map((field) => {
                    const sliderConfig = getSliderConfig(field);
                    const sliderValue = parseNumericValue(prunedFormData[field.fieldKey]);

                    return (
                      <div key={field.id}>
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900">
                              {field.label}
                              {field.isRequired && <span className="ml-1 text-red-500">*</span>}
                            </label>
                            {field.helperText && (
                              <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>
                            )}
                          </div>
                          {sliderConfig?.showValue && (
                            <span className="text-3xl font-bold leading-none text-[#0f766e]">
                              {sliderValue ?? '—'}
                            </span>
                          )}
                        </div>
                        {renderField(field)}
                      </div>
                    );
                  })}
                  {visibleFields.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                      No questions are visible in this step for the current answers.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  {isFirstSection ? (
                    <>
                      <ArrowLeft size={16} />
                      Back to Edit
                    </>
                  ) : (
                    <>
                      <ChevronLeft size={16} />
                      Previous
                    </>
                  )}
                </button>
                {!isLastSection && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                )}
                {isLastSection && (
                  <button
                    onClick={() => router.push(`/admin/intake/${flow.id}/edit`)}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm"
                  >
                    Complete Preview
                  </button>
                )}
              </div>
            </div>
          )}

          {visibleSections.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No steps are currently visible for this flow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
