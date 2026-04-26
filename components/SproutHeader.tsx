import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sprout } from 'lucide-react-native';
import { Colors } from '../lib/theme';
import { FuelBadge } from './FuelBadge';
import { useSproutStore } from '../store';

interface Props {
  showFuel?: boolean;
  right?: React.ReactNode;
}

export function SproutHeader({ showFuel = true, right }: Props) {
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center gap-2">
        <Sprout size={26} color={Colors.moss} />
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: Colors.ink, letterSpacing: -0.5 }}>
          Sprout.
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        {showFuel && <FuelBadge balance={fuelBalance} />}
        {right}
      </View>
    </View>
  );
}
