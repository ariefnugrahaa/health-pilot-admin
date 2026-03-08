'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react';
import { useSupplement, useUpdateSupplement } from '@/hooks/use-supplements';
import {
  SUPPLEMENT_CATEGORIES,
  type SupplementCategory,
  type CreateSupplementPayload,
} from '@/services/supplement-service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// ==========================================
// Form Types
// ==========================================

interface FormData {
  name: string;
  slug: string;
  description: string;
  category: SupplementCategory | '';
  status: 'ACTIVE' | 'INACTIVE';
  // Commerce
  retailType: 'AFFILIATE_ONLY' | 'DIRECT' | 'BOTH';
  purchaseUrl: string;
  affiliateLink: string;
  commissionType: 'CPS' | 'CPA' | 'FLAT';
  commissionPercent: number;
  // Recommendation
  includeInMatching: boolean;
  forceRanking: 'BEST_MATCH' | 'RECOMMENDED' | 'STANDARD' | '';
  // Eligibility
  requiresBiomarkers: boolean;
  minAge: number | null;
  maxAge: number | null;
  genderRestriction: 'NONE' | 'MALE' | 'FEMALE';
  additionalNotes: string;
}

const initialFormData: FormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  status: 'ACTIVE',
  retailType: 'AFFILIATE_ONLY',
  purchaseUrl: '',
  affiliateLink: '',
  commissionType: 'CPS',
  commissionPercent: 15,
  includeInMatching: true,
  forceRanking: '',
  requiresBiomarkers: false,
  minAge: null,
  maxAge: null,
  genderRestriction: 'NONE',
  additionalNotes: '',
};

// ==========================================
// Dropdown Component
// ==========================================

function SimpleDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
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
                  onChange(opt.value);
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
// Main Component
// ==========================================

