'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useGenerateInviteLink } from '@/hooks/use-providers';
import { InviteLinkModal } from '@/components/providers/InviteLinkModal';

export default function InviteProviderPage() {
    const router = useRouter();
    const generateInvite = useGenerateInviteLink();

    const [email, setEmail] = useState('');
    const [includeEmail, setIncludeEmail] = useState(true);
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [linkType, setLinkType] = useState<'one-time' | 'reusable'>('one-time');
    const [notes, setNotes] = useState('');

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [generatedInvite, setGeneratedInvite] = useState<{ url: string; email: string } | null>(null);

    const handleGenerateLink = async () => {
        try {
            const result = await generateInvite.mutateAsync({
                email: includeEmail && email ? email : undefined,
                expiresInDays,
                isReusable: linkType === 'reusable',
                notes: notes || undefined,
            });

            setGeneratedInvite({
                url: result.inviteUrl,
                email: includeEmail && email ? email : 'No email specified',
            });
            setShowLinkModal(true);
        } catch {
            // Error handled by mutation
        }
    };

    const handleCancel = () => {
        router.push('/admin/providers');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/providers"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Providers
                    </Link>
                    <h1 className="text-2xl font-heading font-bold text-slate-900">
                        Invite a Provider
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Generate a secure link for a provider to submit their details and solutions.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Basic Information</h2>

                    <div className="space-y-5">
                        {/* Provider Email */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Provider Email
                                </label>
                                <span className="text-xs text-slate-400">(optional)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="includeEmail"
                                    checked={includeEmail}
                                    onChange={(e) => setIncludeEmail(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!includeEmail}
                                    placeholder="provider@example.com"
                                    className="flex-1 h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                If provided, this link will be associated with this email.
                            </p>
                        </div>

                        {/* Link Expiry */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Link Expiry
                            </label>
                            <select
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                                className="w-full sm:w-48 h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white"
                            >
                                <option value={1}>1 day</option>
                                <option value={3}>3 days</option>
                                <option value={7}>7 days</option>
                                <option value={14}>14 days</option>
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Detail Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5">Detail Information</h2>

                    <div className="space-y-5">
                        {/* Link Type */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">
                                Link Type
                            </label>

                            <div className="space-y-3">
                                {/* One-time use */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${linkType === 'one-time'
                                            ? 'border-teal-600 bg-teal-600'
                                            : 'border-slate-300 bg-white'
                                            }`}
                                        onClick={() => setLinkType('one-time')}
                                    >
                                        {linkType === 'one-time' && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">One-time use link</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Link expires after first submission
                                        </p>
                                    </div>
                                </label>

                                {/* Reusable */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${linkType === 'reusable'
                                            ? 'border-teal-600 bg-teal-600'
                                            : 'border-slate-300 bg-white'
                                            }`}
                                        onClick={() => setLinkType('reusable')}
                                    >
                                        {linkType === 'reusable' && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">Reusable link</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Can be used multiple times until expiry
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Notes
                                </label>
                                <span className="text-xs text-slate-400">(optional)</span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any internal notes about this invitation..."
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {generateInvite.isError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                            {generateInvite.error?.message || 'Failed to generate invite link'}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerateLink}
                        disabled={generateInvite.isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {generateInvite.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Invite Link'
                        )}
                    </button>
                </div>
            </div>

            {/* Link Modal */}
            {generatedInvite && (
                <InviteLinkModal
                    isOpen={showLinkModal}
                    onClose={() => {
                        setShowLinkModal(false);
                        router.push('/admin/providers');
                    }}
                    inviteUrl={generatedInvite.url}
                    email={generatedInvite.email}
                />
            )}
        </div>
    );
}
