'use client';

import { useEffect, useRef } from 'react';
import { UserPlus, Mail } from 'lucide-react';

interface AddProviderMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onAddManual: () => void;
    onInviteProvider: () => void;
}

export function AddProviderMenu({ isOpen, onClose, onAddManual, onInviteProvider }: AddProviderMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-50 py-1"
        >
            {/* Add Manually Option */}
            <button
                onClick={() => {
                    onClose();
                    onAddManual();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-left">
                    <p className="font-medium text-slate-900 text-sm">Add Manually</p>
                    <p className="text-xs text-slate-500">Create a provider profile</p>
                </div>
            </button>

            {/* Invite Provider Option */}
            <button
                onClick={() => {
                    onClose();
                    onInviteProvider();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-left">
                    <p className="font-medium text-slate-900 text-sm">Invite Provider</p>
                    <p className="text-xs text-slate-500">Send an invitation</p>
                </div>
            </button>
        </div>
    );
}
