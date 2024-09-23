import express from "express";
import { Buffer } from "node:buffer";
import { User } from "../db/schemas.js";
import { MongoServerError } from "mongodb";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { hash_salt_password, verify_password, type AuthTokenData } from "../middleware/auth.js";

const router = express.Router();
const jwt_sign_key_hex = process.env.JWT_KEY;
if (!jwt_sign_key_hex) {
    console.log("[server]: JWT_KEY missing");
    process.exit(1);
}
const jwt_sign_key = Buffer.from(jwt_sign_key_hex, "hex");

router.post("/register", async (req, res) => {
    const email_raw = req.body.email;
    if (email_raw == null) {
        res.status(400).json({ error: "Required field, email, is missing." });
        return;
    }
    if (typeof email_raw !== "string") {
        res.status(400).json({ error: "Invalid type for email. Must be a string." });
        return;
    }
    const email = email_raw.normalize();
    const email_pattern = /^[^@]+@[a-zA-Z0-9\-\.]+$/;
    if (email.length === 0 || !email_pattern.test(email)) {
        res.status(400).json({ error: "Invalid email. Please check that you have entered your email correctly." });
        return;
    }
    if (email.length > 255) {
        res.status(400).json({ error: "Email too long. Maximum length is 255 characters." });
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
    if (password.length < 8) {
        res.status(400).json({ error: "Password too short. Password must be at least 8 characters." });
        return;
    }
    if (password.length > 255) {
        res.status(400).json({ error: "Password too long. Maximum length is 255 characters." });
        return;
    }

    const new_user = new User({
        email,
        password: hash_salt_password(password)
    });

    try {
        await new_user.save();
    } catch (err) {
        // Duplicate key error
        if (err instanceof MongoServerError && err.code === 11000) {
            res.status(400).json({ error: "Email is already registered." });
            return;
        }
        throw err;
    }
    res.sendStatus(204);
});

router.post("/login", async (req, res) => {
    const email_raw = req.body.email;
    if (email_raw == null) {
        res.status(400).json({ error: "Required field, email, is missing." });
        return;
    }
    if (typeof email_raw !== "string") {
        res.status(400).json({ error: "Invalid type for email. Must be a string." });
        return;
    }
    const email = email_raw.normalize();
    const email_pattern = /^[^@]+@[a-zA-Z0-9\-\.]+$/;
    if (email.length === 0 || email.length > 255 || !email_pattern.test(email)) {
        res.status(400).json({ error: "Invalid email. Please check that you have entered your email correctly." });
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
    if (password.length === 0) {
        res.status(400).json({ error: "No password provided. Please enter a password." });
        return;
    }
    if (password.length > 255) {
        res.status(400).json({ error: "Password too long. Maximum length is 255 characters." });
        return;
    }

    const message_login_failed = "Email is not registered or password is incorrect";
    const user = await User.findOne({ email }).exec();
    if (user == null) {
        res.status(400).json({ error: message_login_failed });
        return;
    }
    if (!await verify_password(password, user.password)) {
        res.status(400).json({ error: message_login_failed });
        return;
    }

    // 24 hours from now
    const token_expiry = Date.now() + 24 * 3600000;
    const token_payload: JWTPayload & AuthTokenData = { user_id: user._id.toString(), roles: ["admin"] };
    const token = await new SignJWT(token_payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(token_expiry)
        .sign(jwt_sign_key);
    res.cookie("auth-token", token, { expires: new Date(token_expiry), sameSite: "strict", httpOnly: true }).sendStatus(204);
});

router.get("/is-auth", async (req, res) => {
    const auth_token = req.cookies["auth-token"];
    if (!auth_token) {
        res.json(false);
        return;
    }
    const jwt = await jwtVerify<JWTPayload & { roles?: string[] }>(auth_token, jwt_sign_key);
    if (!jwt.payload.roles?.includes("admin")) {
        res.json(false);
        return;
    }
    res.json(true);
})

export default router;
