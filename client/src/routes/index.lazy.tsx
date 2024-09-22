import {
    AppBar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid2,
    Pagination,
    Toolbar,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { getStatusName } from '../api/event';
import { useState } from 'react';

export const Route = createLazyFileRoute('/')({ component: App });

function App() {
    const { page } = Route.useSearch();
    const limit = 8;
    const { eventListQueryOptions } = Route.useRouteContext();
    const eventsData = useQuery(eventListQueryOptions(page - 1, limit));

    let count = 0;
    if (eventsData.data != null) {
        count = Math.ceil(eventsData.data.total_estimate / limit);
    }
    const navigate = Route.useNavigate();
    const handlePageChange = (_: unknown, new_page: number) => {
        navigate({ to: '.', search: (prev) => ({ ...prev, page: new_page }) });
    };

    const [detailIndex, setDetailIndex] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const detailEvent = detailIndex != null ? eventsData.data?.data[detailIndex] : null;
    const openDetailDialog = (i: number) => {
        setDetailIndex(i);
        setDetailOpen(true);
    };

    return (
        <>
            <Grid2 container spacing={4} marginInline={4}>
                {eventsData.data?.data.map((ev, i) => (
                    <Grid2 key={ev._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Card>
                            <CardMedia
                                image={`${import.meta.env.VITE_API_BASE_URL}/${ev.thumbnail_path}`}
                                title="Event thumbnail"
                                sx={{ height: 240, backgroundSize: 'contain' }}
                            />
                            <CardContent>
                                <Typography variant="h4">{ev.name}</Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {getStatusName(ev.status)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button onClick={() => openDetailDialog(i)}>Open details</Button>
                            </CardActions>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>
            {detailEvent != null ? (
                <Dialog open={detailOpen} fullWidth={true} onClose={() => setDetailOpen(false)}>
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/${detailEvent.thumbnail_path}`}
                        alt="Event thumbnail"
                        css={{ height: 'auto', maxHeight: 400, width: '100%', objectFit: 'contain' }}
                    />
                    <DialogTitle>{detailEvent.name}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Status: {getStatusName(detailEvent.status)}</DialogContentText>
                        <DialogContentText>Start Date: {detailEvent.start_date.format('DD/MM/YYYY')}</DialogContentText>
                        <DialogContentText>End Date: {detailEvent.end_date.format('DD/MM/YYYY')}</DialogContentText>
                        <DialogContentText>Location: {detailEvent.location}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            <AppBar color="default" sx={{ top: 'auto', bottom: 0 }}>
                <Toolbar>
                    <Pagination count={count} page={page} onChange={handlePageChange} sx={{ marginInline: 'auto' }} />
                </Toolbar>
            </AppBar>
        </>
    );
}
