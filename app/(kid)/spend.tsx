import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  AppState,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { ChevronLeft, Tv, Zap, Clock, Lock, FlaskConical, Pause, Play } from 'lucide-react-native';
import { useSproutStore } from '../../store';
import { SproutHeader } from '../../components/SproutHeader';
import { Colors } from '../../lib/theme';
import { SproutBlocker } from '../../modules/sprout-blocker';

interface SessionOption {
  id: string;
  label: string;
  durationMs: number;
  cost: number;
  emoji: string;
  isDemo?: boolean;
}

function useSessionOptions(): SessionOption[] {
  const cost15 = useSproutStore((s) => s.settings.cost15min);
  const cost30 = useSproutStore((s) => s.settings.cost30min);
  return [
    { id: 'demo', label: '15 seconds (Demo)', durationMs: 15 * 1000, cost: 0, emoji: '🧪', isDemo: true },
    { id: '15min', label: '15 minutes', durationMs: 15 * 60 * 1000, cost: cost15, emoji: '⚡' },
    { id: '30min', label: '30 minutes', durationMs: 30 * 60 * 1000, cost: cost30, emoji: '🔥' },
  ];
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const totalSec = Math.ceil(ms / 1000);
  if (totalSec < 60) return `${totalSec}s left`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return secs > 0 ? `${mins}m ${secs}s left` : `${mins}m left`;
}

function SessionCountdownBanner() {
  const sessionEndsAt = useSproutStore((s) => s.sessionEndsAt);
  const sessionPausedAt = useSproutStore((s) => s.sessionPausedAt);
  const pauseSession = useSproutStore((s) => s.pauseSession);
  const resumeSession = useSproutStore((s) => s.resumeSession);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!sessionEndsAt) { setRemaining(0); return; }
    if (sessionPausedAt) {
      setRemaining(Math.max(0, sessionEndsAt - sessionPausedAt));
      return;
    }
    const tick = () => setRemaining(Math.max(0, sessionEndsAt - Date.now()));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [sessionEndsAt, sessionPausedAt]);

  if (remaining <= 0 && !sessionPausedAt) return null;

  const isPaused = !!sessionPausedAt;
  const isLow = remaining < 60 * 1000 && !isPaused;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="rounded-2xl p-4 mb-5 flex-row items-center gap-3"
      style={{
        backgroundColor: isPaused ? Colors.muted + '15' : isLow ? Colors.earth + '20' : Colors.moss + '15',
        borderWidth: 1.5,
        borderColor: isPaused ? Colors.muted + '40' : isLow ? Colors.earth + '60' : Colors.moss + '40',
      }}
    >
      <Clock size={20} color={isPaused ? Colors.muted : isLow ? Colors.earth : Colors.moss} />
      <View className="flex-1">
        <Text style={{ color: isPaused ? Colors.muted : isLow ? Colors.bark : Colors.mossDk, fontWeight: '700', fontSize: 15 }}>
          {isPaused ? 'Session paused' : 'Session active'}
        </Text>
        <Text style={{ color: isPaused ? Colors.muted : isLow ? Colors.earth : Colors.moss, fontWeight: '700', fontSize: 18 }}>
          {formatRemaining(remaining)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={isPaused ? resumeSession : pauseSession}
        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isPaused ? Colors.moss + '20' : Colors.muted + '20', alignItems: 'center', justifyContent: 'center' }}
      >
        {isPaused
          ? <Play size={18} color={Colors.moss} fill={Colors.moss} />
          : <Pause size={18} color={Colors.muted} />
        }
      </TouchableOpacity>
      {isLow && <Text style={{ fontSize: 22 }}>⚠️</Text>}
    </MotiView>
  );
}

