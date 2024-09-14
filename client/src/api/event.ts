import type { Dayjs } from 'dayjs';
import { eventsAppKy, type PaginatedData } from './common';
import dayjs from 'dayjs';

export interface IEvent {
    _id: string;
    name: string;
    start_date: Dayjs;
    end_date: Dayjs;
    location: string;
    thumbnail_path: string;
}

interface EventViewModel {
    _id: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    thumbnail_path: string;
}

export type EventForm = Omit<IEvent, 'thumbnail_path' | '_id'> & { thumbnail: FileList };

const eventKy = eventsAppKy.extend((options) => ({
    prefixUrl: `${options.prefixUrl}/event`,
}));

export async function getList(page: number, limit: number): Promise<PaginatedData<IEvent[]>> {
    const data = await eventKy.get('list', { searchParams: { page, limit } }).json<PaginatedData<EventViewModel[]>>();
    return {
        total_estimate: data.total_estimate,
        data: data.data.map(
            (ev): IEvent => ({
                _id: ev._id,
                name: ev.name,
                start_date: dayjs(ev.start_date),
                end_date: dayjs(ev.end_date),
                location: ev.location,
                thumbnail_path: ev.thumbnail_path,
            }),
        ),
    };
}

export async function create(data: EventForm) {
    const multipartData = new FormData();
    multipartData.append('name', data.name);
    multipartData.append('start_date', data.start_date.toISOString());
    multipartData.append('end_date', data.end_date.toISOString());
    multipartData.append('location', data.location);
    multipartData.append('thumbnail', data.thumbnail[0]);
    return await eventKy.put('', { body: multipartData, credentials: 'include' });
}
