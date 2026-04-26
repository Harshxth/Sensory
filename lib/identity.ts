import type { NextRequest } from "next/server";

const STORAGE_KEY = "sensory:client_id";
const HEADER = "x-sensory-client-id";

export { HEADER as CLIENT_ID_HEADER };

// Browser-side: returns a stable per-device anonymous identifier, generating
// and persisting one in localStorage on first call. Used until real Supabase
// auth lands; at that point the route handlers can prefer the verified user
// id and fall back to this for unauthenticated sessions.
export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

// Server-side: pulls the client id from the request header. Throws when the
// header is missing so callers can return 401 — keeps the contract honest
// rather than silently falling through to an "anonymous" bucket.
export function requireClientId(req: NextRequest | Request): string {
  const id = req.headers.get(HEADER);
  if (!id || id.length < 8) {
    throw new ClientIdMissingError();
  }
  return id;
}

export class ClientIdMissingError extends Error {
  constructor() {
    super("client id header missing");
    this.name = "ClientIdMissingError";
  }
}
