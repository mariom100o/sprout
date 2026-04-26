import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useSproutStore } from '../store';

export default function Root() {
  const permissionsGranted = useSproutStore((s) => s.permissionsGranted);
  return <Redirect href={permissionsGranted ? '/(kid)/home' : '/onboarding'} />;
}
