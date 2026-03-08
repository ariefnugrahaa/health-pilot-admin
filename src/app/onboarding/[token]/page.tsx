'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    validateInviteToken,
    submitOnboardingForm,
    type ValidateInviteResponse,
} from '@/services/provider-service';
import {
    Loader2,
    ArrowRight,
    ArrowLeft,
    Check,
    Users,
    Sparkles,
    Shield,
    CheckCircle2,
    X,
    HeartPulse,
} from 'lucide-react';

// ==========================================
// Types
// ==========================================

interface FormData {
    // Step 1: Provider Identity
    providerName: string;
    businessName: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    countryCoverage: string;
    providerType: string;
    prescriptionCapable: boolean;

    // Step 2: Solution Details
    requiresBloodTest: boolean | null;
    injectionInvolved: boolean | null;
    linkedSolutions: string[];

    // Step 3: Tracking & Commission
    affiliateLink: string;
    commissionType: string;
    commissionRate: string;
}

interface ValidationErrors {
    providerName?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    requiresBloodTest?: string;
    injectionInvolved?: string;
    linkedSolutions?: string;
    affiliateLink?: string;
}

const initialFormData: FormData = {
    providerName: '',
    businessName: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    countryCoverage: '',
    providerType: '',
    prescriptionCapable: false,
    requiresBloodTest: null,
    injectionInvolved: null,
    linkedSolutions: [],
    affiliateLink: '',
    commissionType: '',
    commissionRate: '',
};

const LINKED_SOLUTIONS = [
    'Testosterone Therapy',
    'Weight Management',
    'Hormone Replacement Therapy',
    'Vitamin D Supplementation',
    'Thyroid Support',
    'Metabolic Health Programmes',
];

const PROVIDER_TYPES = [
    'Clinic',
    'Hospital',
    'Telehealth',
    'Laboratory',
    'Pharmacy',
    'Wellness Center',
    'Other',
];

const COUNTRIES = [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'European Union',
    'Global',
];

const COMMISSION_TYPES = [
    'Cost Per Sale',
    'Revenue Share',
    'Fixed Fee',
    'Hybrid',
];

const COMMISSION_RATES = ['5%', '10%', '15%', '20%', '25%', 'Custom'];

// ==========================================
// Main Component
// ==========================================

