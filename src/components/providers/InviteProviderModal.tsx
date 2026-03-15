'use client';

import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { useGenerateInviteLink } from '@/hooks/use-providers';

interface InviteProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLinkGenerated: (inviteUrl: string, email: string) => void;
}

export function InviteProviderModal({ isOpen, onClose, onLinkGenerated }: InviteProviderModalProps) {
    const [email, setEmail] = useState('');
    const [expiresInDays, setExpiresInDays] = useState(7);

    const generateInvite = useGenerateInviteLink();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        try {
            const result = await generateInvite.mutateAsync({
                email: email.trim(),
                expiresInDays,
            });

            onLinkGenerated(result.inviteUrl, email.trim());
            setEmail('');
            onClose();
        } catch {
            // Error is handled by the mutation
        }
    };

    const handleClose = () => {
        setEmail('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-teal-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Invite Provider</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-slate-600">
                        Generate an invite link to send to a provider. They&apos;ll be able to fill out their information and submit it for review.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Provider Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="provider@example.com"
                                required
                                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Expiration Select */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Link Expires In
                        </label>
                        <select
                            value={expiresInDays}
                            onChange={(e) => setExpiresInDays(Number(e.target.value))}
                            className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                        >
                            <option value={1}>1 day</option>
                            <option value={3}>3 days</option>
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                        </select>
                    </div>

                    {/* Error Message */}
                    {generateInvite.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">
                                {generateInvite.error?.message || 'Failed to generate invite link'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!email.trim() || generateInvite.isPending}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {generateInvite.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Link'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
