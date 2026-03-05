import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { theme } from "../src/theme";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.bgScreen,
    card: theme.colors.bgCard,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.negative,
  },
};

async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    -- Liga as chaves estrangeiras (A Regra da Cascata!)
    PRAGMA foreign_keys = ON;
    
    -- Deixa o banco de dados mais rápido (Write-Ahead Logging)
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
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (payer_id) REFERENCES participants(id) ON DELETE CASCADE
    );
  `);
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="divisajusta.db" onInit={initializeDatabase}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* O Expo Router encontra automaticamente as telas! */}
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
