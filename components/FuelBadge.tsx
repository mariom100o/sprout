import React from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Colors } from '../lib/theme';

interface Props {
  balance: number;
  size?: 'sm' | 'lg';
}

export function FuelBadge({ balance, size = 'sm' }: Props) {
  const isLg = size === 'lg';
  return (
    <View className="flex-row items-center gap-1 bg-moss/20 px-3 py-1.5 rounded-full">
      <Zap size={isLg ? 20 : 14} color={Colors.moss} fill={Colors.moss} />
      <Text
        style={{ fontFamily: 'System', color: Colors.moss, fontWeight: '700', fontSize: isLg ? 18 : 13 }}
      >
        {balance.toLocaleString()}
      </Text>
    </View>
  );
}
