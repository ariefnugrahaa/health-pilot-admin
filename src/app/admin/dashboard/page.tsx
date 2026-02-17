'use client';

import {
    Users,
    UserCheck,
    AlertTriangle,
    ChevronRight,
    MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

// ==========================================
// Mock Data
// ==========================================

const STATS = [
    {
        label: 'Total Providers',
        value: '1,250',
        icon: Users,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
    },
    {
        label: 'Active Providers',
        value: '980',
        icon: UserCheck,
        iconColor: 'text-teal-600',
        iconBg: 'bg-teal-50',
    },
    {
        label: 'Providers with Issues',
        value: '35',
        icon: AlertTriangle,
        iconColor: 'text-amber-600', // Yellow/Orange
        iconBg: 'bg-amber-50',
    },
];

const PROVIDERS = [
    { name: 'Dr. Emily Roberts', status: 'ACTIVE', location: 'New York, NY' },
    { name: 'MediCare Clinic', status: 'INCOMPLETE', location: 'Los Angeles, CA' },
    { name: 'Dr. John Smith', status: 'ACTIVE', location: 'Chicago, IL' },
    { name: 'Hope Medical Center', status: 'INACTIVE', location: 'Houston, TX' },
    { name: 'Dr. Sarah Lee', status: 'ACTIVE', location: 'Phoenix, AZ' },
];

const TREATMENTS = [
    { name: 'Cardiovascular Health Program', providers: 120 },
    { name: 'Diabetes Management Pathway', providers: 84 },
    { name: 'Mental Wellness Support', providers: 31 },
];

// ==========================================
// Components
// ==========================================

function StatusPill({ status }: { status: string }) {
    if (status === 'ACTIVE') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
            </span>
        );
    }
    if (status === 'INCOMPLETE') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white border border-gray-800">
                INCOMPLETE
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-500 border border-slate-200">
            INACTIVE
        </span>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-slate-900">
                    Welcome back, {user?.firstName || 'Admin'}
                </h1>
                <p className="text-slate-500 mt-2 text-base">
                    Manage providers and treatment pathways from your dashboard.
                </p>
            </div>

            {/* Overview Section */}
            <div>
                <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl border border-slate-200 p-6 flex items-start justify-between shadow-sm"
                        >
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-3xl font-heading font-bold text-slate-900 mt-2">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Providers Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-heading font-bold text-slate-900">Providers</h2>
                        <p className="text-sm text-slate-500">Recent Providers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                            Manage Providers
                        </button>
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                            View all providers
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">
                                        Provider Name
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">
                                        Location/Coverage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {PROVIDERS.map((provider) => (
                                    <tr key={provider.name} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {provider.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusPill status={provider.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-right">
                                            {provider.location}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Treatment Pathways Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-heading font-bold text-slate-900">Treatment Pathways</h2>
                        <p className="text-sm text-slate-500">Recent Treatment Pathways</p>
                    </div>
                    <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        View all pathways
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">
                                    Treatment Name
                                </th>
                                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">
                                    Linked Providers
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {TREATMENTS.map((treatment) => (
                                <tr key={treatment.name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {treatment.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-right">
                                        {treatment.providers} providers
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Required Section */}
            <div>
                <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">Action Required</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2">Providers with issues</h3>
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            There are 35 providers requiring your attention due to incomplete setup or flagged profiles.
                        </p>
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                            Review Issues
                        </button>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2">Matching eligibility status</h3>
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            Review and update eligibility criteria for various treatment pathways.
                        </p>
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                            Review eligibility
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
