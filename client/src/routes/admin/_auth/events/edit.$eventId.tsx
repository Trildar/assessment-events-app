import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_auth/events/edit/$eventId')({
    loader: async ({ context: { queryClient, eventQueryOptions }, params: { eventId } }) => {
        await queryClient.prefetchQuery(eventQueryOptions(eventId));
    },
});

