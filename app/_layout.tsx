import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LifeDataProvider } from "../src/context/LifeDataContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LifeDataProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LifeDataProvider>
    </SafeAreaProvider>
  );
}
