import { Request, Response, NextFunction } from "express";
import { JWTPayload, jwtVerify } from "jose";

const jwt_sign_key_hex = process.env.JWT_KEY;
if (!jwt_sign_key_hex) {
  console.log("[server]: JWT_KEY missing");
  process.exit(1);
}
const jwt_sign_key = Buffer.from(jwt_sign_key_hex, "hex");

export async function auth_admin(req: Request, res: Response, next: NextFunction) {
  const auth_token = req.cookies["auth-token"];
  if (!auth_token) {
    res.sendStatus(403);
    return;
  }
  const jwt = await jwtVerify<JWTPayload & { roles?: string[] }>(auth_token, jwt_sign_key);
  if (!jwt.payload.roles?.includes("admin")) {
    res.sendStatus(403);
    return;
  }
  next();
}
