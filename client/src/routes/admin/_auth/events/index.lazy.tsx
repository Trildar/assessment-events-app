import { Add, Delete, Edit, FilterList } from '@mui/icons-material';
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { deleteEvent, EventStatus, getStatusName, type IEvent } from '../../../../api/event';
import { PasswordElement, useForm } from 'react-hook-form-mui';

export const Route = createLazyFileRoute('/admin/_auth/events/')({
    component: EventTable,
});

function EventTable() {
    const { page, limit, status: statusFilter } = Route.useSearch();
    const { eventListQueryOptions, eventQueryOptions, queryClient } = Route.useRouteContext();
    const eventsData = useQuery(eventListQueryOptions(page, limit, statusFilter));
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

    const filterButtonRef = useRef(null);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const setStatusFilter = (status: EventStatus | undefined) => {
        navigate({ to: '.', search: (prev) => ({ ...prev, status }) });
    };

    return (
        <>
            <Container>
                <Paper>
                    <Toolbar>
                        <Typography variant="h4" id="table-title" sx={{ flex: 1 }}>
                            Events
                        </Typography>
                        <Tooltip title="Filter by event status">
                            <IconButton
                                ref={filterButtonRef}
                                aria-haspopup="listbox"
                                aria-controls="filter-menu"
                                aria-expanded={filterMenuOpen}
                                onClick={() => setFilterMenuOpen(true)}
                            >
                                <FilterList />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="filter-menu"
                            anchorEl={filterButtonRef.current}
                            open={filterMenuOpen}
                            onClose={() => setFilterMenuOpen(false)}
                            MenuListProps={{ role: 'listbox' }}
                        >
                            <Typography variant="h6" padding="0.5em 1rem">
                                Filter by event status
                            </Typography>
                            <MenuItem selected={statusFilter == null} onClick={() => setStatusFilter(undefined)}>
                                All
                            </MenuItem>
                            <MenuItem
                                selected={statusFilter === EventStatus.Ongoing}
                                onClick={() => setStatusFilter(EventStatus.Ongoing)}
                            >
                                Ongoing
                            </MenuItem>
                            <MenuItem
                                selected={statusFilter === EventStatus.Completed}
                                onClick={() => setStatusFilter(EventStatus.Completed)}
                            >
                                Completed
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                    <TableContainer>
                        <Table aria-labelledby="table-title">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Status</TableCell>
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
                                              <TableCell>{getStatusName(ev.status)}</TableCell>
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
                onClose={deleteHandleClose}
                eventId={deleteEventId}
                eventName={deleteEventName}
            />
        </>
    );
}

function DeleteEvent({
    open,
    onClose,
    eventId,
    eventName,
}: { open: boolean; onClose: () => void; eventId: string; eventName: string }) {
    const { control, handleSubmit, reset } = useForm<{ password: string }>();
    const handleClose = () => {
        reset();
        onClose();
    };

    const { queryClient } = Route.useRouteContext();
    const deleteMutation = useMutation({
        mutationFn: ({ id, password }: { id: string; password: string }) => deleteEvent(id, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
    const handleDelete = handleSubmit((data) =>
        deleteMutation.mutateAsync({ id: eventId, password: data.password }, { onSuccess: () => handleClose() }),
    );

    return (
        <Dialog open={open}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <DialogContentText>
                        Enter your password to confirm deletion of event "{eventName}"
                    </DialogContentText>
                    <form>
                        <PasswordElement
                            name="password"
                            label="Password"
                            control={control}
                            required
                            rules={{
                                maxLength: { value: 255, message: 'Password cannot be longer than 255 characters' },
                            }}
                        />
                    </form>
                    {deleteMutation.isError ? (
                        <Typography color="error">{deleteMutation.error.message}</Typography>
                    ) : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    variant="contained"
                    onClick={handleDelete}
                    startIcon={<Delete />}
                    disabled={deleteMutation.isPending}
                >
                    Delete
                </Button>
                <Button color="primary" variant="outlined" onClick={handleClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
