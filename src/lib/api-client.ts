/**
 * API Client with automatic token refresh
 * Handles 401 errors by refreshing the access token and retrying the request
 */

import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            // Refresh token is invalid, clear auth
            useAuthStore.getState().logout();
            return null;
        }

        const data = await response.json();
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        // Update store with new tokens
        const currentState = useAuthStore.getState();
        useAuthStore.setState({
            accessToken,
            refreshToken: newRefreshToken,
        });

        return accessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        useAuthStore.getState().logout();
        return null;
    }
}

interface FetchOptions extends RequestInit {
    skipAuthRefresh?: boolean;
}

/**
 * Fetch wrapper with automatic token refresh
 */
export async function apiFetch(
    endpoint: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { skipAuthRefresh = false, ...fetchOptions } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // Add auth header if token exists
    const token = useAuthStore.getState().accessToken;
    const headers = new Headers(fetchOptions.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && fetchOptions.body) {
        headers.set('Content-Type', 'application/json');
    }

    let response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    // If 401 and not already refreshing, try to refresh token
    if (response.status === 401 && !skipAuthRefresh && token) {
        if (isRefreshing) {
            // Wait for the ongoing refresh to complete
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken: string) => {
                    // Retry with new token
                    const newHeaders = new Headers(fetchOptions.headers);
                    newHeaders.set('Authorization', `Bearer ${newToken}`);
                    fetch(url, { ...fetchOptions, headers: newHeaders })
                        .then(resolve)
                        .catch(reject);
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();

            if (newToken) {
                onTokenRefreshed(newToken);
                // Retry the original request with new token
                const newHeaders = new Headers(fetchOptions.headers);
                newHeaders.set('Authorization', `Bearer ${newToken}`);
                response = await fetch(url, {
                    ...fetchOptions,
                    headers: newHeaders,
                });
            }
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}

/**
 * Convenience methods for API calls
 */
export const api = {
    get: (endpoint: string, options?: FetchOptions) =>
        apiFetch(endpoint, { ...options, method: 'GET' }),

    post: (endpoint: string, body?: unknown, options?: FetchOptions) =>
        apiFetch(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: (endpoint: string, body?: unknown, options?: FetchOptions) =>
        apiFetch(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    patch: (endpoint: string, body?: unknown, options?: FetchOptions) =>
        apiFetch(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: (endpoint: string, options?: FetchOptions) =>
        apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

export { API_BASE_URL };
