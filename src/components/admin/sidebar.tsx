'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Users,
    Settings as SettingsIcon,
    Shield,
    ChevronLeft,
    Link as LinkIcon,
    Microscope,
    ClipboardSignature,
    HelpCircle,
    FileText,
    LogOut,
    User as UserIcon,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
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
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export function AdminSidebar({
    collapsed,
    onToggleCollapse,
    mobileOpen,
    onMobileClose,
    user,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

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

    const renderUserAndControls = (isMobile = false) => {
        const isCollapsed = collapsed && !isMobile;

        return (
            <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors w-full focus:outline-none ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-mint-500 flex items-center justify-center shrink-0">
                                <span className="text-white text-sm font-bold">
                                    {user?.firstName?.charAt(0) || 'A'}
                                    {user?.lastName?.charAt(0) || 'U'}
                                </span>
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user?.role?.replace('_', ' ') || 'Admin User'}
                                        </p>
                                    </div>
                                    <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isCollapsed ? "center" : "end"} side="top" sideOffset={12} className="w-56 rounded-xl p-2 z-[100]">
                        <DropdownMenuLabel className="px-3 py-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">
                                    {user?.email || 'admin@example.com'}
                                </span>
                                <Badge variant="secondary" className="w-fit mt-2 text-[10px]">
                                    {user?.role?.replace('_', ' ') || 'Administrator'}
                                </Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">
                            <SettingsIcon className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
                {renderUserAndControls()}
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
                    {renderUserAndControls(true)}
                </div>
            </aside>
        </>
    );
}
