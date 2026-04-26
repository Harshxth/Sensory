import { MongoClient, Db } from "mongodb";
import dns from "node:dns";

// Some Windows setups (firewall / AV blocking node.exe's c-ares UDP) fail to
// resolve mongo hostnames. Prepend Cloudflare + Google so DNS still works.
try {
  const existing = dns.getServers();
  dns.setServers(["1.1.1.1", "8.8.8.8", ...existing]);
} catch {
  // setServers can throw if invoked before DNS is ready — non-fatal.
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required (check .env.local)");
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB ?? "sensory");
}

export const COLLECTIONS = {
  venues: "venues",
  reviews: "reviews",
  noise_samples: "noise_samples",
  alerts: "alerts",
  users: "users",
} as const;
