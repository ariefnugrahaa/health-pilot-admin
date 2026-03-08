import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, LoginCredentials } from '@/core/domain/types';
import { UserRole } from '@/core/domain/types';

interface AuthState {
    user: AdminUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    refreshTokens: () => Promise<boolean>;
    clearError: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });

                try {
                    // 1. Login with Backend
                    const loginRes = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials),
                    });

                    const loginData = await loginRes.json();

                    if (!loginRes.ok) {
                        throw new Error(loginData.error?.message || 'Login failed');
                    }

                    const { tokens } = loginData.data;

                    // 2. Fetch User Profile
                    const meRes = await fetch(`${API_URL}/users/me`, {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                        },
                    });

                    const meData = await meRes.json();

                    if (!meRes.ok) {
                        throw new Error(meData.error?.message || 'Failed to fetch user profile');
                    }

                    const user = meData.data;

                    set({
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role as UserRole,
                            isActive: user.status === 'ACTIVE',
                            createdAt: new Date(user.createdAt),
                            lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
                        },
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'An unknown error occurred',
                    });
                }
            },

            logout: () => {
                const { accessToken } = get();
                if (accessToken) {
                    fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }).catch(() => { /* ignore logout errors */ });
                }

                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            },

            refreshTokens: async () => {
                const { refreshToken } = get();
                if (!refreshToken) {
                    return false;
                }

                try {
                    const response = await fetch(`${API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!response.ok) {
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                        });
                        return false;
                    }

                    const data = await response.json();
                    const { accessToken, refreshToken: newRefreshToken } = data.data;

                    set({
                        accessToken,
                        refreshToken: newRefreshToken,
                    });

                    return true;
                } catch (error) {
                    console.error('Token refresh error:', error);
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                    return false;
                }
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'healthpilot-admin-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
