import { createFileRoute } from '@tanstack/react-router';
import { type EventStatus, get, getList } from '../../../api/event';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

function eventListQueryOptions(page: number, limit: number, status?: EventStatus) {
    return queryOptions({
        queryKey: ['events', { page, limit, status }],
        queryFn: () => getList(page, limit, status),
        placeholderData: keepPreviousData,
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
