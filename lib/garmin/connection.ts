// Server-only: reads/writes DeviceConnectionGarmin with encrypted tokens.
import type { DeviceConnectionGarmin } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { decryptToken, encryptToken } from "./crypto"
import { ACCESS_TOKEN_REFRESH_MARGIN_MS, refreshTokens, type TokenSet } from "./client"

/** Columns to write for a fresh token set (tokens encrypted). */
export function encryptedTokenFields(tokens: TokenSet) {
  return {
    accessToken: encryptToken(tokens.accessToken),
    refreshToken: encryptToken(tokens.refreshToken),
    tokenExpiresAt: tokens.tokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    scope: tokens.scope,
  }
}

/**
 * Returns a usable access token, refreshing (and persisting the rotated
 * refresh token) when it expires within the safety margin.
 * Throws GarminApiError if the refresh token is no longer valid.
 */
export async function getValidAccessToken(conn: DeviceConnectionGarmin): Promise<string> {
  if (conn.tokenExpiresAt.getTime() - Date.now() > ACCESS_TOKEN_REFRESH_MARGIN_MS) {
    return decryptToken(conn.accessToken)
  }
  const tokens = await refreshTokens(decryptToken(conn.refreshToken))
  await prisma.deviceConnectionGarmin.update({
    where: { id: conn.id },
    data: encryptedTokenFields(tokens),
  })
  return tokens.accessToken
}
