import { createFileRoute } from '@tanstack/react-router';
import { get, getList } from '../../../api/event';
import { queryOptions } from '@tanstack/react-query';

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
        staleTime: 500,
    });
}

export const Route = createFileRoute('/admin/_auth/events')({
    beforeLoad: () => {
        return {
            eventListQueryOptions,
            eventQueryOptions,
        };
    },
});
