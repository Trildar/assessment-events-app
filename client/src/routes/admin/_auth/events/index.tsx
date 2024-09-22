import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { EventStatus } from '../../../../api/event';

interface EventListSearch {
    page: number;
    limit: number;
    status?: EventStatus;
}

export const Route = createFileRoute('/admin/_auth/events/')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput): EventListSearch => {
        let page = search.page as number;
        let limit = search.limit as number;
        let status = search.status as EventStatus | undefined;
        if (page == null) {
            page = 0;
        }
        if (limit == null) {
            limit = 10;
        }
        if (!(status == null || status === EventStatus.Ongoing || status === EventStatus.Completed)) {
            status = undefined;
        }
        return {
            page,
            limit,
            status,
        };
    },
    loaderDeps: ({ search: { page, limit } }) => ({ page, limit }),
    loader: async ({ context: { queryClient, eventListQueryOptions }, deps: { page, limit } }) => {
        await queryClient.prefetchQuery(eventListQueryOptions(page, limit));
    },
});