export default function ProviderOnboardingPage() {
    const params = useParams();
    const token = params.token as string;

    const [currentStep, setCurrentStep] = useState(0); // 0 = landing, 1-3 = form steps, 4 = success
    const [inviteInfo, setInviteInfo] = useState<ValidateInviteResponse | null>(null);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    // Validate invite token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const result = await validateInviteToken(token);
                setInviteInfo(result);
                if (result.email) {
                    setFormData((prev) => ({ ...prev, contactEmail: result.email || '' }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Invalid or expired invite link');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            validateToken();
        }
    }, [token]);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const toggleLinkedSolution = (solution: string) => {
        setFormData((prev) => ({
            ...prev,
            linkedSolutions: prev.linkedSolutions.includes(solution)
                ? prev.linkedSolutions.filter((s) => s !== solution)
                : [...prev.linkedSolutions, solution],
        }));
        // Clear error when selecting a solution
        if (validationErrors.linkedSolutions) {
            setValidationErrors((prev) => ({ ...prev, linkedSolutions: undefined }));
        }
    };

    // Validation helpers
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidUrl = (url: string): boolean => {
        if (!url) return true; // Empty is valid (optional fields)
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const isValidPhone = (phone: string): boolean => {
        // Allow digits, spaces, dashes, parentheses, and plus sign
        const phoneRegex = /^[\d\s\-\(\)\+]{7,}$/;
        return phoneRegex.test(phone.trim());
    };

    // Validate Step 1: Provider Identity
    const validateStep1 = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.providerName.trim()) {
            errors.providerName = 'Provider name is required';
        }

        if (!formData.contactEmail.trim()) {
            errors.contactEmail = 'Contact email is required';
        } else if (!isValidEmail(formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address';
        }

        if (!formData.contactPhone.trim()) {
            errors.contactPhone = 'Contact phone is required';
        } else if (!isValidPhone(formData.contactPhone)) {
            errors.contactPhone = 'Please enter a valid phone number';
        }

        if (formData.website && !isValidUrl(formData.website)) {
            errors.website = 'Please enter a valid URL (e.g., https://example.com)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate Step 2: Solution Details
    const validateStep2 = (): boolean => {
        const errors: ValidationErrors = {};

        if (formData.requiresBloodTest === null) {
            errors.requiresBloodTest = 'Please select whether blood tests are required';
        }

        if (formData.injectionInvolved === null) {
            errors.injectionInvolved = 'Please select whether injections are involved';
        }

        if (formData.linkedSolutions.length === 0) {
            errors.linkedSolutions = 'Please select at least one solution';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate Step 3: Tracking & Commission
    const validateStep3 = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.affiliateLink.trim()) {
            errors.affiliateLink = 'Affiliate link is required';
        } else if (!isValidUrl(formData.affiliateLink)) {
            errors.affiliateLink = 'Please enter a valid URL (e.g., https://partner.com/ref/healthpilot)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        // Clear previous errors
        setValidationErrors({});

        // Validate current step before proceeding
        let isValid = true;
        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        } else if (currentStep === 3) {
            isValid = validateStep3();
        }

        if (isValid && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setValidationErrors({}); // Clear validation errors when going back
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        // Validate step 3 before submitting
        if (!validateStep3()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Transform form data to match API expected format
            const payload = {
                name: formData.providerName,
                businessName: formData.businessName,
                websiteUrl: formData.website,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                supportedRegions: formData.countryCoverage ? [formData.countryCoverage] : [],
                providerType: formData.providerType,
                acceptsBloodTests: formData.requiresBloodTest ?? false,
                description: '',
                registrationNumber: '',
                affiliateLink: formData.affiliateLink,
                commissionRate: formData.commissionRate ? parseInt(formData.commissionRate) : undefined,
            };

            await submitOnboardingForm(token, payload);
            setCurrentStep(4); // Success page
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit form');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // Loading State
    // ==========================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600">Validating invite...</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // Error State
    // ==========================================

    if (error && !inviteInfo) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">!</span>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid Invite</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <p className="text-sm text-slate-500">
                        Please contact the administrator for a new invite link.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // Render Step Content
    // ==========================================

    const renderStepContent = () => {
        // Landing Page
        if (currentStep === 0) {
            return (
                <div className="text-center w-full">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full border-[2.5px] border-[#1eada4] flex items-center justify-center -mr-1 z-10 bg-white">
                                <HeartPulse className="w-4 h-4 text-[#1eada4]" />
                            </div>
                            <span className="font-bold text-slate-900 text-[20px] tracking-wide uppercase">Health Pilot</span>
                        </div>
                        <span className="text-[11px] text-slate-500 uppercase tracking-widest pl-6">Guidance you can act on.</span>
                    </div>

                    {/* Main Content */}
                    <div className="mb-10">
                        <h1 className="text-[28px] font-bold text-slate-900 mb-3">
                            Partner with HealthPilot
                        </h1>
                        <p className="text-[16px] text-slate-500 max-w-[480px] mx-auto leading-relaxed">
                            Submit your clinic or solution to be included in personalised recommendations.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <Users className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">Reach qualified users</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <Sparkles className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">AI-powered matching</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <CheckCircle2 className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">Secure data handling</span>
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleNext}
                        className="w-full py-3.5 px-4 bg-[#1eada4] hover:bg-[#168881] text-white font-medium rounded-md transition-colors text-[15px]"
                    >
                        Start Submission
                    </button>
                </div>
            );
        }

        // Step 1: Provider Identity
        if (currentStep === 1) {
            return (
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Provider Identity</h2>

                    <div className="space-y-5">
                        {/* Provider Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Provider Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.providerName}
                                onChange={(e) => {
                                    updateFormData({ providerName: e.target.value });
                                    if (validationErrors.providerName) {
                                        setValidationErrors((prev) => ({ ...prev, providerName: undefined }));
                                    }
                                }}
                                placeholder="Enter provider name"
                                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${validationErrors.providerName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
                                    }`}
                            />
                            {validationErrors.providerName && (
                                <p className="text-sm text-red-500">{validationErrors.providerName}</p>
                            )}
                        </div>

                        {/* Business Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => updateFormData({ businessName: e.target.value })}
                                placeholder="Trading or registered name"
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Website
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => {
                                    updateFormData({ website: e.target.value });
                                    if (validationErrors.website) {
                                        setValidationErrors((prev) => ({ ...prev, website: undefined }));
                                    }
                                }}
                                placeholder="https://example.com"
                                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${validationErrors.website ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
                                    }`}
                            />
                            {validationErrors.website && (
                                <p className="text-sm text-red-500">{validationErrors.website}</p>
                            )}
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Contact Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => {
                                    updateFormData({ contactEmail: e.target.value });
                                    if (validationErrors.contactEmail) {
                                        setValidationErrors((prev) => ({ ...prev, contactEmail: undefined }));
                                    }
                                }}
                                placeholder="Enter contact email"
                                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${validationErrors.contactEmail ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
                                    }`}
                            />
                            {validationErrors.contactEmail && (
                                <p className="text-sm text-red-500">{validationErrors.contactEmail}</p>
                            )}
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Contact Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => {
                                    updateFormData({ contactPhone: e.target.value });
                                    if (validationErrors.contactPhone) {
                                        setValidationErrors((prev) => ({ ...prev, contactPhone: undefined }));
                                    }
                                }}
                                placeholder="Enter contact phone"
                                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${validationErrors.contactPhone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
                                    }`}
                            />
                            {validationErrors.contactPhone && (
                                <p className="text-sm text-red-500">{validationErrors.contactPhone}</p>
                            )}
                        </div>

                        {/* Country / Coverage */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Country / Coverage
                            </label>
                            <select
                                value={formData.countryCoverage}
                                onChange={(e) => updateFormData({ countryCoverage: e.target.value })}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white"
                            >
                                <option value="">Select country / coverage</option>
                                {COUNTRIES.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Provider Type */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Provider Type
                            </label>
                            <select
                                value={formData.providerType}
                                onChange={(e) => updateFormData({ providerType: e.target.value })}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white"
                            >
                                <option value="">Select provider type</option>
                                {PROVIDER_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Prescription Capable */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">
                                    Prescription Capable
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateFormData({ prescriptionCapable: !formData.prescriptionCapable })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.prescriptionCapable ? 'bg-teal-600' : 'bg-slate-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.prescriptionCapable ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500">Can prescribe medications</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Step 2: Solution Details
        if (currentStep === 2) {
            return (
                <div>
                    <h2 className="text-[28px] font-bold text-slate-900 mb-2">Solution Details</h2>
                    <p className="text-lg text-slate-500 mb-8">
                        Describe the solutions you offer to patients
                    </p>

                    <div className="space-y-6">
                        {/* Requires Blood Test */}
                        <div className="space-y-3">
                            <label className="block text-[15px] font-bold text-slate-900">
                                Requires Blood Test <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateFormData({ requiresBloodTest: true });
                                        if (validationErrors.requiresBloodTest) {
                                            setValidationErrors((prev) => ({ ...prev, requiresBloodTest: undefined }));
                                        }
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-md text-[15px] transition-colors border ${formData.requiresBloodTest === true
                                        ? 'bg-[#0f6466] border-[#0f6466] text-white'
                                        : 'bg-white border-[#0f6466] text-[#0f6466] hover:bg-slate-50'
                                        }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateFormData({ requiresBloodTest: false });
                                        if (validationErrors.requiresBloodTest) {
                                            setValidationErrors((prev) => ({ ...prev, requiresBloodTest: undefined }));
                                        }
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-md text-[15px] transition-colors border ${formData.requiresBloodTest === false
                                        ? 'bg-[#0f6466] border-[#0f6466] text-white'
                                        : 'bg-white border-[#0f6466] text-[#0f6466] hover:bg-slate-50'
                                        }`}
                                >
                                    No
                                </button>
                            </div>
                            {validationErrors.requiresBloodTest && (
                                <p className="text-sm text-red-500">{validationErrors.requiresBloodTest}</p>
                            )}
                        </div>

                        {/* Injection Involved */}
                        <div className="space-y-3">
                            <label className="block text-[15px] font-bold text-slate-900">
                                Injection Involved <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateFormData({ injectionInvolved: true });
                                        if (validationErrors.injectionInvolved) {
                                            setValidationErrors((prev) => ({ ...prev, injectionInvolved: undefined }));
                                        }
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-md text-[15px] transition-colors border ${formData.injectionInvolved === true
                                        ? 'bg-[#0f6466] border-[#0f6466] text-white'
                                        : 'bg-white border-[#0f6466] text-[#0f6466] hover:bg-slate-50'
                                        }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateFormData({ injectionInvolved: false });
                                        if (validationErrors.injectionInvolved) {
                                            setValidationErrors((prev) => ({ ...prev, injectionInvolved: undefined }));
                                        }
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-md text-[15px] transition-colors border ${formData.injectionInvolved === false
                                        ? 'bg-[#0f6466] border-[#0f6466] text-white'
                                        : 'bg-white border-[#0f6466] text-[#0f6466] hover:bg-slate-50'
                                        }`}
                                >
                                    No
                                </button>
                            </div>
                            {validationErrors.injectionInvolved && (
                                <p className="text-sm text-red-500">{validationErrors.injectionInvolved}</p>
                            )}
                        </div>

                        {/* Linked Solutions */}
                        <div className="space-y-3">
                            <label className="block text-[15px] font-bold text-slate-900">
                                Linked Solutions <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-col gap-3">
                                {LINKED_SOLUTIONS.map((solution) => (
                                    <button
                                        type="button"
                                        key={solution}
                                        onClick={() => toggleLinkedSolution(solution)}
                                        className={`flex items-center gap-4 p-4 rounded-md border text-left transition-colors ${formData.linkedSolutions.includes(solution)
                                            ? 'bg-[#0f6466] border-[#0f6466] text-white'
                                            : 'bg-white border-slate-400 hover:border-slate-500 text-[#0f6466]'
                                            }`}
                                    >
                                        <div
                                            className={`w-[18px] h-[18px] rounded-sm flex items-center justify-center flex-shrink-0 ${formData.linkedSolutions.includes(solution)
                                                ? 'bg-white'
                                                : 'border-2 border-[#0f6466] bg-white'
                                                }`}
                                        >
                                            {formData.linkedSolutions.includes(solution) && (
                                                <Check className="w-3.5 h-3.5 text-[#0f6466] stroke-[3]" />
                                            )}
                                        </div>
                                        <span className="text-[15px]">{solution}</span>
                                    </button>
                                ))}
                            </div>
                            {validationErrors.linkedSolutions && (
                                <p className="text-sm text-red-500">{validationErrors.linkedSolutions}</p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Step 3: Tracking & Commission
        if (currentStep === 3) {
            return (
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Tracking & Commission</h2>

                    <div className="space-y-5">
                        {/* Affiliate Link */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Affiliate Link <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={formData.affiliateLink}
                                onChange={(e) => {
                                    updateFormData({ affiliateLink: e.target.value });
                                    if (validationErrors.affiliateLink) {
                                        setValidationErrors((prev) => ({ ...prev, affiliateLink: undefined }));
                                    }
                                }}
                                placeholder="https://partner.com/ref/healthpilot"
                                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${validationErrors.affiliateLink ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
                                    }`}
                            />
                            {validationErrors.affiliateLink && (
                                <p className="text-sm text-red-500">{validationErrors.affiliateLink}</p>
                            )}
                        </div>

                        {/* Commission Type */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Commission Type
                            </label>
                            <select
                                value={formData.commissionType}
                                onChange={(e) => updateFormData({ commissionType: e.target.value })}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white"
                            >
                                <option value="">Select commission type</option>
                                {COMMISSION_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Commission Rate */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Commission Rate
                            </label>
                            <select
                                value={formData.commissionRate}
                                onChange={(e) => updateFormData({ commissionRate: e.target.value })}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white"
                            >
                                <option value="">Select commission rate</option>
                                {COMMISSION_RATES.map((rate) => (
                                    <option key={rate} value={rate}>{rate}</option>
                                ))}
                            </select>
                        </div>

                        {/* Note */}
                        <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg">
                            <div className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-teal-700 text-xs font-medium">i</span>
                            </div>
                            <p className="text-sm text-teal-800">
                                Your submission will be reviewed by our team. We may contact you for additional information or clarification before approval.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Success Page
        if (currentStep === 4) {
            return (
                <div className="text-center w-full">
                    {/* Checkmark Icon */}
                    <div className="w-[72px] h-[72px] bg-[#d6f5e9] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-[#0f6466]" />
                    </div>

                    {/* Title */}
                    <h1 className="text-[28px] font-bold text-slate-900 mb-3">
                        Submission Received
                    </h1>
                    <p className="text-[15px] text-slate-500 mb-6 max-w-[600px] mx-auto leading-relaxed">
                        Thank you for submitting your provider details to HealthPilot. Our team will review your submission and contact you at the email address provided.
                    </p>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 border border-amber-300 text-amber-500 rounded text-[13px] font-medium mb-10">
                        Pending Approval
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <Users className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">Reach qualified users</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <Sparkles className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">AI-powered matching</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#e6f8f3] flex items-center justify-center border border-[#d6f5e9]">
                                <CheckCircle2 className="w-4 h-4 text-[#0f6466]" />
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium">Secure data handling</span>
                        </div>
                    </div>

                    {/* What happens next */}
                    <div className="text-left bg-[#ebf7f5] rounded-xl p-6 sm:p-8 mb-10 w-full mx-auto">
                        <h3 className="font-bold text-[15px] text-slate-900 mb-4">What happens next?</h3>
                        <ul className="space-y-3 text-[14px] text-slate-600">
                            <li className="flex items-start gap-2.5">
                                <div className="min-w-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                                Our team will review your submission within 3–5 business days
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="min-w-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                                We may contact you for additional information or clarification
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="min-w-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                                Once approved, your solutions will be included in our matching algorithm
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="min-w-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                                You&apos;ll receive access to your partner dashboard to track referrals
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                setCurrentStep(0);
                                setFormData(initialFormData);
                            }}
                            className="w-full sm:flex-1 py-3 px-4 border border-[#1eada4] text-[#1eada4] font-medium rounded-md hover:bg-[#ebf7f5] transition-colors text-[15px]"
                        >
                            Submit Another Provider
                        </button>
                        <a
                            href="https://healthpilot.com"
                            className="w-full sm:flex-1 py-3 px-4 bg-[#1eada4] border border-[#1eada4] text-white font-medium rounded-md hover:bg-[#168881] hover:border-[#168881] transition-colors text-[15px] text-center"
                        >
                            Return to HealthPilot
                        </a>
                    </div>
                </div>
            );
        }

        return null;
    };

    // ==========================================
    // Main Render
    // ==========================================

    const showProgress = currentStep >= 1 && currentStep <= 3;

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col">
            {/* Header */}
            {currentStep !== 0 && (
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full border-[2.5px] border-teal-500 flex items-center justify-center -mr-1 z-10 bg-white">
                                <HeartPulse className="w-4 h-4 text-teal-500" />
                            </div>
                            <span className="font-bold text-slate-900 text-lg tracking-wide uppercase">Health Pilot</span>
                        </div>
                        <span className="text-[11px] text-slate-500 uppercase tracking-widest pl-6">Guidance you can act on.</span>
                    </div>
                </header>
            )}

            {/* Progress Bar & Header Text */}
            {showProgress && (
                <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[22px] font-bold text-slate-900">
                            Step {currentStep} of 3
                        </span>
                        <button
                            onClick={() => setCurrentStep(0)}
                            className="text-slate-800 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="h-3 w-full bg-[#e5e5e5] flex">
                        <div
                            className="h-full bg-[#1eada4] transition-all duration-300"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 flex flex-col items-center px-4 pb-24 ${currentStep === 0 ? 'justify-center pt-8' : 'justify-start pt-2'}`}>
                <div className={`w-full ${(currentStep === 4 || currentStep === 0) ? 'max-w-[760px] bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:px-16 sm:py-14' : (showProgress ? 'max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-8' : 'max-w-2xl')}`}>
                    {renderStepContent()}
                </div>
            </main>

            {/* Sticky Navigation Footer */}
            {currentStep >= 1 && currentStep <= 3 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-6 md:px-12 flex items-center justify-center z-50">
                    <div className="w-full max-w-4xl flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium text-[#1eada4] hover:text-[#0f6466] transition-colors"
                        >
                            Back
                        </button>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1eada4] hover:bg-[#168881] text-white text-[15px] font-medium rounded-md transition-colors"
                            >
                                Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1eada4] hover:bg-[#168881] disabled:bg-teal-300 text-white text-[15px] font-medium rounded-md transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit for Review <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
