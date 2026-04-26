import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../lib/theme';
import { useSproutStore } from '../store';
import { SproutBlocker } from '../modules/sprout-blocker';

function FuelCacheSync() {
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const sessionEndsAt = useSproutStore((s) => s.sessionEndsAt);
  const sessionPausedAt = useSproutStore((s) => s.sessionPausedAt);

  useEffect(() => {
    const effectiveEndsAt = sessionPausedAt ? 0 : (sessionEndsAt ?? 0);
    SproutBlocker.updateFuelCache(fuelBalance, effectiveEndsAt).catch(() => {});
  }, [fuelBalance, sessionEndsAt, sessionPausedAt]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.paper } as object}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.paper} />
        <FuelCacheSync />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.paper },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(kid)" />
          <Stack.Screen name="(parent)" />
          <Stack.Screen name="overlay" options={{ animation: 'fade', presentation: 'transparentModal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
