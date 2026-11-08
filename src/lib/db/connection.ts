import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { initSchema } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, "outterring.db");

const globalForDb = globalThis as unknown as {
  __outterringDb?: DatabaseSync;
};

export function getDatabase(): DatabaseSync {
  if (globalForDb.__outterringDb) {
    return globalForDb.__outterringDb;
  }

  const db = new DatabaseSync(DB_PATH);

  // Mandatory SQLite WAL & concurrency pragmas
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    PRAGMA cache_size = -20000;
    PRAGMA temp_store = MEMORY;
  `);

  initSchema(db);
  globalForDb.__outterringDb = db;
  return db;
}
