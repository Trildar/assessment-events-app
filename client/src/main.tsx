import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
// Fonts for Material UI
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, ThemeProvider } from '@mui/material';
import { keepPreviousData, QueryClient, QueryClientProvider, queryOptions } from '@tanstack/react-query';
import { type EventStatus, getList } from './api/event';

function eventListQueryOptions(page: number, limit: number, status?: EventStatus) {
    return queryOptions({
        queryKey: ['events', { page, limit, status }],
        queryFn: () => getList(page, limit, status),
        placeholderData: keepPreviousData,
        staleTime: 500,
    });
}
export type EventListQueryOptionsType = typeof eventListQueryOptions;

const queryClient = new QueryClient();
const router = createRouter({ routeTree, context: { queryClient, eventListQueryOptions } });
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
const theme = createTheme({ cssVariables: true });

// biome-ignore lint/style/noNonNullAssertion: Element with id root always exists
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme} />
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
);
