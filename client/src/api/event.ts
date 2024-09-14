import type { Dayjs } from 'dayjs';
import { eventsAppKy } from './common';

export interface IEvent {
    name: string;
    start_date: Dayjs;
    end_date: Dayjs;
    location: string;
    thumbnail_path: string;
}

export type EventForm = Omit<IEvent, 'thumbnail_path'> & {
    thumbnail: FileList;
};

const eventKy = eventsAppKy.extend((options) => ({
    prefixUrl: `${options.prefixUrl}/event`,
}));

export async function create(data: EventForm) {
    const multipartData = new FormData();
    multipartData.append('name', data.name);
    multipartData.append('start_date', data.start_date.toISOString());
    multipartData.append('end_date', data.end_date.toISOString());
    multipartData.append('location', data.location);
    multipartData.append('thumbnail', data.thumbnail[0]);
    return await eventKy.put('', { body: multipartData, credentials: 'include' });
}
