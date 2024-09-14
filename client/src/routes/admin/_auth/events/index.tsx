import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

interface EventListSearch {
    page: number;
    limit: number;
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
});
