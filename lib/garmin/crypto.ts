// Server-only (node:crypto): never import from a client component.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

// AES-256-GCM for Garmin OAuth tokens at rest.
// Format: "v1:" + base64(iv[12] | authTag[16] | ciphertext)
// The key (GARMIN_TOKEN_ENCRYPTION_KEY, base64 of 32 bytes) must be the same
// for every environment that shares a database.

const VERSION = "v1"
const IV_BYTES = 12
const TAG_BYTES = 16

function getKey(): Buffer {
  const raw = process.env.GARMIN_TOKEN_ENCRYPTION_KEY
  if (!raw) throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY is not set")
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY must be base64 of exactly 32 bytes")
  }
  return key
}

export function encryptToken(plain: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${VERSION}:${Buffer.concat([iv, tag, ciphertext]).toString("base64")}`
}

export function decryptToken(stored: string): string {
  const [version, payload] = stored.split(":", 2)
  if (version !== VERSION || !payload) throw new Error("Unknown token format")
  const buf = Buffer.from(payload, "base64")
  const iv = buf.subarray(0, IV_BYTES)
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES)
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}
