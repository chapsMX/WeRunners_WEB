// Short public codes for share links (/r/<code>). 8 characters from [0-9A-Za-z]
// = 62^8 ≈ 2.2·10^14 combinations: short to share, not guessable.
import { randomBytes } from "node:crypto"

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
export const SHORT_ID_LENGTH = 8
export const SHORT_ID_RE = /^[0-9A-Za-z]{8}$/

export function newShortId(length = SHORT_ID_LENGTH): string {
  let out = ""
  while (out.length < length) {
    // Rejection sampling: 248 = 62·4, so every character is equally likely.
    for (const b of randomBytes(length * 2)) {
      if (b < 248 && out.length < length) out += ALPHABET[b % 62]
    }
  }
  return out
}
