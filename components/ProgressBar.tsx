import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '../lib/theme';

interface Props {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ current, total, label, color = Colors.moss }: Props) {
  const pct = Math.min(current / total, 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(pct, { damping: 20, stiffness: 90 });
  }, [pct]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as unknown as number,
  }));

  return (
    <View className="gap-1">
      {label && (
        <View className="flex-row justify-between">
          <Text style={{ color: Colors.muted, fontSize: 11 }}>{label}</Text>
          <Text style={{ color: Colors.moss, fontSize: 11, fontWeight: '700' }}>
            {current.toLocaleString()} / {total.toLocaleString()}
          </Text>
        </View>
      )}
      <View className="h-3 bg-paper rounded-full overflow-hidden" style={{ borderWidth: 1, borderColor: Colors.mossLt + '40' }}>
        <Animated.View
          style={[{ height: '100%', borderRadius: 99, backgroundColor: color }, animStyle]}
        />
      </View>
    </View>
  );
}
