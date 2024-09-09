import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import routes_admin from "./routes/admin.js";
import routes_event from "./routes/event.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
