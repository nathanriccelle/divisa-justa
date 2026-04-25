import { UserProvider } from "@/src/contexts/UserContext";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { theme } from "../src/theme";

// Inicializa a configuração de internacionalização (i18n)
import "../src/locales";

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

export default function RootLayout() {
  return (
    // 👇 O Provider só segura o banco aberto, sem tentar inicializar tabelas nele
    <SQLiteProvider databaseName="divisajusta_v3.db">
      <UserProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }}></Stack>
        </ThemeProvider>
      </UserProvider>
    </SQLiteProvider>
  );
}