function SessionCard({
  option,
  fuelBalance,
  onUnlock,
}: {
  option: SessionOption;
  fuelBalance: number;
  onUnlock: (o: SessionOption) => void;
}) {
  const canAfford = option.isDemo || fuelBalance >= option.cost;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: option.id === 'demo' ? 50 : option.id === '15min' ? 150 : 250 }}
      className="rounded-3xl overflow-hidden mb-4"
      style={{
        borderWidth: 2,
        borderColor: option.isDemo
          ? Colors.muted + '40'
          : canAfford ? Colors.moss + '50' : Colors.muted + '30',
      }}
    >
      <View className="p-5" style={{ backgroundColor: option.isDemo ? '#F9F9F6' : canAfford ? '#fff' : '#F9F9F6' }}>
        {option.isDemo && (
          <View className="flex-row items-center gap-1 mb-3 self-start px-2 py-1 rounded-full" style={{ backgroundColor: Colors.muted + '20' }}>
            <FlaskConical size={11} color={Colors.muted} />
            <Text style={{ color: Colors.muted, fontSize: 11, fontWeight: '600' }}>Demo only</Text>
          </View>
        )}
        <View className="flex-row items-center gap-4 mb-4">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: option.isDemo ? Colors.muted + '15' : canAfford ? Colors.earth + '20' : Colors.muted + '15' }}
          >
            <Text style={{ fontSize: 30 }}>{option.emoji}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Tv size={18} color={option.isDemo ? Colors.muted : canAfford ? '#FF0000' : Colors.muted} />
              <Text style={{ color: option.isDemo ? Colors.muted : canAfford ? Colors.ink : Colors.muted, fontWeight: '700', fontSize: 18 }}>
                YouTube
              </Text>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Clock size={13} color={Colors.muted} />
              <Text style={{ color: Colors.muted, fontSize: 14 }}>{option.label}</Text>
            </View>
          </View>
          <View
            className="px-4 py-2 rounded-full flex-row items-center gap-1"
            style={{ backgroundColor: option.isDemo ? Colors.muted + '15' : canAfford ? Colors.moss + '15' : Colors.muted + '15' }}
          >
            {option.isDemo ? (
              <Text style={{ color: Colors.muted, fontWeight: '700', fontSize: 13 }}>FREE</Text>
            ) : (
              <>
                <Zap size={14} color={canAfford ? Colors.moss : Colors.muted} fill={canAfford ? Colors.moss : Colors.muted} />
                <Text style={{ color: canAfford ? Colors.moss : Colors.muted, fontWeight: '700', fontSize: 15 }}>
                  {option.cost}
                </Text>
              </>
            )}
          </View>
        </View>

        {!option.isDemo && !canAfford && (
          <View className="flex-row items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ backgroundColor: Colors.earthLt + '30' }}>
            <Lock size={13} color={Colors.bark} />
            <Text style={{ color: Colors.bark, fontSize: 13 }}>
              Need {option.cost - fuelBalance} more fuel
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => onUnlock(option)}
          className="rounded-2xl p-4 items-center"
          style={{
            backgroundColor: option.isDemo
              ? Colors.muted + '30'
              : canAfford ? Colors.moss : Colors.muted + '40',
          }}
          activeOpacity={0.85}
        >
          <Text style={{
            color: option.isDemo ? Colors.muted : canAfford ? '#fff' : Colors.muted,
            fontWeight: '700',
            fontSize: 15,
          }}>
            {option.isDemo ? 'Try 15-second demo' : canAfford ? `Unlock ${option.label}` : 'Not enough fuel'}
          </Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

export default function SpendScreen() {
  const sessionOptions = useSessionOptions();
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const sessionEndsAt = useSproutStore((s) => s.sessionEndsAt);
  const spendFuel = useSproutStore((s) => s.spendFuel);
  const grantSession = useSproutStore((s) => s.grantSession);
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState<string | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        setUnlocked(null);
      }
    });
    return () => sub.remove();
  }, []);

  const handleUnlock = async (option: SessionOption) => {
    if (!option.isDemo && fuelBalance < option.cost) {
      router.push('/(kid)/earn');
      return;
    }

    if (!option.isDemo) spendFuel(option.cost);
    // Compute the same extended end time the store will use
    const base = sessionEndsAt && sessionEndsAt > Date.now() ? sessionEndsAt : Date.now();
    const newSessionEndsAt = base + option.durationMs;
    grantSession(option.durationMs);
    setUnlocked(option.id);

    try {
      await SproutBlocker.startBlocking(
        ['com.google.android.youtube', 'com.google.android.youtube.kids'],
        newSessionEndsAt
      );
    } catch {}

    setTimeout(() => {
      Linking.openURL('https://www.youtube.com').catch(() => {
        Alert.alert('YouTube not installed', 'Please install YouTube first.');
      });
    }, 800);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      <SproutHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16, paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1 self-start mb-4"
        >
          <ChevronLeft size={20} color={Colors.muted} />
          <Text style={{ color: Colors.muted, fontSize: 14 }}>Home</Text>
        </TouchableOpacity>

        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: Colors.ink, marginBottom: 6 }}>
            Spend Fuel
          </Text>
          <Text style={{ color: Colors.muted, fontSize: 15, marginBottom: 20 }}>
            Trade your hard-earned fuel for YouTube screen time!
          </Text>
        </MotiView>

        <SessionCountdownBanner />

        {sessionOptions.map((opt) => (
          <SessionCard key={opt.id} option={opt} fuelBalance={fuelBalance} onUnlock={handleUnlock} />
        ))}

        <TouchableOpacity
          onPress={() => router.push('/(kid)/earn')}
          className="mt-2 rounded-2xl p-4 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: Colors.mossLt + '20' }}
          activeOpacity={0.85}
        >
          <Zap size={16} color={Colors.mossDk} />
          <Text style={{ color: Colors.mossDk, fontWeight: '700', fontSize: 15 }}>Earn more fuel</Text>
        </TouchableOpacity>
      </ScrollView>

      <AnimatePresence>
        {unlocked && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <View className="mx-8 rounded-3xl p-8 items-center" style={{ backgroundColor: Colors.paper }}>
              <Text style={{ fontSize: 64, marginBottom: 12 }}>🎬</Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 8 }}>
                Enjoy YouTube!
              </Text>
              <Text style={{ color: Colors.muted, fontSize: 15, textAlign: 'center' }}>
                Launching YouTube now…
              </Text>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
