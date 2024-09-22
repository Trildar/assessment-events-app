import type { Dayjs } from 'dayjs';
import { eventsAppKy, type PaginatedData } from './common';
import dayjs from 'dayjs';

export enum EventStatus {
    Ongoing = 0,
    Completed = 1,
}

export interface IEvent {
    _id: string;
    name: string;
    status: EventStatus;
    start_date: Dayjs;
    end_date: Dayjs;
    location: string;
    thumbnail_path: string;
}

interface EventViewModel {
    _id: string;
    name: string;
    status: EventStatus;
    start_date: string;
    end_date: string;
    location: string;
    thumbnail_path: string;
}

export type CreateEventForm = Omit<IEvent, 'thumbnail_path' | '_id' | 'status'> & { thumbnail: FileList };
export type EditEventForm = Omit<IEvent, 'thumbnail_path' | '_id'> & { thumbnail: FileList };

export function getStatusName(status: EventStatus) {
    switch (status) {
        case EventStatus.Ongoing:
            return 'Ongoing';
        case EventStatus.Completed:
            return 'Completed';
    }
}

const eventKy = eventsAppKy.extend((options) => ({
    prefixUrl: `${options.prefixUrl}/event`,
}));

export async function create(data: CreateEventForm) {
    const multipartData = new FormData();
    multipartData.append('name', data.name);
    multipartData.append('start_date', data.start_date.toISOString());
    multipartData.append('end_date', data.end_date.toISOString());
    multipartData.append('location', data.location);
    multipartData.append('thumbnail', data.thumbnail[0]);
    return await eventKy.put('', { body: multipartData, credentials: 'include' });
}

export async function getList(page: number, limit: number, status?: EventStatus): Promise<PaginatedData<IEvent[]>> {
    // Need to create an explicitly typed object with optional status field to satisfy type checks
    const searchParams: { page: number; limit: number; status?: EventStatus } = { page, limit, status };
    const data = await eventKy.get('list', { searchParams }).json<PaginatedData<EventViewModel[]>>();
    return {
        total_estimate: data.total_estimate,
        data: data.data.map(
            (ev): IEvent => ({
                _id: ev._id,
                name: ev.name,
                status: ev.status,
                start_date: dayjs(ev.start_date),
                end_date: dayjs(ev.end_date),
                location: ev.location,
                thumbnail_path: ev.thumbnail_path,
            }),
        ),
    };
}

export async function get(id: string): Promise<IEvent> {
    const data = await eventKy.get(id).json<EventViewModel>();
    return {
        _id: data._id,
        name: data.name,
        status: data.status,
        start_date: dayjs(data.start_date),
        end_date: dayjs(data.end_date),
        location: data.location,
        thumbnail_path: data.thumbnail_path,
    };
}

export async function edit(id: string, data: EditEventForm) {
    const multipartData = new FormData();
    multipartData.append('name', data.name);
    multipartData.append('status', data.status.toString());
    multipartData.append('start_date', data.start_date.toISOString());
    multipartData.append('end_date', data.end_date.toISOString());
    multipartData.append('location', data.location);
    if (data.thumbnail[0] != null) {
        multipartData.append('thumbnail', data.thumbnail[0]);
    }
    return await eventKy.post(id, { body: multipartData, credentials: 'include' });
}

export async function deleteEvent(id: string) {
    return await eventKy.delete(id, { credentials: 'include' });
}
