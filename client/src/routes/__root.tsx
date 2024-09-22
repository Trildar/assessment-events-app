import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { lazy } from 'react';
import type { EventListQueryOptionsType } from '../main';

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

export const Route = createRootRouteWithContext<RootRouterContext>()({
    component: () => (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
});
