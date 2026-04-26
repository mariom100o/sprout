import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import {
  ChevronLeft,
  Settings,
  Zap,
  Clock,
  BookOpen,
  Target,
  User,
  Plus,
  Trash2,
  Check,
  Shuffle,
  Lock,
  Accessibility,
} from 'lucide-react-native';
import { useSproutStore, PrizeGoal, Topic } from '../../store';
import { Colors } from '../../lib/theme';

const SETTINGS_PASSWORD = 'abcd';

const INTEREST_NAMES: Record<Topic, string[]> = {
  dinosaurs: ['RexRoar', 'BoneDigger', 'TalonKid', 'StegoBoss', 'DinoAce', 'JurassiFan', 'ClawTracker'],
  minecraft: ['DiamondKnight', 'CreeperDodger', 'NetherHero', 'RedstoneWiz', 'EnderAce', 'BlockBoss'],
  space: ['StarRider', 'MoonHero', 'NebulaKid', 'CosmicAce', 'GalaxyFan', 'OrbitPro', 'RocketRider'],
};

function pickRandomName(current: string, interests: Topic[]): string {
  const pool = interests.length > 0
    ? interests.flatMap((i) => INTEREST_NAMES[i])
    : Object.values(INTEREST_NAMES).flat();
  const others = pool.filter((n) => n !== current);
  return others[Math.floor(Math.random() * others.length)];
}

// ── Password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const topPad = Math.max(insets.top, 16);

  const attempt = () => {
    if (input === SETTINGS_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: Colors.paper, paddingTop: topPad }}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full rounded-3xl p-7 items-center"
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '30' }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: Colors.moss + '15' }}
        >
          <Lock size={28} color={Colors.moss} />
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 4 }}>
          Parents Only
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Enter your password to access settings
        </Text>

        <TextInput
          value={input}
          onChangeText={(v) => { setInput(v); setError(false); }}
          placeholder="Password"
          placeholderTextColor={Colors.muted}
          secureTextEntry
          autoFocus
          onSubmitEditing={attempt}
          style={{
            width: '100%',
            borderWidth: 2,
            borderColor: error ? Colors.earth : Colors.mossLt + '50',
            borderRadius: 14,
            padding: 14,
            fontSize: 16,
            color: Colors.ink,
            textAlign: 'center',
            letterSpacing: 4,
            marginBottom: 8,
          }}
        />
        {error && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={{ color: Colors.earth, fontSize: 13, marginBottom: 12 }}>
              Incorrect password. Try again.
            </Text>
          </MotiView>
        )}

        <TouchableOpacity
          onPress={attempt}
          className="w-full rounded-2xl p-4 items-center mt-2"
          style={{ backgroundColor: Colors.moss }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Unlock</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: Colors.muted, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      {icon}
      <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 16 }}>{title}</Text>
    </View>
  );
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay }}
      className="mx-5 mb-4 rounded-2xl p-4"
      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.mossLt + '25' }}
    >
      {children}
    </MotiView>
  );
}

function Stepper({
  label,
  sublabel,
  value,
  step,
  min,
  max,
  format,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  step: number;
  min: number;
  max: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const display = format ? format(value) : value.toString();
  return (
    <View className="flex-row items-center" style={{ paddingVertical: 8 }}>
      <View className="flex-1">
        <Text style={{ color: Colors.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
        {sublabel ? (
          <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 1 }}>{sublabel}</Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - step))}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.mossLt + '20', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: Colors.mossDk, fontWeight: '700', fontSize: 18, lineHeight: 22 }}>−</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 16, minWidth: 52, textAlign: 'center' }}>
          {display}
        </Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + step))}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.mossLt + '20', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: Colors.mossDk, fontWeight: '700', fontSize: 18, lineHeight: 22 }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.mossLt + '20', marginVertical: 2 }} />;
}

function AccessibilityRow({ label, sublabel, value, onChange }: {
  label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center" style={{ paddingVertical: 10 }}>
      <View className="flex-1">
        <Text style={{ color: Colors.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
        {sublabel && <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 1 }}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.muted + '40', true: Colors.moss + '80' }}
        thumbColor={value ? Colors.moss : '#f4f3f4'}
      />
    </View>
  );
}

// ── Prize goal editor ─────────────────────────────────────────────────────────

const GOAL_EMOJIS = ['🏰', '🧱', '🎬', '🎮', '🍕', '🚴', '🎨', '⚽', '🎯', '🌟'];

