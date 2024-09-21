import { Button, Container, Stack, useTheme } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useForm, useWatch } from 'react-hook-form';
import { create, type CreateEventForm } from '../../../../api/event';
import { TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';
import { Add, CloudUpload, Image } from '@mui/icons-material';
import { type Reducer, useMemo, useReducer } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-sg';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useMutation } from '@tanstack/react-query';
import { VisuallyHiddenInput } from '../../../../components/VisuallyHiddenInput';

export const Route = createLazyFileRoute('/admin/_auth/events/create')({
    component: CreateEvent,
});

function CreateEvent() {
    const { control, handleSubmit, register } = useForm<CreateEventForm>();
    const { queryClient } = Route.useRouteContext();
    const [thumbnailUrlObject, updateThumbnailUrlObject] = useReducer<Reducer<string | null, File | null>>(
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
    const navigate = Route.useNavigate();
    const eventMutation = useMutation({
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            navigate({ to: '..' });
        },
    });
    const theme = useTheme();

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
                <h1 css={{ marginTop: 0 }}>Create Event</h1>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                    <form onSubmit={handleSubmit((data) => eventMutation.mutateAsync(data))}>
                        <Stack spacing={2}>
                            <TextFieldElement name="name" label="Event name" control={control} required />
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
                                {thumbnailUrlObject ? (
                                    <img
                                        src={thumbnailUrlObject}
                                        alt="Event thumbnail"
                                        css={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Image css={{ width: '400px' }} />
                                )}
                            </Container>
                            <div>
                                <Button component="label" variant="outlined" tabIndex={-1} startIcon={<CloudUpload />}>
                                    Choose thumbnail
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        required
                                        {...register('thumbnail', { required: true })}
                                    />
                                </Button>
                            </div>
                            {eventMutation.isError ? (
                                <div css={{ color: theme.palette.error.main }}>
                                    Error creating event: {eventMutation.error.message}
                                </div>
                            ) : null}
                            <div>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={eventMutation.isPending}
                                    startIcon={<Add />}
                                >
                                    Create event
                                </Button>
                            </div>
                        </Stack>
                    </form>
                </LocalizationProvider>
            </Container>
        </>
    );
}
