import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configure } from '../lib/purchases';
import { useTheme } from '../lib/useTheme';

export default function RootLayout() {
  const { tokens, scheme } = useTheme();

  useEffect(() => {
    configure();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.bg },
          headerTintColor: tokens.ink,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: tokens.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'API Inspector' }} />
        <Stack.Screen name="module/[id]" options={{ title: 'Module' }} />
        <Stack.Screen name="plan/[id]" options={{ title: 'Study plan' }} />
        <Stack.Screen name="session" options={{ title: 'Session' }} />
        <Stack.Screen name="results" options={{ title: 'Results', headerBackVisible: false }} />
        <Stack.Screen name="review" options={{ title: 'Review' }} />
        <Stack.Screen name="free-complete" options={{ title: 'Sample complete' }} />
        <Stack.Screen name="bookmarks" options={{ title: 'Bookmarks' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
