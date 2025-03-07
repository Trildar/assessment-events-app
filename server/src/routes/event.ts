import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import dayjs from "dayjs";
import type { Request } from "express";
import { auth_admin, verify_password } from "../middleware/auth.js";
import { Event, EventStatus, User } from "../db/schemas.js";
import { customAlphabet } from "nanoid";
import { createHash } from "node:crypto";

const upload_handler = multer({
    storage: multer.diskStorage({
        destination: "store/event/thumb",
        filename: (req, file, callback) => {
            const filename_generator = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_-", 18);
            callback(null, filename_generator());
        },
    })
});
const router = express.Router();

async function get_file_hash(file: string | fs.FileHandle): Promise<Buffer> {
    let file_data: Buffer;
    if (typeof file === "string") {
        file_data = await fs.readFile(file);
    } else {
        file_data = await file.readFile();
    }
    const hash = createHash("sha256");
    hash.update(file_data);
    return hash.digest();
}

router.put("/", auth_admin);
router.post("/:id", auth_admin);
router.delete("/:id", auth_admin);

// TODO: Need to clean up the uploaded file if there's a validation error. Not sure if there's an easy way to do that without a lot of repitition.
router.put("/", upload_handler.single("thumbnail"), async (req, res) => {
    const name_raw = req.body.name;
    if (name_raw == null) {
        res.status(400).json({ error: "Required field, name, is missing." });
        return;
    }
    if (typeof name_raw !== "string") {
        res.status(400).json({ error: "Invalid type for name. Must be a string." });
        return;
    }
    if (name_raw.length === 0) {
        res.status(400).json({ error: "Please enter a name for the event." });
        return;
    }
    if (name_raw.length > 200) {
        res.status(400).json({ error: "Name is too long. Maximum length is 200." });
        return;
    }
    const name = name_raw;
    const start_date_raw = req.body.start_date;
    if (start_date_raw == null) {
        res.status(400).json({ error: "Required field, start_date, is missing." });
        return;
    }
    if (typeof start_date_raw !== "string") {
        res.status(400).json({ error: "Invalid type for start_date. Must be a string." });
        return;
    }
    const start_date = dayjs(start_date_raw);
    if (!start_date.isValid()) {
        res.status(400).json({ error: "Invalid value given for start_date." });
        return;
    }
    const end_date_raw = req.body.end_date;
    if (end_date_raw == null) {
        res.status(400).json({ error: "Required field, end_date, is missing." });
        return;
    }
    if (typeof end_date_raw !== "string") {
        res.status(400).json({ error: "Invalid type for end_date. Must be a string." });
        return;
    }
    const end_date = dayjs(end_date_raw);
    if (!end_date.isValid()) {
        res.status(400).json({ error: "Invalid value given for end_date." });
        return;
    }
    if (end_date.isBefore(start_date)) {
        res.status(400).json({ error: "End date must be same as or after start date." })
        return;
    }
    const location_raw = req.body.location;
    if (location_raw == null) {
        res.status(400).json({ error: "Required field, location, is missing." });
        return;
    }
    if (typeof location_raw !== "string") {
        res.status(400).json({ error: "Invalid type for location. Must be a string." });
        return;
    }
    if (location_raw.length === 0) {
        res.status(400).json({ error: "Please enter a location for the event." });
        return;
    }
    if (location_raw.length > 1000) {
        res.status(400).json({ error: "Location is too long. Maximum length is 1000." });
        return;
    }
    const location = location_raw;
    const thumbnail_file = req.file;
    if (thumbnail_file == null) {
        res.status(400).json({ error: "Thumbnail missing. Please upload a thumbnail." });
        return;
    }

    const thumbnail_path = thumbnail_file.path.replaceAll('\\', '/');
    const event = new Event({ name, status: EventStatus.Ongoing, start_date: start_date.toDate(), end_date: end_date.toDate(), location, thumbnail_path });
    await event.save();

    res.sendStatus(204);
});

router.get("/list", async (req, res) => {
    const page_raw = req.query["page"];
    let page = 0;
    if (page_raw != null && typeof page_raw === "string") {
        page = parseInt(page_raw);
        if (isNaN(page) || page < 0) {
            page = 0;
        }
    }
    const limit_raw = req.query["limit"];
    let limit = 10;
    if (limit_raw != null && typeof limit_raw === "string") {
        limit = parseInt(limit_raw);
        if (isNaN(limit) || limit < 0) {
            limit = 10;
        }
    }
    const status_raw = req.query["status"];
    if (status_raw != null && typeof status_raw !== "string") {
        res.status(400).json({ error: "Invalid status filter." });
        return;
    }
    let status = null;
    if (status_raw != null) {
        status = parseInt(status_raw, 10);
    }
    if (status != null && isNaN(status)) {
        status = null;
    }
    if (!(status == null || status === EventStatus.Ongoing || status === EventStatus.Completed)) {
        res.status(400).json({ error: "Invalid status filter." });
        return;
    }

    let events_query;
    if (status != null) {
        events_query = Event.find({ status });
    } else {
        events_query = Event.find();
    }
    events_query = events_query.sort("createdAt").skip(page * limit).limit(limit);
    const events = await events_query.exec();
    const event_count_estimate = await Event.estimatedDocumentCount().exec();

    res.json({ total_estimate: event_count_estimate, data: events });
});

