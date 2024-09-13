import ky from 'ky';

export const eventsAppKy = ky.create({
    prefixUrl: import.meta.env.VITE_API_BASE_URL,
    hooks: {
        beforeError: [
            async (error) => {
                // Replace the default HTTP error message with the error message from server if available
                const { response } = error;
                error.message = (await response?.json<{ error?: string }>())?.error ?? error.message;

                return error;
            },
        ],
    },
});
