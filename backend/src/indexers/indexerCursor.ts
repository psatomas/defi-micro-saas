import fs from "fs";
import path from "path";

const CURSOR_FILE = path.resolve("indexer-cursor.json");

export type Cursor = {
  lastIndexedBlock: number;
};

export function loadCursor(): Cursor {
  if (!fs.existsSync(CURSOR_FILE)) {
    return { lastIndexedBlock: 0 };
  }

  const raw = fs.readFileSync(CURSOR_FILE, "utf-8");
  return JSON.parse(raw);
}

export function saveCursor(cursor: Cursor) {
  fs.writeFileSync(CURSOR_FILE, JSON.stringify(cursor, null, 2));
}