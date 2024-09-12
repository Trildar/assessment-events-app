import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import dayjs from "dayjs";
import { auth_admin } from "../middleware/auth.js";
import { Event } from "../db/schemas.js";
import { customAlphabet } from "nanoid";
import { createHash } from "node:crypto";

const filename_generator = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_-", 18);
const upload_handler = multer({
  storage: multer.diskStorage({
    destination: "store/event/thumb",
    filename: (req, file, callback) => {
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

  const event = new Event({ name, start_date: start_date.toDate(), end_date: end_date.toDate(), location, thumbnail_path: thumbnail_file.path });
  await event.save();

  res.sendStatus(204);
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
        event.thumbnail_path = thumbnail_file.path;
      }
    }
    await event.save();

    res.sendStatus(204);
  })
  .delete(async (req, res) => {
    const event_deleted = await Event.findByIdAndDelete(req.params.id).exec();
    if (event_deleted == null) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  });

router.get("/list", async (req, res) => {
  const page_raw = req.query["page"];
  let page = 0;
  if (page_raw != null && typeof page_raw === "string") {
    page = parseInt(page_raw) - 1;
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

  const events = await Event.find().sort("createdAt").skip(page * limit).limit(limit).exec();
  const event_count_estimate = await Event.estimatedDocumentCount().exec();

  res.json({ total_estimate: event_count_estimate, data: events });
});

export default router;
