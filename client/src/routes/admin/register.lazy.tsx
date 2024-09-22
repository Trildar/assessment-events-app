import { Button, Container, css, Paper, Stack, Typography, useTheme } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { PasswordElement, PasswordRepeatElement, TextFieldElement } from 'react-hook-form-mui';
import { register } from '../../api/admin';

interface RegisterForm {
    email: string;
    password: string;
    passwordConfirm: string;
}

export const Route = createLazyFileRoute('/admin/register')({
    component: AdminLogin,
});
const inputMaxWidth = css({ maxWidth: '500px' });

function AdminLogin() {
    const { control, handleSubmit } = useForm<RegisterForm>();
    const theme = useTheme();
    const navigate = Route.useNavigate();
    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => navigate({ to: '..' }),
    });
    return (
        <>
            <Container maxWidth="md">
                <Paper sx={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit((data) => registerMutation.mutateAsync(data))}>
                        <Stack spacing={2}>
                            <Typography variant="h3">Admin Registration</Typography>
                            <TextFieldElement
                                name="email"
                                label="Email"
                                control={control}
                                type="email"
                                required
                                rules={{
                                    maxLength: {
                                        value: 255,
                                        message: 'Email cannot be longer than 255 characters',
                                    },
                                }}
                                css={inputMaxWidth}
                            />
                            <PasswordElement
                                name="password"
                                label="Password"
                                control={control}
                                required
                                rules={{
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters long',
                                    },
                                    maxLength: {
                                        value: 255,
                                        message: 'Password cannot be longer than 255 characters',
                                    },
                                }}
                                css={inputMaxWidth}
                            />
                            <PasswordRepeatElement
                                name="passwordConfirm"
                                label="Confirm Password"
                                passwordFieldName="password"
                                control={control}
                                type="password"
                                required
                                css={inputMaxWidth}
                            />
                            {registerMutation.isError ? (
                                <div css={{ color: theme.palette.error.main }}>
                                    Registration error: {registerMutation.error.message}
                                </div>
                            ) : null}
                            <div>
                                <Button variant="contained" type="submit" disabled={registerMutation.isPending}>
                                    Register
                                </Button>
                            </div>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </>
    );
}
