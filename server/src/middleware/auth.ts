import type { Request, Response, NextFunction } from "express";
import { JWTPayload, jwtVerify } from "jose";
import { randomBytes, scrypt, ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

export interface AuthTokenData {
    user_id: string,
    roles: string[]
}

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

export async function hash_salt_password(password_input: string): Promise<Buffer> {
    const salt = await promisify(randomBytes)(SALT_LENGTH);
    // promisify has issues with type checking for scrypt due to using the options argument
    const password_hashed = await new Promise<Buffer>((resolve, reject) => {
        scrypt(password_input, salt, 64, SCRYPT_OPTIONS, (err, derivedKey) => {
            if (err != null) {
                reject(err);
            }
            resolve(derivedKey);
        });
    });

    return Buffer.concat([salt, password_hashed]);
}

export async function verify_password(password_input: string, password_salt_stored: Buffer): Promise<boolean> {
    const salt = password_salt_stored.subarray(0, SALT_LENGTH);
    const password_stored = password_salt_stored.subarray(SALT_LENGTH);
    // promisify has issues with type checking for scrypt due to using the options argument
    const password_hashed = await new Promise<Buffer>((resolve, reject) => {
        scrypt(password_input, salt, 64, SCRYPT_OPTIONS, (err, derivedKey) => {
            if (err != null) {
                reject(err);
            }
            resolve(derivedKey);
        });
    });
    return Buffer.compare(password_stored, password_hashed) === 0;
}

export async function auth_admin(req: Request, res: Response, next: NextFunction) {
    const auth_token = req.cookies["auth-token"];
    if (!auth_token) {
        res.sendStatus(403);
        return;
    }
    const jwt = await jwtVerify<JWTPayload & AuthTokenData>(auth_token, jwt_sign_key);
    if (!jwt.payload.roles?.includes("admin")) {
        res.sendStatus(403);
        return;
    }
    req.auth_token_data = jwt.payload;
    next();
}
