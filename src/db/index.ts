import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

// Mudamos para _v3 só para garantir um arquivo zerado e limpo dessa vez!
const expoDb = SQLite.openDatabaseSync("divisajusta_v3.db");

// 👇 ISSO AQUI RESOLVE A CORRIDA!
// O execSync trava o app rapidinho, constrói as tabelas, e só depois libera o código.
expoDb.execSync(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    currency_symbol TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY NOT NULL,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    is_owner INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    event_id TEXT NOT NULL,
    payer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    date INTEGER NOT NULL,
    split_with_ids TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  );
`);

// Só exporta o banco DEPOIS que as tabelas já existem!
export const db = drizzle(expoDb);
