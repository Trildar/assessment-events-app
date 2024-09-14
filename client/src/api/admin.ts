import { eventsAppKy } from './common';

export interface IAdminRegister {
    email: string;
    password: string;
}
export interface IAdminLogin {
    email: string;
    password: string;
}

const adminKy = eventsAppKy.extend((options) => ({
    prefixUrl: `${options.prefixUrl}/admin`,
}));

export async function register(data: IAdminRegister) {
    await adminKy.post('register', { json: data });
}

export async function login(data: IAdminLogin) {
    await adminKy.post('login', { json: data, credentials: 'include' });
}

export async function isAuth() {
    return await adminKy.get('is-auth', { credentials: 'include' }).json<boolean>();
}
