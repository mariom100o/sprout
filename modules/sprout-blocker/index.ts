import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { SproutBlocker: NativeSproutBlocker } = NativeModules;

const stub = {
  requestAccessibilityPermission: async () => {},
  requestOverlayPermission: async () => {},
  isAccessibilityEnabled: async () => false,
  startBlocking: async (_packageNames: string[], _sessionEndsAt: number) => {},
  stopBlocking: async () => {},
  dismissOverlay: async () => {},
  dismissOverlayAndOpenApp: async (_deepLink: string) => {},
  dismissOverlayAndGoHome: async () => {},
  updateFuelCache: async (_fuelBalance: number, _sessionEndsAt: number) => {},
};

type SproutBlockerType = typeof stub;

const resolved: SproutBlockerType =
  Platform.OS === 'android' && NativeSproutBlocker
    ? NativeSproutBlocker
    : stub;

export const SproutBlockerEmitter =
  Platform.OS === 'android' && NativeSproutBlocker
    ? new NativeEventEmitter(NativeSproutBlocker)
    : { addListener: () => ({ remove: () => {} }) };

export default resolved;
export const SproutBlocker = resolved;
