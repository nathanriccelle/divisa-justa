import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
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

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* O Expo Router encontra automaticamente o index.tsx e o create-event.tsx! */}
      </Stack>
    </ThemeProvider>
  );
}
