'use client';

import { useRouter } from 'next/navigation';
import {
    Menu,
    Search,
    Bell,
    Sun,
    Moon,
    ChevronDown,
    LogOut,
    Settings,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useState } from 'react';

interface HeaderProps {
    user: AdminUser | null;
    onMenuClick: () => void;
}

export function AdminHeader({ user, onMenuClick }: HeaderProps) {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
            {/* Left side */}
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search */}
                <div className="hidden sm:flex items-center relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search anything..."
                        className="w-[280px] lg:w-[360px] h-10 pl-10 rounded-xl bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all text-sm"
                    />
                    <kbd className="absolute right-3 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 font-mono">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground relative"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse-soft" />
                </Button>

                {/* Separator */}
                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-mint-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                    {user?.firstName?.charAt(0)}
                                    {user?.lastName?.charAt(0)}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-foreground leading-none">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                        <DropdownMenuLabel className="px-3 py-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">
                                    {user?.email}
                                </span>
                                <Badge variant="secondary" className="w-fit mt-2 text-[10px]">
                                    {user?.role?.replace('_', ' ')}
                                </Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
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
        </header>
    );
}
