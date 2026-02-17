'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Plus, X, Check, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTreatments } from '@/hooks/use-treatments';
import type { CreateMatchingRulePayload } from '@/services/treatment-service';

interface RuleBuilderFormProps {
    initialData?: Partial<CreateMatchingRulePayload>;
    onSubmit: (data: CreateMatchingRulePayload) => Promise<void>;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function RuleBuilderForm({ initialData, onSubmit, isSubmitting, onCancel }: RuleBuilderFormProps) {
    const { data: treatments } = useTreatments(); // For linked treatments dropdown

    const [formData, setFormData] = useState<Partial<CreateMatchingRulePayload>>({
        name: 'New Rule', // Default name
        triggerSource: 'GUIDED_INTAKE',
        evaluationTiming: 'AFTER_INTAKE',
        providerCapabilities: [],
        locationConstraints: [],
        availabilityStatus: 'AVAILABLE_NOW',
        linkedTreatments: [],
        confidence: 'HIGH',
        explanation: '',
        exclusionReasons: [],
        isActive: true, // Default active
        priority: 0,
        ...initialData,
    });

    // Local state for list inputs
    const [exclusionInput, setExclusionInput] = useState('');

    const handleChange = (field: keyof CreateMatchingRulePayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Helper for multi-select arrays (like linked treatments)
    const toggleLinkedTreatment = (treatmentId: string) => {
        const current = formData.linkedTreatments || [];
        if (current.includes(treatmentId)) {
            handleChange('linkedTreatments', current.filter(id => id !== treatmentId));
        } else {
            handleChange('linkedTreatments', [...current, treatmentId]);
        }
    };

    const addExclusionReason = () => {
        if (!exclusionInput.trim()) return;
        const current = formData.exclusionReasons || [];
        handleChange('exclusionReasons', [...current, exclusionInput]);
        setExclusionInput('');
    };

    const removeExclusionReason = (index: number) => {
        const current = formData.exclusionReasons || [];
        handleChange('exclusionReasons', current.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Validation logic here
        onSubmit(formData as CreateMatchingRulePayload);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Section 1: Rule Basics */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-2">
                        Rule Basics
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-slate-600">Rule Name</Label>
                            <div className="col-span-2">
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g. Standard Eligibility"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-start gap-4">
                            <Label className="mt-2 text-slate-600">Trigger source</Label>
                            <div className="col-span-2 space-y-2">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="triggerSource"
                                            className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                            checked={formData.triggerSource === 'GUIDED_INTAKE'}
                                            onChange={() => handleChange('triggerSource', 'GUIDED_INTAKE')}
                                        />
                                        <span className="text-sm text-slate-700">Guided intake</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="triggerSource"
                                            className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                            checked={formData.triggerSource === 'BLOOD_TEST'}
                                            onChange={() => handleChange('triggerSource', 'BLOOD_TEST')}
                                        />
                                        <span className="text-sm text-slate-700">Blood test</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="triggerSource"
                                            className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                            checked={formData.triggerSource === 'BOTH'}
                                            onChange={() => handleChange('triggerSource', 'BOTH')}
                                        />
                                        <span className="text-sm text-slate-700">Both</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="triggerSource"
                                            className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                            checked={formData.triggerSource === 'WHERE_DONE'}
                                            onChange={() => handleChange('triggerSource', 'WHERE_DONE')}
                                        />
                                        <span className="text-sm text-slate-700">Where done</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-start gap-4">
                            <Label className="mt-2 text-slate-600">Evaluation timing</Label>
                            <div className="col-span-2 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="evaluationTiming"
                                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                        checked={formData.evaluationTiming === 'AFTER_INTAKE'}
                                        onChange={() => handleChange('evaluationTiming', 'AFTER_INTAKE')}
                                    />
                                    <span className="text-sm text-slate-700">After intake complete</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="evaluationTiming"
                                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                        checked={formData.evaluationTiming === 'AFTER_RESULTS'}
                                        onChange={() => handleChange('evaluationTiming', 'AFTER_RESULTS')}
                                    />
                                    <span className="text-sm text-slate-700">After results available</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Provider Eligibility Constraints */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-2">
                        Provider Eligibility Constraints
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Required provider capabilities:</Label>
                            <Select
                                value={formData.providerCapabilities?.[0] || ''}
                                onValueChange={(val) => handleChange('providerCapabilities', [val])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select capability..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Test Interpretation">Test Interpretation</SelectItem>
                                    <SelectItem value="Prescription">Prescription</SelectItem>
                                    <SelectItem value="Specialist Consult">Specialist Consult</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Location / delivery mode constraints:</Label>
                            <Select
                                value={formData.locationConstraints?.[0] || ''}
                                onValueChange={(val) => handleChange('locationConstraints', [val])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select region..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New York State - Telehealth">New York State - Telehealth</SelectItem>
                                    <SelectItem value="California - Telehealth">California - Telehealth</SelectItem>
                                    <SelectItem value="Nationwide - Telehealth">Nationwide - Telehealth</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Availability flags (accepting users)</Label>
                            <Select
                                value={formData.availabilityStatus || ''}
                                onValueChange={(val) => handleChange('availabilityStatus', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select availability..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE_NOW">Available Now</SelectItem>
                                    <SelectItem value="WAITLIST_ONLY">Waitlist Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Rule Outcome */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-2">
                        Rule Outcome
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Recommend linked treatment:</Label>
                            {/* Simple Multi-select Mock */}
                            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-slate-200 rounded-lg min-h-[42px]">
                                {formData.linkedTreatments?.map(id => {
                                    const t = treatments?.find(tr => tr.id === id);
                                    return (
                                        <span key={id} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-medium">
                                            {t?.name || 'Unknown Treatment'}
                                            <button onClick={() => toggleLinkedTreatment(id)} className="hover:text-teal-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                                <Select onValueChange={toggleLinkedTreatment}>
                                    <SelectTrigger className="border-0 p-0 h-6 w-full shadow-none focus:ring-0">
                                        <SelectValue placeholder={formData.linkedTreatments?.length ? "" : "Select treatments..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {treatments?.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Priority hint:</Label>
                            <Select
                                value={String(formData.priority || 0)}
                                onValueChange={(val) => handleChange('priority', Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Low</SelectItem>
                                    <SelectItem value="50">Medium</SelectItem>
                                    <SelectItem value="100">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Confidence tag:</Label>
                            <Select
                                value={formData.confidence || ''}
                                onValueChange={(val) => handleChange('confidence', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select confidence..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HIGH">High Confidence</SelectItem>
                                    <SelectItem value="MEDIUM">Medium Confidence</SelectItem>
                                    <SelectItem value="LOW">Low Confidence</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Section 4: Explainability Inputs */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-2">
                        Explainability Inputs
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Human-readable reasons:</Label>
                            <Textarea
                                rows={3}
                                placeholder="e.g. High cortisol level often indicates low stress levels"
                                value={formData.explanation || ''}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Exclusion reasons</Label>
                            <div className="space-y-2">
                                {formData.exclusionReasons?.map((reason, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm text-slate-700 border border-slate-100">
                                        <span>{reason}</span>
                                        <button onClick={() => removeExclusionReason(idx)} className="text-slate-400 hover:text-red-500">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add exclusion reason..."
                                        value={exclusionInput}
                                        onChange={(e) => setExclusionInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addExclusionReason()}
                                    />
                                    <button
                                        onClick={addExclusionReason}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-md"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Section 5: Validation & Preview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-heading font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-2">
                    Validation & Preview
                </h3>

                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        <span className="bg-emerald-100 text-emerald-700 rounded p-0.5"><Check className="w-3 h-3" /></span>
                        Treatment linked
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        <span className="bg-emerald-100 text-emerald-700 rounded p-0.5"><Check className="w-3 h-3" /></span>
                        Provider available
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        <span className="bg-emerald-100 text-emerald-700 rounded p-0.5"><Check className="w-3 h-3" /></span>
                        Conditions valid
                    </div>
                </div>

                <div className="space-y-2">
                    <Textarea
                        rows={3}
                        readOnly
                        className="bg-slate-50 text-slate-600"
                        value={`This rule will apply if:\n- Trigger: ${formData.triggerSource === 'GUIDED_INTAKE' ? 'Guided Intake' : 'Blood Test'}\n- Provider has capability: ${formData.providerCapabilities?.[0] || 'Any'}\n- Location matches: ${formData.locationConstraints?.[0] || 'Any'}`}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save
                </button>
            </div>
        </div>
    );
}
