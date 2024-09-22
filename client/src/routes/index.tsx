import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router';

interface EventPageSearch {
    page: number;
}

export const Route = createFileRoute('/')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput): EventPageSearch => {
        let page = search.page as number;
        if (page == null) {
            page = 1;
        }

        return { page };
    },
});
