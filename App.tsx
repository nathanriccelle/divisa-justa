import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context"; // <-- Importação nova
import HomeScreen from "./app/screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
