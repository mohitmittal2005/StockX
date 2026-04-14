import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDefaultUserState } from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../data/db.json");

const db = {
  users: {},
  sessions: {}
};

export async function initStore() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    db.users = parsed.users || {};
    db.sessions = parsed.sessions || {};
  } catch {
    await persist();
  }
}

async function persist() {
  const folder = path.dirname(DB_PATH);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function createSession(email) {
  const token = `stkx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  db.sessions[token] = email;
  return token;
}

export function resolveUserByToken(token) {
  if (!token) return null;
  const email = db.sessions[token];
  if (!email) return null;
  if (!db.users[email]) db.users[email] = getDefaultUserState();
  return { email, state: db.users[email] };
}

export async function upsertUserState(email, updater) {
  const prev = db.users[email] || getDefaultUserState();
  db.users[email] = updater(prev);
  await persist();
  return db.users[email];
}
