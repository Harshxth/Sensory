import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Field-level AES-256-GCM for biometric voice_id (master plan §15 #2).
const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex) throw new Error("FIELD_ENCRYPTION_KEY is required");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("FIELD_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return key;
}

export function encryptField(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptField(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(":");
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

// Anonymous contributor ID per master plan §15 #4.
export function anonContributorId(userId: string, venueId: string, salt: string): string {
  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(`${userId}|${venueId}|${salt}`).digest("hex");
}