function AddGoalModal({ onDone }: { onDone: () => void }) {
  const addPrizeGoal = useSproutStore((s) => s.addPrizeGoal);
  const [name, setName] = useState('');
  const [cost, setCost] = useState(500);
  const [emoji, setEmoji] = useState('🎯');

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a goal name.'); return; }
    addPrizeGoal({ name: name.trim(), cost, emoji, hasParentVideo: false });
    onDone();
  };

  return (
    <View className="rounded-2xl p-5 mx-5 mb-4" style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.moss + '40' }}>
      <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>New Prize Goal</Text>
      <View className="flex-row flex-wrap gap-2 mb-3">
        {GOAL_EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            onPress={() => setEmoji(e)}
            style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: emoji === e ? Colors.moss + '20' : Colors.muted + '10', alignItems: 'center', justifyContent: 'center', borderWidth: emoji === e ? 2 : 0, borderColor: Colors.moss }}
          >
            <Text style={{ fontSize: 20 }}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Goal name (e.g. Legoland trip)"
        placeholderTextColor={Colors.muted}
        style={{ borderWidth: 1, borderColor: Colors.mossLt + '40', borderRadius: 12, padding: 12, fontSize: 14, color: Colors.ink, marginBottom: 12 }}
      />
      <Stepper label="Fuel cost" sublabel="How much fuel to earn this goal" value={cost} step={100} min={100} max={50000} onChange={setCost} />
      <View className="flex-row gap-3 mt-3">
        <TouchableOpacity onPress={onDone} className="flex-1 rounded-xl p-3 items-center" style={{ backgroundColor: Colors.muted + '20' }}>
          <Text style={{ color: Colors.muted, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} className="flex-1 rounded-xl p-3 items-center flex-row justify-center gap-2" style={{ backgroundColor: Colors.moss }}>
          <Check size={15} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700' }}>Save Goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GoalRow({ goal }: { goal: PrizeGoal }) {
  const removePrizeGoal = useSproutStore((s) => s.removePrizeGoal);
  const pct = Math.round((goal.current / goal.cost) * 100);
  return (
    <View className="flex-row items-center gap-3 py-3" style={{ borderBottomWidth: 1, borderBottomColor: Colors.mossLt + '20' }}>
      <Text style={{ fontSize: 26 }}>{goal.emoji}</Text>
      <View className="flex-1">
        <Text style={{ color: Colors.ink, fontWeight: '600', fontSize: 14 }}>{goal.name}</Text>
        <Text style={{ color: Colors.muted, fontSize: 12 }}>{goal.current.toLocaleString()} / {goal.cost.toLocaleString()} ⚡ · {pct}%</Text>
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Remove goal?', `Delete "${goal.name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => removePrizeGoal(goal.id) }])} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Trash2 size={18} color={Colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

function SettingsContent() {
  const settings = useSproutStore((s) => s.settings);
  const updateSettings = useSproutStore((s) => s.updateSettings);
  const updateAccessibility = useSproutStore((s) => s.updateAccessibility);
  const prizeGoals = useSproutStore((s) => s.prizeGoals);
  const childInterests = useSproutStore((s) => s.childInterests);
  const insets = useSafeAreaInsets();
  const [addingGoal, setAddingGoal] = useState(false);
  const a11y = settings.accessibility;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 24, paddingTop: Math.max(insets.top, 16) }}>
      <View className="px-5 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 self-start mb-4">
          <ChevronLeft size={20} color={Colors.muted} />
          <Text style={{ color: Colors.muted, fontSize: 14 }}>Dashboard</Text>
        </TouchableOpacity>
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }}>
          <View className="flex-row items-center gap-3 mb-1">
            <Settings size={22} color={Colors.moss} />
            <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: Colors.ink }}>Settings</Text>
          </View>
          <Text style={{ color: Colors.muted, fontSize: 15 }}>Configure limits and rewards for your child</Text>
        </MotiView>
      </View>

      {/* Child profile */}
      <Card delay={80}>
        <SectionHeader icon={<User size={16} color={Colors.moss} />} title="Child Profile" />
        <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 6 }}>Child's name</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={settings.childName}
            onChangeText={(v) => updateSettings({ childName: v })}
            style={{ flex: 1, borderWidth: 1, borderColor: Colors.mossLt + '40', borderRadius: 12, padding: 12, fontSize: 15, color: Colors.ink }}
          />
          <TouchableOpacity
            onPress={() => updateSettings({ childName: pickRandomName(settings.childName, childInterests) })}
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.mossLt + '20', alignItems: 'center', justifyContent: 'center' }}
          >
            <Shuffle size={18} color={Colors.moss} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 6 }}>
          Tap 🔀 to pick a random name
        </Text>
      </Card>

      {/* Fuel costs */}
      <Card delay={160}>
        <SectionHeader icon={<Zap size={16} color={Colors.earth} />} title="Fuel Costs" />
        <Text style={{ color: Colors.muted, fontSize: 13, marginBottom: 12 }}>How much fuel is required to unlock each YouTube session</Text>
        <Stepper label="15-minute session" value={settings.cost15min} step={10} min={10} max={500} format={(v) => `${v} ⚡`} onChange={(v) => updateSettings({ cost15min: v })} />
        <Divider />
        <Stepper label="30-minute session" value={settings.cost30min} step={10} min={20} max={1000} format={(v) => `${v} ⚡`} onChange={(v) => updateSettings({ cost30min: v })} />
      </Card>

      {/* Daily limits */}
      <Card delay={240}>
        <SectionHeader icon={<Clock size={16} color={Colors.mossDk} />} title="Daily Limits" />
        <Stepper label="Max screen time per day" value={settings.dailyLimitMinutes} step={15} min={15} max={180} format={(v) => `${v} min`} onChange={(v) => updateSettings({ dailyLimitMinutes: v })} />
        <Divider />
        <Stepper label="Missions required per day" sublabel="Before any YouTube is unlocked" value={settings.missionsRequiredPerDay} step={1} min={1} max={10} onChange={(v) => updateSettings({ missionsRequiredPerDay: v })} />
      </Card>

      {/* Prize goals */}
      <Card delay={320}>
        <SectionHeader icon={<Target size={16} color={Colors.bark} />} title="Prize Goals" />
        <Text style={{ color: Colors.muted, fontSize: 13, marginBottom: 12 }}>Motivating rewards your child is saving toward</Text>
        {prizeGoals.map((g) => <GoalRow key={g.id} goal={g} />)}
        {!addingGoal && (
          <TouchableOpacity onPress={() => setAddingGoal(true)} className="flex-row items-center justify-center gap-2 mt-3 rounded-xl p-3" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.moss + '60' }}>
            <Plus size={16} color={Colors.moss} />
            <Text style={{ color: Colors.moss, fontWeight: '600', fontSize: 14 }}>Add goal</Text>
          </TouchableOpacity>
        )}
      </Card>

      {addingGoal && (
        <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <AddGoalModal onDone={() => setAddingGoal(false)} />
        </MotiView>
      )}

      {/* Accessibility */}
      <Card delay={380}>
        <SectionHeader icon={<Accessibility size={16} color={Colors.mossDk} />} title="Accessibility" />
        <Text style={{ color: Colors.muted, fontSize: 13, marginBottom: 12 }}>
          Adjust the reading experience to suit your child
        </Text>
        <AccessibilityRow
          label="Dyslexia-friendly mode"
          sublabel="Wider spacing, larger line height, off-white background"
          value={a11y.dyslexiaMode}
          onChange={(v) => updateAccessibility({ dyslexiaMode: v })}
        />
        <Divider />
        <AccessibilityRow
          label="Large fonts"
          sublabel="Increases all text size by 4pt"
          value={a11y.largeFonts}
          onChange={(v) => updateAccessibility({ largeFonts: v })}
        />
        <Divider />
        <AccessibilityRow
          label="Read-aloud"
          sublabel="Reads each sentence aloud and highlights it as the story plays"
          value={a11y.speechEnabled}
          onChange={(v) => updateAccessibility({ speechEnabled: v })}
        />
      </Card>

      {/* Missions info */}
      <Card delay={400}>
        <SectionHeader icon={<BookOpen size={16} color={Colors.moss} />} title="Reading Missions" />
        <Text style={{ color: Colors.muted, fontSize: 13, lineHeight: 20 }}>
          Each mission has a short passage, a prediction question, and an inference question. Your child earns 20 fuel for completing all three steps correctly.
        </Text>
        <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: Colors.mossLt + '15' }}>
          <Text style={{ color: Colors.mossDk, fontSize: 13, fontWeight: '600' }}>20 ⚡ fuel per mission</Text>
          <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 2 }}>
            {settings.missionsRequiredPerDay} mission{settings.missionsRequiredPerDay !== 1 ? 's' : ''} required before YouTube unlocks each day
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

export default function ParentSettings() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
        <PasswordGate onUnlock={() => setUnlocked(true)} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      <SettingsContent />
    </View>
  );
}
