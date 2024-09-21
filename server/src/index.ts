import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import routes_admin from "./routes/admin.js";
import routes_event from "./routes/event.js";
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/store", express.static("store"));
app.use("/admin", routes_admin);
app.use("/event", routes_event);

try {
    await mongoose.connect("mongodb://127.0.0.1:27017/events-app");
} catch {
    console.log("[server]: Could not connect to MongoDB database. Shutting down.");
    process.exit(1);
}

app.listen(port, () => {
    console.log(`[server]: Server is listening on http://localhost:${port}`);
});
