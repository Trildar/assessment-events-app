import { createFileRoute } from '@tanstack/react-router';
import { get } from '../../../api/event';
import { queryOptions } from '@tanstack/react-query';

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
            eventQueryOptions,
        };
    },
});
