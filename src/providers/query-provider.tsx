'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Prevent refetching on window focus in development
                refetchOnWindowFocus: false,
                // Data is fresh for 60 seconds
                staleTime: 60 * 1000,
                // Retry failed requests once
                retry: 1,
            },
        },
    });
}

/**
 * Wrap your app (or layout) with this provider.
 * Uses a singleton QueryClient instance per browser session.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