router.route("/:id")
    .get(async (req, res) => {
        const event = await Event.findById(req.params.id).exec();
        if (event == null) {
            res.sendStatus(404);
            return;
        }
        res.json(event);
    })
    // TODO: Need to clean up the uploaded file if there's a validation error. Not sure if there's an easy way to do that without a lot of repitition.
    .post(upload_handler.single("thumbnail"), async (req, res) => {
        const event = await Event.findById(req.params.id).exec();
        if (event == null) {
            res.sendStatus(404);
            return;
        }
        const name_raw = req.body.name;
        if (name_raw == null) {
            res.status(400).json({ error: "Required field, name, is missing." });
            return;
        }
        if (typeof name_raw !== "string") {
            res.status(400).json({ error: "Invalid type for name. Must be a string." });
            return;
        }
        if (name_raw.length === 0) {
            res.status(400).json({ error: "Please enter a name for the event." });
            return;
        }
        if (name_raw.length > 200) {
            res.status(400).json({ error: "Name is too long. Maximum length is 200." });
            return;
        }
        const name = name_raw;
        const status_raw = req.body.status;
        if (status_raw == null) {
            res.status(400).json({ error: "Required field, status, is missing." });
            return;
        }
        const status_num = parseInt(status_raw, 10);
        if (isNaN(status_num) || !(status_num === EventStatus.Ongoing || status_num === EventStatus.Completed)) {
            res.status(400).json({ error: "Invalid status." })
            return;
        }
        const status = status_num as EventStatus;
        const start_date_raw = req.body.start_date;
        if (start_date_raw == null) {
            res.status(400).json({ error: "Required field, start_date, is missing." });
            return;
        }
        if (typeof start_date_raw !== "string") {
            res.status(400).json({ error: "Invalid type for start_date. Must be a string." });
            return;
        }
        const start_date = dayjs(start_date_raw);
        if (!start_date.isValid()) {
            res.status(400).json({ error: "Invalid value given for start_date." });
            return;
        }
        const end_date_raw = req.body.end_date;
        if (end_date_raw == null) {
            res.status(400).json({ error: "Required field, end_date, is missing." });
            return;
        }
        if (typeof end_date_raw !== "string") {
            res.status(400).json({ error: "Invalid type for end_date. Must be a string." });
            return;
        }
        const end_date = dayjs(end_date_raw);
        if (!end_date.isValid()) {
            res.status(400).json({ error: "Invalid value given for end_date." });
            return;
        }
        if (end_date.isBefore(start_date)) {
            res.status(400).json({ error: "End date must be same as or after start date." })
            return;
        }
        const location_raw = req.body.location;
        if (location_raw == null) {
            res.status(400).json({ error: "Required field, location, is missing." });
            return;
        }
        if (typeof location_raw !== "string") {
            res.status(400).json({ error: "Invalid type for location. Must be a string." });
            return;
        }
        if (location_raw.length === 0) {
            res.status(400).json({ error: "Please enter a location for the event." });
            return;
        }
        if (location_raw.length > 1000) {
            res.status(400).json({ error: "Location is too long. Maximum length is 1000." });
            return;
        }
        const location = location_raw;
        const thumbnail_file = req.file;
        event.name = name;
        event.status = status;
        event.start_date = start_date.toDate();
        event.end_date = end_date.toDate();
        event.location = location;
        if (thumbnail_file != null) {
            const old_thumbnail_fh = await fs.open(event.thumbnail_path);
            // Check if the received file is the same as the existing thumbnail
            if (thumbnail_file.size === (await old_thumbnail_fh.stat()).size && (await get_file_hash(thumbnail_file.path)).equals(await get_file_hash(old_thumbnail_fh))) {
                await fs.rm(thumbnail_file.path);
                await old_thumbnail_fh.close();
            } else {
                await old_thumbnail_fh.close();
                await fs.rm(event.thumbnail_path);
                event.thumbnail_path = thumbnail_file.path.replaceAll('\\', '/');
            }
        }
        await event.save();

        res.sendStatus(204);
    })
    .delete(async (req: Request, res) => {
        const user_id = req.auth_token_data?.user_id;
        if (user_id == null) {
            res.status(400).json({ error: "Auth token missing user_id." });
            return;
        }
        const user = await User.findById(user_id).exec();
        if (user == null) {
            res.status(500).json({ error: "Could not find user associated with auth token." });
            return;
        }
        const password_raw = req.body.password;
        if (password_raw == null) {
            res.status(400).json({ error: "Required field, password, is missing." });
            return;
        }
        if (typeof password_raw !== "string") {
            res.status(400).json({ error: "Invalid type for password. Must be a string." });
            return;
        }
        const password = password_raw.normalize();
        if (password.length > 255) {
            res.status(400).json({ error: "Password too long. Maximum length is 255 characters." });
            return;
        }
        if (!await verify_password(password, user.password)) {
            res.status(400).json({ error: "Password is incorrect." })
            return;
        }

        const event_deleted = await Event.findByIdAndDelete(req.params.id).exec();
        if (event_deleted == null) {
            res.sendStatus(404);
            return;
        }
        await fs.rm(event_deleted.thumbnail_path);
        res.sendStatus(204);
    });

export default router;
