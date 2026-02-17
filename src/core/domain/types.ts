/**
 * Core domain types for HealthPilot Admin
 */

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
}

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    lastLogin?: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface AuthResult {
    user: AdminUser;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalProviders: number;
    totalIntakes: number;
    completedIntakes: number;
    treatmentMatches: number;
    conversionRate: number;
    revenueThisMonth: number;
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    timestamp: Date;
    details: Record<string, unknown>;
    ipAddress: string;
}

export interface NavigationItem {
    label: string;
    href: string;
    icon: string;
    badge?: number;
    children?: NavigationItem[];
}
