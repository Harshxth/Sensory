import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "sensory";

if (!uri && process.env.NODE_ENV !== "test") {
  console.warn("[mongodb] MONGODB_URI not set — Mongo calls will fail at runtime");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is required");
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
  return client.db(dbName);
}

export const COLLECTIONS = {
  venues: "venues",
  reviews: "reviews",
  noise_samples: "noise_samples",
  alerts: "alerts",
  users: "users",
} as const;
