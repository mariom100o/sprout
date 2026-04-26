import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../lib/theme';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.paper } }} />
  );
}
