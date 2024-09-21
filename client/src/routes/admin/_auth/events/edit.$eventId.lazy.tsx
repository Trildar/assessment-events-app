import { createLazyFileRoute } from '@tanstack/react-router';
import { edit, EventStatus, getStatusName, type EditEventForm } from '../../../../api/event';
import { useForm, useWatch } from 'react-hook-form';
import { type Reducer, useMemo, useReducer } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Container, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-sg';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';
import { CloudUpload, Save } from '@mui/icons-material';
import { VisuallyHiddenInput } from '../../../../components/VisuallyHiddenInput';

export const Route = createLazyFileRoute('/admin/_auth/events/edit/$eventId')({
    component: EditEvent,
});

function EditEvent() {
    const { queryClient, eventQueryOptions } = Route.useRouteContext();
    const { eventId } = Route.useParams();
    const eventData = useQuery(eventQueryOptions(eventId));
    const initialForm: Partial<EditEventForm> = {
        name: eventData.data?.name,
        status: eventData.data?.status,
        start_date: eventData.data?.start_date,
        end_date: eventData.data?.end_date,
        location: eventData.data?.location,
    };
    const { control, handleSubmit, register } = useForm<EditEventForm>({ defaultValues: initialForm });
    const [thumbnailUrlObject, updateThumbnailUrlObject] = useReducer<Reducer<string | null, File | null | undefined>>(
        (state, newThumbnail) => {
            if (state) {
                URL.revokeObjectURL(state);
            }
            return newThumbnail ? URL.createObjectURL(newThumbnail) : null;
        },
        null,
    );
    const thumbnailFile = useWatch({ name: 'thumbnail', control, defaultValue: undefined })?.item(0);
    useMemo(() => updateThumbnailUrlObject(thumbnailFile), [thumbnailFile]);
    const eventStatusOptions = [EventStatus.Ongoing, EventStatus.Completed].map((v) => ({
        id: v,
        label: getStatusName(v),
    }));

    const navigate = Route.useNavigate();
    const eventMutation = useMutation({
        mutationFn: (data: EditEventForm) => edit(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            navigate({ to: '/admin/events', search: true });
        },
    });

    return (
        <>
            <Container
                maxWidth="md"
                sx={{
                    backgroundColor: 'background.default',
                    borderRadius: 4,
                    padding: '2rem',
                }}
            >
                <h1 css={{ marginTop: 0 }}>Edit Event</h1>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                    <form onSubmit={handleSubmit((data) => eventMutation.mutateAsync(data))}>
                        <Stack spacing={2}>
                            <TextFieldElement name="name" label="Event name" control={control} required />
                            <SelectElement
                                name="status"
                                label="Status"
                                options={eventStatusOptions}
                                control={control}
                                required
                            />
                            <DatePickerElement name="start_date" label="Start date" control={control} required />
                            <DatePickerElement
                                name="end_date"
                                label="End date"
                                control={control}
                                required
                                rules={{
                                    validate: {
                                        startEndDate: (end_date, form_data) =>
                                            !end_date.isBefore(form_data.start_date) ||
                                            'End date must be same as or after start date',
                                    },
                                }}
                            />
                            <TextFieldElement name="location" label="Event location" control={control} required />
                            <Container
                                disableGutters={true}
                                sx={{
                                    width: 'fit-content',
                                    height: '200px',
                                    backgroundColor: 'grey.200',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={
                                        thumbnailUrlObject ??
                                        (eventData.data?.thumbnail_path
                                            ? `${import.meta.env.VITE_API_BASE_URL}/${eventData.data?.thumbnail_path}`
                                            : '')
                                    }
                                    alt="Event thumbnail"
                                    css={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </Container>
                            <div>
                                <Button component="label" variant="outlined" tabIndex={-1} startIcon={<CloudUpload />}>
                                    Choose thumbnail
                                    <VisuallyHiddenInput type="file" accept="image/*" {...register('thumbnail')} />
                                </Button>
                            </div>
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={eventMutation.isPending}
                                    startIcon={<Save />}
                                >
                                    Save changes
                                </Button>
                                <Button variant="outlined" onClick={() => history.back()}>
                                    Cancel
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </LocalizationProvider>
            </Container>
        </>
    );
}
