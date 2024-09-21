import { Add, Delete, Edit } from '@mui/icons-material';
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogTitle,
    Fab,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { deleteEvent, type IEvent } from '../../../../api/event';

export const Route = createLazyFileRoute('/admin/_auth/events/')({
    component: EventTable,
});

function EventTable() {
    const { page, limit } = Route.useSearch();
    const { eventListQueryOptions, eventQueryOptions, queryClient } = Route.useRouteContext();
    const eventsData = useQuery(eventListQueryOptions(page, limit));
    const navigate = Route.useNavigate();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteHandleClose = () => {
        setDeleteOpen(false);
    };
    const [{ deleteEventId, deleteEventName }, setDeleteEvent] = useState({ deleteEventId: '', deleteEventName: '' });
    const handleDeleteEvent = (ev: IEvent) => {
        const { _id: deleteEventId, name: deleteEventName } = ev;
        setDeleteEvent({ deleteEventId, deleteEventName });
        setDeleteOpen(true);
    };

    const handleEditEvent = (ev: IEvent) => {
        queryClient.prefetchQuery({
            ...eventQueryOptions(ev._id),
            initialData: ev,
            initialDataUpdatedAt: eventsData.dataUpdatedAt,
        });
        navigate({ to: `edit/${ev._id}`, search: true });
    };

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
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!eventsData.isPending
                                    ? eventsData.data?.data.map((ev) => (
                                          <TableRow key={ev._id}>
                                              <TableCell>{ev.name}</TableCell>
                                              <TableCell>{ev.start_date.format('DD/MM/YYYY')}</TableCell>
                                              <TableCell>{ev.end_date.format('DD/MM/YYYY')}</TableCell>
                                              <TableCell>{ev.location}</TableCell>
                                              <TableCell>
                                                  <IconButton
                                                      color="primary"
                                                      aria-label="edit"
                                                      onClick={() => handleEditEvent(ev)}
                                                  >
                                                      <Edit />
                                                  </IconButton>
                                                  <IconButton
                                                      color="error"
                                                      aria-label="delete"
                                                      onClick={() => handleDeleteEvent(ev)}
                                                  >
                                                      <Delete />
                                                  </IconButton>
                                              </TableCell>
                                          </TableRow>
                                      ))
                                    : null}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={eventsData.data?.total_estimate ?? 0}
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
            <DeleteEvent
                open={deleteOpen}
                handleClose={deleteHandleClose}
                eventId={deleteEventId}
                eventName={deleteEventName}
            />
        </>
    );
}

function DeleteEvent({
    open,
    handleClose,
    eventId,
    eventName,
}: { open: boolean; handleClose: () => void; eventId: string; eventName: string }) {
    const { queryClient } = Route.useRouteContext();
    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
    const handleDelete = () => {
        return deleteMutation.mutateAsync(eventId, { onSuccess: () => handleClose() });
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Delete event {eventName}?</DialogTitle>
            <DialogActions>
                <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    Delete
                </Button>
                <Button color="primary" variant="outlined" onClick={handleClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
