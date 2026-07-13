import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'trainer.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('long','short')),
  qty REAL NOT NULL,
  entry REAL NOT NULL,
  notional REAL NOT NULL,
  stop_loss REAL,
  take_profit REAL,
  reason TEXT NOT NULL,
  opened_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  qty REAL NOT NULL,
  entry REAL NOT NULL,
  exit_price REAL NOT NULL,
  notional REAL NOT NULL,
  stop_loss REAL,
  take_profit REAL,
  reason TEXT NOT NULL,
  opened_at INTEGER NOT NULL,
  closed_at INTEGER NOT NULL,
  pnl REAL NOT NULL,
  close_reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  price REAL NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('up','down','neutral')),
  confidence INTEGER NOT NULL,
  bull_args TEXT NOT NULL,
  bear_args TEXT NOT NULL,
  uncertainty TEXT NOT NULL,
  horizon_min INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  evaluated_at INTEGER,
  eval_price REAL,
  change_pct REAL,
  correct INTEGER
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id TEXT PRIMARY KEY,
  completed_at INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL
);
`);

export const START_CAPITAL = 10000;

const getMeta = db.prepare('SELECT value FROM meta WHERE key = ?');
const setMeta = db.prepare(
  'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);

if (!getMeta.get('cash')) {
  setMeta.run('cash', String(START_CAPITAL));
}

export function getCash(): number {
  const row = getMeta.get('cash') as { value: string } | undefined;
  return row ? Number(row.value) : START_CAPITAL;
}

export function setCash(v: number) {
  setMeta.run('cash', String(v));
}

export function resetAccount() {
  db.exec('DELETE FROM positions; DELETE FROM trades;');
  setCash(START_CAPITAL);
}
