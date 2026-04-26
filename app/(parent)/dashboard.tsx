import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ChevronLeft, BookOpen, Zap, TrendingUp, BookMarked, Target, Clock, Settings } from 'lucide-react-native';
import Svg, { Polyline, Circle as SvgCircle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { useSproutStore } from '../../store';
import { SproutHeader } from '../../components/SproutHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { Colors } from '../../lib/theme';

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay }}
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: color + '30' }}
    >
      <View className="mb-2" style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 20, marginBottom: 2 }}>{value}</Text>
      <Text style={{ color: Colors.muted, fontSize: 12 }}>{label}</Text>
    </MotiView>
  );
}

function SimpleLineChart({ data }: { data: number[] }) {
  const W = 280;
  const H = 120;
  const pad = 20;
  const min = Math.min(...data) - 0.2;
  const max = Math.max(...data) + 0.2;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / (max - min)) * (H - pad * 2),
  }));
  const points = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ height: H, alignItems: 'center' }}>
      <Svg width={W} height={H}>
        <Polyline points={points} fill="none" stroke={Colors.moss} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <SvgCircle key={i} cx={p.x} cy={p.y} r={5} fill={Colors.moss} />
        ))}
        {pts.map((p, i) => (
          <SvgText key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize={9} fill={Colors.muted}>
            {data[i].toFixed(1)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

function ReadingLevelChart() {
  const history = useSproutStore((s) => s.readingLevelHistory);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300 }}
      className="mx-5 mb-5 rounded-2xl p-4"
      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '30' }}
    >
      <View className="flex-row items-center gap-2 mb-1">
        <TrendingUp size={16} color={Colors.moss} />
        <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 15 }}>Reading Level</Text>
      </View>
      <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 12 }}>
        4-week progress (grade level)
      </Text>
      <SimpleLineChart data={history.map(h => h.level)} />
      <View className="flex-row justify-between mt-2 px-1">
        {history.map((h) => (
          <Text key={h.week} style={{ color: Colors.muted, fontSize: 10 }}>{h.week}</Text>
        ))}
      </View>
    </MotiView>
  );
}

function PrizeGoalRow({ goalId }: { goalId: string }) {
  const goal = useSproutStore((s) => s.prizeGoals.find((g) => g.id === goalId));
  if (!goal) return null;

  return (
    <View className="flex-row items-center gap-3 py-3" style={{ borderBottomWidth: 1, borderBottomColor: Colors.mossLt + '20' }}>
      <Text style={{ fontSize: 24 }}>{goal.emoji}</Text>
      <View className="flex-1">
        <Text style={{ color: Colors.ink, fontWeight: '600', fontSize: 14, marginBottom: 6 }}>{goal.name}</Text>
        <ProgressBar current={goal.current} total={goal.cost} />
      </View>
      <Text style={{ color: Colors.moss, fontWeight: '700', fontSize: 13 }}>
        {Math.round((goal.current / goal.cost) * 100)}%
      </Text>
    </View>
  );
}

function MissionFeed() {
  const missions = useSproutStore((s) => s.recentMissions);
  const topicEmoji: Record<string, string> = { dinosaurs: '🦕', minecraft: '⛏️', space: '🚀' };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 500 }}
      className="mx-5 mb-5 rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '30' }}
    >
      <View className="px-4 pt-4 pb-2 flex-row items-center gap-2">
        <Clock size={16} color={Colors.moss} />
        <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 15 }}>Recent Missions</Text>
      </View>
      {missions.slice(0, 5).map((m, i) => (
        <View
          key={m.id}
          className="px-4 py-3 flex-row items-center gap-3"
          style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: Colors.mossLt + '20' }}
        >
          <Text style={{ fontSize: 22 }}>{topicEmoji[m.topic]}</Text>
          <View className="flex-1">
            <Text style={{ color: Colors.ink, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{m.title}</Text>
            <Text style={{ color: Colors.muted, fontSize: 11 }}>Vocab: {m.vocabWord}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Zap size={11} color={Colors.moss} fill={Colors.moss} />
            <Text style={{ color: Colors.moss, fontWeight: '700', fontSize: 12 }}>+{m.fuelEarned}</Text>
          </View>
        </View>
      ))}
    </MotiView>
  );
}

export default function ParentDashboard() {
  const missionsThisWeek = useSproutStore((s) => s.missionsThisWeek);
  const totalEarned = useSproutStore((s) => s.totalEarned);
  const readingLevel = useSproutStore((s) => s.readingLevel);
  const vocabMastered = useSproutStore((s) => s.vocabMastered);
  const prizeGoals = useSproutStore((s) => s.prizeGoals);
  const childName = useSproutStore((s) => s.settings.childName);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      <SproutHeader showFuel={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}>
        {/* Header */}
        <View className="px-5 mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-1 self-start mb-3"
          >
            <ChevronLeft size={20} color={Colors.muted} />
            <Text style={{ color: Colors.muted, fontSize: 14 }}>Home</Text>
          </TouchableOpacity>
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: Colors.ink }}>
                  {childName}
                </Text>
                <Text style={{ color: Colors.muted, fontSize: 15, marginTop: 2 }}>Reading progress this week</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(parent)/settings')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: Colors.moss + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={20} color={Colors.moss} />
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>

        {/* Stat cards */}
        <View className="mx-5 mb-5">
          <View className="flex-row gap-3 mb-3">
            <StatCard
              icon={<BookOpen size={16} color={Colors.moss} />}
              label="Missions"
              value={missionsThisWeek.toString()}
              color={Colors.moss}
              delay={100}
            />
            <StatCard
              icon={<Zap size={16} color={Colors.earth} />}
              label="Fuel earned"
              value={totalEarned.toLocaleString()}
              color={Colors.earth}
              delay={150}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              icon={<TrendingUp size={16} color={Colors.mossDk} />}
              label="Reading level"
              value={readingLevel.toFixed(1)}
              color={Colors.mossDk}
              delay={200}
            />
            <StatCard
              icon={<BookMarked size={16} color={Colors.bark} />}
              label="Vocab mastered"
              value={vocabMastered.toString()}
              color={Colors.bark}
              delay={250}
            />
          </View>
        </View>

        {/* Chart */}
        <ReadingLevelChart />

        {/* Prize goals */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          className="mx-5 mb-5 rounded-2xl p-4"
          style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '30' }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Target size={16} color={Colors.moss} />
            <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 15 }}>Active Goals</Text>
          </View>
          {prizeGoals.map((g) => (
            <PrizeGoalRow key={g.id} goalId={g.id} />
          ))}
        </MotiView>

        {/* Mission feed */}
        <MissionFeed />
      </ScrollView>
    </View>
  );
}
