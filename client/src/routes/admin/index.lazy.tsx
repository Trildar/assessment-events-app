import { Button, Container, css, Paper, Stack, Typography, useTheme } from '@mui/material';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { login, type IAdminLogin } from '../../api/admin';
import { useForm } from 'react-hook-form';
import { PasswordElement, TextFieldElement } from 'react-hook-form-mui';
import { useMutation } from '@tanstack/react-query';

type LoginForm = IAdminLogin;

export const Route = createLazyFileRoute('/admin/')({
    component: AdminLogin,
});
const inputMaxWidth = css({ maxWidth: '500px' });

function AdminLogin() {
    const { control, handleSubmit } = useForm<LoginForm>();
    const theme = useTheme();
    const router = useRouter();
    const searchParams = Route.useSearch();
    const { queryClient } = Route.useRouteContext();
    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['isAuth'] });
            if (searchParams.redirect) {
                router.history.replace(searchParams.redirect);
            } else {
                router.navigate({ to: '/admin/events', replace: true });
            }
        },
    });

    return (
        <>
            <Container maxWidth="md">
                <Paper sx={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit((data) => loginMutation.mutateAsync(data))}>
                        <Stack spacing={2}>
                            <Typography variant="h3">Admin Login</Typography>
                            <TextFieldElement
                                name="email"
                                label="Email"
                                control={control}
                                type="email"
                                required
                                css={inputMaxWidth}
                                rules={{
                                    maxLength: {
                                        value: 255,
                                        message: 'Email cannot be longer than 255 characters',
                                    },
                                }}
                            />
                            <PasswordElement
                                name="password"
                                label="Password"
                                control={control}
                                required
                                rules={{
                                    maxLength: {
                                        value: 255,
                                        message: 'Password cannot be longer than 255 characters',
                                    },
                                }}
                                css={inputMaxWidth}
                            />
                            {loginMutation.isError ? (
                                <div css={{ color: theme.palette.error.main }}>
                                    Login error: {loginMutation.error.message}
                                </div>
                            ) : null}
                            {searchParams.bounced ? (
                                <div css={{ color: theme.palette.error.main }}>Login required to access page</div>
                            ) : null}
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" type="submit" disabled={loginMutation.isPending}>
                                    Login
                                </Button>
                                <Button variant="outlined" color="secondary" href="/admin/register">
                                    Register
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </>
    );
}
