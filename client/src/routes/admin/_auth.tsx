import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuth } from '../../api/admin';

export const Route = createFileRoute('/admin/_auth')({
    beforeLoad: async ({ context, location }) => {
        const isUserAuthed = await context.queryClient.fetchQuery({
            queryKey: ['isAuth'],
            queryFn: isAuth,
            staleTime: 10000,
        });
        if (!isUserAuthed) {
            throw redirect({ to: '/admin', search: { redirect: location.href, bounced: true } });
        }
    },
});
