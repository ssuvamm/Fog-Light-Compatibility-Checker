import type { Bike, ToolState } from "./types";

const DB_NAME = "fog-light-tool";
const DB_VERSION = 1;
const KV_STORE = "kv";

const TOOL_STATE_KEY = "tool-state";
const VISITOR_ID_KEY = "visitor-id";
const BIKE_CACHE_KEY = "bike-cache";

export const BIKE_CACHE_MAX_AGE_MS = 1 * 24 * 60 * 60 * 1000;
export const BIKE_CACHE_SCHEMA_VERSION = 2;

type StoredToolState = Omit<ToolState, "make" | "model" | "year">;

type BikeCache = {
  version: number;
  fetchedAt: number;
  bikes: Bike[];
};

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function getValue<T>(key: string) {
  if (!hasIndexedDb()) return null;
  const db = await openDb();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, "readonly");
    const store = tx.objectStore(KV_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to read from IndexedDB."));
    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function setValue<T>(key: string, value: T) {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, "readwrite");
    const store = tx.objectStore(KV_STORE);
    store.put(value, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to write to IndexedDB."));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to write to IndexedDB."));
    };
  });
}

async function deleteValue(key: string) {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, "readwrite");
    const store = tx.objectStore(KV_STORE);
    store.delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to delete from IndexedDB."));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to delete from IndexedDB."));
    };
  });
}

export async function readStoredToolState() {
  return getValue<StoredToolState>(TOOL_STATE_KEY);
}

export async function writeStoredToolState(state: StoredToolState) {
  await setValue(TOOL_STATE_KEY, state);
}

export async function clearStoredToolState() {
  await deleteValue(TOOL_STATE_KEY);
}

export async function readStoredVisitorId() {
  return getValue<string>(VISITOR_ID_KEY);
}

export async function writeStoredVisitorId(visitorId: string) {
  await setValue(VISITOR_ID_KEY, visitorId);
}

export async function readBikeCache() {
  return getValue<BikeCache>(BIKE_CACHE_KEY);
}

export async function writeBikeCache(cache: BikeCache) {
  await setValue(BIKE_CACHE_KEY, cache);
}
