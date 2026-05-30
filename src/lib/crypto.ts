import crypto from "node:crypto";

/**
 * AES-256-GCM encryption for WakaTime API keys. Server-only.
 * Output format: `${ivBase64}.${dataBase64}` where `data` is the ciphertext
 * with the 16-byte auth tag appended (Web Crypto convention) so the Deno edge
 * function can decrypt with `crypto.subtle.decrypt`.
 */

function getKey(): Buffer {
  const b64 = process.env.WAKATIME_ENC_KEY;
  if (!b64) throw new Error("WAKATIME_ENC_KEY is not configured");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("WAKATIME_ENC_KEY must decode to 32 bytes (base64)");
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const data = Buffer.concat([ct, tag]);
  return `${iv.toString("base64")}.${data.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const key = getKey();
  const [ivB64, dataB64] = payload.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const tag = data.subarray(data.length - 16);
  const ct = data.subarray(0, data.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** "····a1b2" preview from the last 4 chars (never store more). */
export function keyPreview(key: string): string {
  const tail = key.slice(-4);
  return `····${tail}`;
}
