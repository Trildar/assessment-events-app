import { queryOptions } from '@tanstack/react-query';
import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { get, getList } from '../../../../api/event';

interface EventListSearch {
    page: number;
    limit: number;
}

function eventListQueryOptions(page: number, limit: number) {
    return queryOptions({
        queryKey: ['events', { page, limit }],
        queryFn: () => getList(page, limit),
        staleTime: 500,
    });
}

function eventQueryOptions(id: string) {
    return queryOptions({
        queryKey: ['events', id],
        queryFn: () => get(id),
    });
}

export const Route = createFileRoute('/admin/_auth/events/')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput): EventListSearch => {
        let page = search.page as number;
        let limit = search.limit as number;
        if (page == null) {
            page = 0;
        }
        if (limit == null) {
            limit = 10;
        }
        return {
            page,
            limit,
        };
    },
    beforeLoad: () => {
        return {
            eventListQueryOptions,
            eventQueryOptions,
        };
    },
    loaderDeps: ({ search: { page, limit } }) => ({ page, limit }),
    loader: async ({ context: { queryClient }, deps: { page, limit } }) => {
        await queryClient.prefetchQuery(eventListQueryOptions(page, limit));
    },
});
