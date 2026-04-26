import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { BookOpen, Zap, ShoppingBag, Trophy, BarChart2 } from 'lucide-react-native';
import { useSproutStore } from '../../store';
import { SproutHeader } from '../../components/SproutHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { Colors } from '../../lib/theme';

function AnimatedFuelNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const diff = value - prev.current;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayed(Math.round(prev.current + (diff * step) / steps));
      if (step >= steps) {
        setDisplayed(value);
        prev.current = value;
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <MotiText
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 120 }}
      style={{ fontFamily: 'Georgia', fontSize: 72, fontWeight: '700', color: Colors.moss, letterSpacing: -2 }}
    >
      {displayed.toLocaleString()}
    </MotiText>
  );
}

function GrandPrizeCard() {
  const goal = useSproutStore((s) => s.prizeGoals[0]);
  if (!goal) return null;
  const pct = Math.round((goal.current / goal.cost) * 100);
  const remaining = goal.cost - goal.current;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 200 }}
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: Colors.mossDk }}
    >
      <View className="p-5">
        <View className="flex-row items-center gap-2 mb-3">
          <Trophy size={18} color={Colors.earthLt} />
          <Text style={{ color: Colors.earthLt, fontFamily: 'Georgia', fontSize: 14, fontWeight: '700' }}>
            Grand Prize Goal
          </Text>
        </View>
        <View className="flex-row items-center gap-3 mb-4">
          <Text style={{ fontSize: 44 }}>{goal.emoji}</Text>
          <View className="flex-1">
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{goal.name}</Text>
            <Text style={{ color: Colors.mossLt, fontSize: 13, marginTop: 2 }}>
              {remaining.toLocaleString()} ⚡ to go · {pct}% there!
            </Text>
          </View>
        </View>
        <ProgressBar current={goal.current} total={goal.cost} color={Colors.mossLt} />
      </View>
    </MotiView>
  );
}

function GoalCard({ goalId, size = 'large' }: { goalId: string; size?: 'large' | 'small' }) {
  const goal = useSproutStore((s) => s.prizeGoals.find((g) => g.id === goalId));
  if (!goal) return null;
  const isLarge = size === 'large';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300 }}
      className="rounded-2xl p-4"
      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '30' }}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Text style={{ fontSize: isLarge ? 28 : 22 }}>{goal.emoji}</Text>
        <View className="flex-1">
          <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: isLarge ? 15 : 13 }}>{goal.name}</Text>
          <Text style={{ color: Colors.muted, fontSize: 11 }}>
            {(goal.cost - goal.current).toLocaleString()} fuel to go
          </Text>
        </View>
      </View>
      <ProgressBar current={goal.current} total={goal.cost} />
    </MotiView>
  );
}

export default function KidHome() {
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const prizeGoals = useSproutStore((s) => s.prizeGoals);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      <SproutHeader
        right={
          <TouchableOpacity onPress={() => router.push('/(parent)/dashboard')} className="p-1">
            <BarChart2 size={22} color={Colors.muted} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
      >
        {/* Fuel balance */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 50 }}
          className="items-center pt-2 pb-6"
        >
          <View className="flex-row items-center gap-2 mb-1">
            <Zap size={16} color={Colors.muted} />
            <Text style={{ color: Colors.muted, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Your Fuel
            </Text>
          </View>
          <AnimatedFuelNumber value={fuelBalance} />
          <Text style={{ color: Colors.muted, fontSize: 14, marginTop: 4 }}>
            Keep reading to earn more!
          </Text>
        </MotiView>

        {/* Grand Prize */}
        <GrandPrizeCard />

        {/* Other goals */}
        {prizeGoals.slice(1).length > 0 && (
          <View className="mx-5 mb-6">
            <Text style={{ color: Colors.muted, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600' }}>
              Other Goals
            </Text>
            <View className="gap-3">
              {prizeGoals.slice(1).map((g) => (
                <GoalCard key={g.id} goalId={g.id} size="small" />
              ))}
            </View>
          </View>
        )}

        {/* CTAs */}
        <View className="mx-5 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 rounded-2xl p-4 items-center gap-2"
            style={{ backgroundColor: Colors.moss }}
            activeOpacity={0.85}
            onPress={() => router.push('/(kid)/earn')}
          >
            <BookOpen size={26} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Earn Fuel</Text>
            <Text style={{ color: Colors.mossLt, fontSize: 11 }}>+20 per mission</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-2xl p-4 items-center gap-2"
            style={{ backgroundColor: Colors.earth }}
            activeOpacity={0.85}
            onPress={() => router.push('/(kid)/spend')}
          >
            <ShoppingBag size={26} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Spend Fuel</Text>
            <Text style={{ color: Colors.earthLt, fontSize: 11 }}>YouTube time</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
