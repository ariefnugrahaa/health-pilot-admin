'use client';

import { useState } from 'react';
import { X, Copy, CheckCircle2, Info } from 'lucide-react';

interface InviteLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    inviteUrl: string;
    email: string;
}

export function InviteLinkModal({ isOpen, onClose, inviteUrl, email }: InviteLinkModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClose = () => {
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Invite a Provider
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Generate a secure link for a provider to submit their details and solutions.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                    {/* Success Message */}
                    <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-teal-800">
                                Invite link created successfully
                            </p>
                            <p className="text-sm text-teal-700 mt-0.5">
                                Share this link with the provider to begin their onboarding process.
                            </p>
                        </div>
                    </div>

                    {/* Link Display */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Generated Invite Link
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-3 bg-slate-100 rounded-lg overflow-hidden">
                                <p className="text-sm text-slate-600 font-mono truncate">
                                    {inviteUrl}
                                </p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm border transition-all ${
                                    copied
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white text-teal-600 border-teal-300 hover:bg-teal-50'
                                }`}
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Note</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Provider submissions will require admin approval before being published.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleClose}
                            className="w-full px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
