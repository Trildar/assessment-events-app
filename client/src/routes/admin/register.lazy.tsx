import { Button, Container, css, Stack, useTheme } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
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
    const router = useRouter();
    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => router.navigate({ to: '/admin' }),
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
                <h1 css={{ marginTop: 0 }}>Admin Registration</h1>
                <form onSubmit={handleSubmit((data) => registerMutation.mutateAsync(data))}>
                    <Stack spacing={2}>
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
            </Container>
        </>
    );
}
