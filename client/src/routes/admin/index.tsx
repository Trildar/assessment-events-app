import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuth } from '../../api/admin';

interface LoginSearch {
    redirect?: string;
    bounced?: boolean;
}

export const Route = createFileRoute('/admin/')({
    beforeLoad: async ({ context }) => {
        const isUserAuthed = await context.queryClient.fetchQuery({ queryKey: ['isAuth'], queryFn: isAuth });
        if (isUserAuthed) {
            throw redirect({ to: '/admin/events' });
        }
    },
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        return {
            redirect: search.redirect as string,
            bounced: (search.bounced as boolean) ?? false,
        };
    },
});

