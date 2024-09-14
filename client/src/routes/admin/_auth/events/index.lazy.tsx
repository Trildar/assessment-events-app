import { Add } from '@mui/icons-material';
import { Container, Fab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/admin/_auth/events/')({
    component: EventTable,
});

function EventTable() {
    return (
        <>
            <Container>
                <h1>Events</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Location</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody></TableBody>
                    </Table>
                </TableContainer>
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
