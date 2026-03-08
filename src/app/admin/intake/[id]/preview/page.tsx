'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useIntakeFlow } from '@/hooks/use-intake-flows';
import type { IntakeFlowField } from '@/types/intake';

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
        return (
          <input
            type="number"
            placeholder={field.placeholder || ''}
            value={value as number || ''}
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
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.fieldKey}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleFieldChange(field.fieldKey, option.value)}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
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
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
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
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
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
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </label>
            ))}
          </div>
        );
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

              <div className="space-y-6">
                {visibleFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {field.helperText && (
                      <p className="text-xs text-gray-500 mt-1">{field.helperText}</p>
                    )}
                  </div>
                ))}
                {visibleFields.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                    No questions are visible in this step for the current answers.
                  </div>
                )}
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
