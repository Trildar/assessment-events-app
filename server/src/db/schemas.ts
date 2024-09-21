import mongoose, { Schema, Types } from "mongoose";

interface IUser {
    email: string,
    password: Types.Buffer,
}

export enum EventStatus {
    Ongoing = 0,
    Completed = 1
}

export interface IEvent {
    name: string,
    status: EventStatus,
    start_date: Date,
    end_date: Date,
    location: string,
    thumbnail_path: string,
}

const user_schema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: Buffer, required: true }
});
const event_schema = new Schema<IEvent>({
    name: { type: String, required: true },
    status: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    location: String,
    thumbnail_path: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", user_schema);
export const Event = mongoose.model<IEvent>("Event", event_schema);

