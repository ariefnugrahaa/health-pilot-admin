'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    Settings,
    Shield,
    ChevronLeft,
    Link as LinkIcon,
    Microscope,
    ClipboardSignature,
    HelpCircle,
    FileText,
} from 'lucide-react';
import type { AdminUser } from '@/core/domain/types';

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
    user: AdminUser | null;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Providers', href: '/admin/providers', icon: Users },
    { label: 'Supplements', href: '/admin/supplements', icon: LinkIcon },
    { label: 'Treatments', href: '/admin/treatments', icon: FileText },
    { label: 'Labs', href: '/admin/labs', icon: Microscope },
    { label: 'Blood Test Orders', href: '/admin/blood-test-orders', icon: ClipboardSignature },
    { label: 'Intake', href: '/admin/intake', icon: HelpCircle },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({
    collapsed,
    onToggleCollapse,
    mobileOpen,
    onMobileClose,
    user,
}: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string): boolean => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    const renderNavItem = (item: NavItem, isMobile = false) => {
        const active = isActive(item.href);

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onMobileClose : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                title={collapsed && !isMobile ? item.label : undefined}
            >
                <item.icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 text-teal-600">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        {!collapsed && (
                            <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">
                                HEALTH PILOT
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => renderNavItem(item))}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                            <span className="font-bold text-cyan-700 text-sm">AU</span>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
                                <p className="text-xs text-slate-500 truncate">System Administrator</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
                        <div className="flex items-center gap-3 text-teal-600">
                            <Shield className="w-6 h-6" />
                            <span className="font-heading font-bold text-lg text-slate-900">HEALTH PILOT</span>
                        </div>
                        <button onClick={onMobileClose} className="p-1 text-slate-400">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => renderNavItem(item, true))}
                    </nav>
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                <span className="font-bold text-cyan-700 text-sm">AU</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Admin User</p>
                                <p className="text-xs text-slate-500">System Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
