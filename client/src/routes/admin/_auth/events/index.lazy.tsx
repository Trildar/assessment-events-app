import { Add } from '@mui/icons-material';
import {
    Container,
    Fab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { getList } from '../../../../api/event';

export const Route = createLazyFileRoute('/admin/_auth/events/')({
    component: EventTable,
});

function EventTable() {
    const { page, limit } = Route.useSearch();
    const eventsData = useQuery({
        queryKey: ['eventList', page, limit],
        queryFn: () => getList(page, limit),
        initialData: { total_estimate: 0, data: [] },
    });
    const { total_estimate, data: events } = eventsData.data;
    const navigate = Route.useNavigate();
    return (
        <>
            <Container>
                <h1>Events</h1>
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>End Date</TableCell>
                                    <TableCell>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((ev) => (
                                    <TableRow key={ev._id}>
                                        <TableCell>{ev.name}</TableCell>
                                        <TableCell>{ev.start_date.format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{ev.end_date.format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{ev.location}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={total_estimate}
                        rowsPerPage={limit}
                        page={page}
                        onPageChange={(_, new_page) =>
                            navigate({ to: '.', search: (prev) => ({ ...prev, page: new_page }) })
                        }
                        onRowsPerPageChange={(ev) =>
                            navigate({
                                to: '.',
                                search: (prev) => ({ ...prev, limit: Number.parseInt(ev.target.value) || 10 }),
                            })
                        }
                    />
                </Paper>
            </Container>
            <Fab
                color="primary"
                sx={{ position: 'fixed', bottom: { xs: '2rem', sm: '4rem' }, right: { xs: '2rem', sm: '4rem' } }}
                aria-label="create event"
                href="events/create"
            >
                <Add />
            </Fab>
        </>
    );
}