export default function EditSupplementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing supplement
  const { data: supplement, isLoading, error } = useSupplement(id);
  const updateMutation = useUpdateSupplement();

  // Populate form when data loads
  useEffect(() => {
    if (supplement) {
      const affiliateLinks = supplement.affiliateLinks as Record<string, string> | null;
      setFormData({
        name: supplement.name,
        slug: supplement.slug,
        description: supplement.description || '',
        category: supplement.category,
        status: supplement.isActive ? 'ACTIVE' : 'INACTIVE',
        retailType: 'AFFILIATE_ONLY',
        purchaseUrl: affiliateLinks?.purchase || '',
        affiliateLink: affiliateLinks?.primary || '',
        commissionType: 'CPS',
        commissionPercent: 15,
        includeInMatching: supplement.isActive,
        forceRanking: '',
        requiresBiomarkers: (supplement.targetBiomarkers?.length || 0) > 0,
        minAge: supplement.minAge,
        maxAge: supplement.maxAge,
        genderRestriction:
          supplement.allowedGenders?.length === 1
            ? (supplement.allowedGenders[0] as 'MALE' | 'FEMALE')
            : 'NONE',
        additionalNotes: supplement.safetyNotes || '',
      });
    }
  }, [supplement]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Supplement name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Build affiliate links object
    const affiliateLinks: Record<string, string> = {};
    if (formData.affiliateLink) {
      affiliateLinks.primary = formData.affiliateLink;
    }
    if (formData.purchaseUrl) {
      affiliateLinks.purchase = formData.purchaseUrl;
    }

    const payload: Partial<CreateSupplementPayload> = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      category: formData.category as SupplementCategory,
      isActive: formData.status === 'ACTIVE',
      affiliateLinks,
      minAge: formData.minAge,
      maxAge: formData.maxAge,
      allowedGenders:
        formData.genderRestriction === 'NONE'
          ? []
          : [formData.genderRestriction],
      safetyNotes: formData.additionalNotes || undefined,
    };

    try {
      await updateMutation.mutateAsync({ id, payload });
      router.push('/admin/supplements');
    } catch (error) {
      console.error('Failed to update supplement:', error);
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const retailTypeOptions = [
    { value: 'AFFILIATE_ONLY', label: 'Affiliate Only' },
    { value: 'DIRECT', label: 'Direct' },
    { value: 'BOTH', label: 'Both' },
  ];

  const commissionTypeOptions = [
    { value: 'CPS', label: 'Cost Per Sale' },
    { value: 'CPA', label: 'Cost Per Action' },
    { value: 'FLAT', label: 'Flat Fee' },
  ];

  const rankingOptions = [
    { value: 'BEST_MATCH', label: 'Best Match' },
    { value: 'RECOMMENDED', label: 'Recommended' },
    { value: 'STANDARD', label: 'Standard' },
  ];

  const genderOptions = [
    { value: 'NONE', label: 'None' },
    { value: 'MALE', label: 'Male Only' },
    { value: 'FEMALE', label: 'Female Only' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading supplement...</p>
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
            href="/admin/supplements"
            className="mt-3 text-teal-600 hover:underline text-sm inline-block"
          >
            Back to Supplements
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
          onClick={() => router.push('/admin/supplements')}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Supplements
        </button>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Edit Supplement
        </h1>
        <p className="text-slate-500 mt-1 text-base">
          Update supplement information and settings.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
            Basic Information
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Supplement Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Supplement Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Gentle Iron Plus Vitamin C"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="gentle-iron-plus-vitamin-c"
                  className={errors.slug ? 'border-red-300' : ''}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <SimpleDropdown
                  value={formData.category}
                  onChange={(v) => updateField('category', v as SupplementCategory)}
                  options={SUPPLEMENT_CATEGORIES}
                  placeholder="Select category"
                />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
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

              {/* Description */}
              <div className="row-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter a brief description..."
                  rows={3}
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Commerce & Recommendation Settings */}
        <div className="grid grid-cols-2 gap-8">
          {/* Commerce Settings */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
              Commerce Settings
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Retail Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Retail Type
                  </label>
                  <SimpleDropdown
                    value={formData.retailType}
                    onChange={(v) => updateField('retailType', v)}
                    options={retailTypeOptions}
                  />
                </div>

                {/* Commission Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Commission Type
                  </label>
                  <SimpleDropdown
                    value={formData.commissionType}
                    onChange={(v) => updateField('commissionType', v)}
                    options={commissionTypeOptions}
                  />
                </div>

                {/* Commission % */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Commission %
                  </label>
                  <Input
                    type="number"
                    value={formData.commissionPercent}
                    onChange={(e) =>
                      updateField('commissionPercent', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Purchase URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Purchase URL
                  </label>
                  <Input
                    value={formData.purchaseUrl}
                    onChange={(e) => updateField('purchaseUrl', e.target.value)}
                    placeholder="https://retailer.com/product-link"
                  />
                </div>

                {/* Affiliate Link */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Affiliate Link
                  </label>
                  <Input
                    value={formData.affiliateLink}
                    onChange={(e) => updateField('affiliateLink', e.target.value)}
                    placeholder="https://partner.com/ref/healthpilot"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Recommendation Settings */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
              Recommendation Settings
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              {/* Include in Matching */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Include in Matching
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg bg-white cursor-pointer"
                  onClick={() => updateField('includeInMatching', !formData.includeInMatching)}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formData.includeInMatching
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300'
                    }`}
                  >
                    {formData.includeInMatching && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-slate-700">Included</span>
                </div>
              </div>

              {/* Force Ranking */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Force Ranking Override
                </label>
                <SimpleDropdown
                  value={formData.forceRanking}
                  onChange={(v) => updateField('forceRanking', v)}
                  options={rankingOptions}
                  placeholder="Select ranking"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Eligibility Overview */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
            Eligibility Overview
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              {/* Requires Biomarkers */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Requires Biomarkers?
                </label>
                <div className="flex items-center gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requiresBiomarkers"
                      checked={formData.requiresBiomarkers === true}
                      onChange={() => updateField('requiresBiomarkers', true)}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className="text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requiresBiomarkers"
                      checked={formData.requiresBiomarkers === false}
                      onChange={() => updateField('requiresBiomarkers', false)}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className="text-sm text-slate-700">No</span>
                  </label>
                </div>
              </div>

              {/* Age Restrictions */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age Restrictions
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={formData.minAge ?? ''}
                    onChange={(e) =>
                      updateField('minAge', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Min"
                    className="w-24"
                  />
                  <span className="text-slate-400">to</span>
                  <Input
                    type="number"
                    value={formData.maxAge ?? ''}
                    onChange={(e) =>
                      updateField('maxAge', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Max"
                    className="w-24"
                  />
                  <span className="text-slate-400">years</span>
                </div>
              </div>

              {/* Gender Restrictions */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender Restrictions
                </label>
                <SimpleDropdown
                  value={formData.genderRestriction}
                  onChange={(v) => updateField('genderRestriction', v)}
                  options={genderOptions}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Additional Notes
              </label>
              <Textarea
                value={formData.additionalNotes}
                onChange={(e) => updateField('additionalNotes', e.target.value)}
                placeholder="Enter any additional eligibility criteria, special requirements, or notes..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/supplements"
            className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
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
              'Save Supplement'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
