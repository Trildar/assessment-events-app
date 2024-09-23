import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { lazy } from 'react';
import type { EventListQueryOptionsType } from '../main';
import { CssBaseline, GlobalStyles } from '@mui/material';

interface RootRouterContext {
    queryClient: QueryClient;
    eventListQueryOptions: EventListQueryOptionsType;
}

const TanStackRouterDevtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
          import('@tanstack/router-devtools').then((res) => ({
              default: res.TanStackRouterDevtools,
          })),
      );
const CustomStyles = (
    <GlobalStyles
        styles={(theme) => ({
            body: {
                backgroundColor: theme.palette.grey[300],
                display: 'flex',
                placeItems: 'center',
                minHeight: '100vh',
            },
            '#root': {
                width: '100%',
            },
        })}
    />
);

export const Route = createRootRouteWithContext<RootRouterContext>()({
    component: () => (
        <>
            <CssBaseline />
            {CustomStyles}
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
});
