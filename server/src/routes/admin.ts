import express from "express";
import { randomBytes, scrypt, ScryptOptions } from "node:crypto";
import { promisify } from "node:util";
import { Buffer } from "node:buffer";
import { User } from "../db/schemas.js";
import { MongoServerError } from "mongodb";
import { SignJWT } from "jose";

const router = express.Router();
const SALT_LENGTH = 16;
// Cost of 2**17 as per OWASP recommendation
const SCRYPT_OPTIONS: ScryptOptions = {
  cost: 1 << 17,
  maxmem: 128 * (2 + 1 << 17) * 8 // 128 * (2 + cost) * blockSize
};
const jwt_sign_key_hex = process.env.JWT_KEY;
if (!jwt_sign_key_hex) {
  console.log("[server]: JWT_KEY missing");
  process.exit(1);
}
const jwt_sign_key = Buffer.from(jwt_sign_key_hex, "hex");

router.post("/register", async (req, res) => {
  const email_pattern = /^[^@]+@[a-zA-Z0-9\-\.]+$/;
  const email = req.body.email?.normalize();
  if (email == null || email.length === 0 || !email_pattern.test(email)) {
    res.status(400).json({ error: "Invalid email. Please check that you have entered your email correctly." });
    return;
  }
  if (email.length > 255) {
    res.status(400).json({ error: "Email too long. Maximum length is 255 characters." });
    return;
  }
  const password = req.body.password?.normalize();
  if (password == null || password.length < 8) {
    res.status(400).json({ error: "Password missing or too short. Password must be at least 8 characters." });
    return;
  }
  if (password.length > 255) {
    res.status(400).json({ error: "Password too long. Maximum length is 255 characters." });
    return;
  }

  const salt = await promisify(randomBytes)(SALT_LENGTH);
  // promisify has issues with type checking for scrypt due to using the options argument
  const password_hashed = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err != null) {
        reject(err);
      }
      resolve(derivedKey);
    });
  });
  const new_user = new User({
    email,
    password: Buffer.concat([salt, password_hashed])
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
  const email_pattern = /^[^@]+@[a-zA-Z0-9\-\.]+$/;
  const email = req.body.email?.normalize();
  if (email == null || email.length === 0 || email.length > 255 || !email_pattern.test(email)) {
    res.status(400).json({ error: "Invalid email. Please check that you have entered your email correctly." });
    return;
  }
  const password = req.body.password?.normalize();
  if (password == null || password.length === 0) {
    res.status(400).json({ error: "No password provided. Please enter a password." });
    return;
  }

  const message_login_failed = "Email is not registered or password is incorrect";
  const user = await User.findOne({ email }).exec();
  if (user == null) {
    res.status(400).json({ error: message_login_failed });
    return;
  }
  const salt = user.password.subarray(0, SALT_LENGTH);
  const password_stored = user.password.subarray(SALT_LENGTH);
  // promisify has issues with type checking for scrypt due to using the options argument
  const password_hashed = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err != null) {
        reject(err);
      }
      resolve(derivedKey);
    });
  });
  if (Buffer.compare(password_hashed, password_stored) !== 0) {
    res.status(400).json({ error: message_login_failed });
    return;
  }

  // 24 hours from now
  const token_expiry = Date.now() + 24 * 3600000;
  const token = await new SignJWT({ roles: ["admin"] })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(token_expiry)
    .sign(jwt_sign_key);
  res.cookie("auth-token", token, { expires: new Date(token_expiry), sameSite: "strict", httpOnly: true }).send();
});

export default router;
