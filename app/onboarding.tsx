import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Sprout, Shield, Monitor, BookOpen, ChevronRight } from 'lucide-react-native';
import { useSproutStore, Topic } from '../store';
import { Colors } from '../lib/theme';
import { SproutBlocker } from '../modules/sprout-blocker';

const { width } = Dimensions.get('window');

const INTERESTS: { id: Topic; label: string; emoji: string }[] = [
  { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕' },
  { id: 'minecraft', label: 'Minecraft', emoji: '⛏️' },
  { id: 'space', label: 'Space', emoji: '🚀' },
];

type OnboardStep = 'welcome' | 'interests' | 'accessibility' | 'overlay' | 'done';

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="mb-10 items-center"
      >
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-5"
          style={{ backgroundColor: Colors.moss }}
        >
          <Sprout size={52} color="#fff" />
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 38, fontWeight: '700', color: Colors.ink, letterSpacing: -1 }}>
          Sprout.
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300 }}
        className="items-center mb-10"
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.ink, textAlign: 'center', marginBottom: 12, lineHeight: 32 }}>
          Read to earn.{'\n'}Earn to play.
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
          Complete reading missions to earn fuel, then spend it on YouTube screen time.
        </Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }} className="w-full">
        <TouchableOpacity
          onPress={onNext}
          className="rounded-2xl p-4 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: Colors.moss }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>Let's go!</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

function InterestsStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: Topic[];
  onToggle: (t: Topic) => void;
  onNext: () => void;
}) {
  return (
    <View className="flex-1 px-6 pt-8">
      <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-8">
        <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: Colors.ink, marginBottom: 8, lineHeight: 34 }}>
          What does your child love?
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 15 }}>
          We'll find real children's books about their interests.
        </Text>
      </MotiView>

      <View className="gap-4 mb-8">
        {INTERESTS.map((item, i) => {
          const isSelected = selected.includes(item.id);
          return (
            <MotiView key={item.id} from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: i * 80 }}>
              <TouchableOpacity
                onPress={() => onToggle(item.id)}
                className="rounded-2xl p-4 flex-row items-center gap-4"
                style={{
                  backgroundColor: isSelected ? Colors.moss : '#fff',
                  borderWidth: 2,
                  borderColor: isSelected ? Colors.moss : Colors.mossLt + '40',
                }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
                <Text style={{ flex: 1, fontWeight: '700', fontSize: 18, color: isSelected ? '#fff' : Colors.ink }}>
                  {item.label}
                </Text>
                {isSelected && (
                  <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onNext}
        className="rounded-2xl p-4 items-center flex-row justify-center gap-2"
        style={{ backgroundColor: selected.length > 0 ? Colors.moss : Colors.muted + '40' }}
        activeOpacity={selected.length > 0 ? 0.85 : 0.6}
        disabled={selected.length === 0}
      >
        <Text style={{ color: selected.length > 0 ? '#fff' : Colors.muted, fontWeight: '700', fontSize: 17 }}>
          Continue
        </Text>
        <ChevronRight size={20} color={selected.length > 0 ? '#fff' : Colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

function PermissionStep({
  icon,
  title,
  description,
  buttonLabel,
  onGrant,
  onSkip,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onGrant: () => void;
  onSkip: () => void;
}) {
  return (
    <View className="flex-1 px-6 pt-8">
      <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="items-center mb-8">
        <View className="w-20 h-20 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: Colors.moss + '15' }}>
          {icon}
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: Colors.ink, textAlign: 'center', marginBottom: 10, lineHeight: 32 }}>
          {title}
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 24 }}>
          {description}
        </Text>
      </MotiView>

      <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: Colors.earthLt + '30' }}>
        <Text style={{ color: Colors.bark, fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
          ⚠️ This permission is required for Sprout to detect when YouTube is opened and show the fuel check.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onGrant}
        className="rounded-2xl p-4 items-center mb-3"
        style={{ backgroundColor: Colors.moss }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{buttonLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkip} className="p-3 items-center" activeOpacity={0.7}>
        <Text style={{ color: Colors.muted, fontSize: 14 }}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

function DoneStep({ onFinish }: { onFinish: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="items-center mb-8"
      >
        <Text style={{ fontSize: 80 }}>🌱</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }} className="items-center mb-10">
        <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', color: Colors.ink, textAlign: 'center', marginBottom: 12 }}>
          You're all set!
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
          Sprout is ready to help your child build a reading habit — one mission at a time.
        </Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }} className="w-full">
        <TouchableOpacity
          onPress={onFinish}
          className="rounded-2xl p-4 items-center"
          style={{ backgroundColor: Colors.moss }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>Start reading! 🚀</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

const STEPS: OnboardStep[] = ['welcome', 'interests', 'accessibility', 'overlay', 'done'];

export default function OnboardingScreen() {
  const [step, setStep] = useState<OnboardStep>('welcome');
  const [interests, setInterests] = useState<Topic[]>(['dinosaurs']);
  const setPermissionsGranted = useSproutStore((s) => s.setPermissionsGranted);
  const setChildInterests = useSproutStore((s) => s.setChildInterests);

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const toggleInterest = (t: Topic) => {
    setInterests((prev: Topic[]) => (prev.includes(t) ? prev.filter((x: Topic) => x !== t) : [...prev, t]));
  };

  const handleGrantAccessibility = async () => {
    try {
      await SproutBlocker.requestAccessibilityPermission();
    } catch {}
    next();
  };

  const handleGrantOverlay = async () => {
    try {
      await SproutBlocker.requestOverlayPermission();
    } catch {}
    next();
  };

  const handleFinish = () => {
    setChildInterests(interests);
    setPermissionsGranted(true);
    router.replace('/(kid)/home');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      {/* Progress dots */}
      {step !== 'done' && (
        <View className="flex-row justify-center gap-2 pt-12 pb-4">
          {STEPS.slice(0, -1).map((s) => (
            <View
              key={s}
              className="rounded-full"
              style={{
                width: step === s ? 20 : 8,
                height: 8,
                backgroundColor: step === s ? Colors.moss : Colors.mossLt + '50',
              }}
            />
          ))}
        </View>
      )}

      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={step}
          from={{ opacity: 0, translateX: 30 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -30 }}
          transition={{ type: 'timing', duration: 220 }}
          style={{ flex: 1 }}
        >
          {step === 'welcome' && <WelcomeStep onNext={next} />}
          {step === 'interests' && (
            <InterestsStep selected={interests} onToggle={toggleInterest} onNext={next} />
          )}
          {step === 'accessibility' && (
            <PermissionStep
              icon={<Shield size={36} color={Colors.moss} />}
              title="Accessibility Service"
              description="Sprout needs to know when YouTube opens so it can check if your child has earned screen time."
              buttonLabel="Open Accessibility Settings"
              onGrant={handleGrantAccessibility}
              onSkip={next}
            />
          )}
          {step === 'overlay' && (
            <PermissionStep
              icon={<Monitor size={36} color={Colors.moss} />}
              title="Display Over Other Apps"
              description="This lets Sprout show a friendly popup when YouTube opens without earned fuel."
              buttonLabel="Open Overlay Permission"
              onGrant={handleGrantOverlay}
              onSkip={next}
            />
          )}
          {step === 'done' && <DoneStep onFinish={handleFinish} />}
        </MotiView>
      </AnimatePresence>
    </View>
  );
}
