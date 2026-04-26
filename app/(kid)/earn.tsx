import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { ChevronLeft, Zap, BookOpen, Brain, CheckCircle, Volume2, VolumeX } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useSproutStore, Topic, Story } from '../../store';
import { getRandomStory } from '../../lib/stories';
import { Colors } from '../../lib/theme';
import { SproutHeader } from '../../components/SproutHeader';
import { loadStorySounds, elevenLabsAvailable } from '../../lib/elevenlabs';
import { fetchStoryFromLibrary, claudeAvailable } from '../../lib/ai';

function shuffleAnswers(story: Story): Story {
  const correct = story.inferenceOptions[story.correctInferenceIndex];
  const shuffled = [...story.inferenceOptions].sort(() => Math.random() - 0.5);
  return {
    ...story,
    predictOptions: [...story.predictOptions].sort(() => Math.random() - 0.5),
    inferenceOptions: shuffled,
    correctInferenceIndex: shuffled.indexOf(correct),
  };
}

type Step = 'topic' | 'predict' | 'read' | 'answer' | 'success';

const TOPICS: { id: Topic; label: string; emoji: string; color: string }[] = [
  { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕', color: Colors.mossDk },
  { id: 'minecraft', label: 'Minecraft', emoji: '⛏️', color: '#5C7A2A' },
  { id: 'space', label: 'Space', emoji: '🚀', color: '#2A4A7A' },
];

function fuelForAttempts(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 20;
  if (wrongAttempts === 1) return 15;
  return 10;
}

function StepIndicator({ current }: { current: number }) {
  const steps = ['Topic', 'Predict', 'Read', 'Answer'];
  return (
    <View className="flex-row items-center justify-center gap-2 py-3">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <View
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{
              backgroundColor: i < current ? Colors.moss : i === current ? Colors.moss : '#E0DDD4',
              opacity: i < current ? 0.4 : 1,
            }}
          >
            {i < current ? (
              <CheckCircle size={16} color="#fff" />
            ) : (
              <Text style={{ color: i === current ? '#fff' : Colors.muted, fontSize: 11, fontWeight: '700' }}>
                {i + 1}
              </Text>
            )}
          </View>
          {i < steps.length - 1 && (
            <View className="flex-1 h-0.5" style={{ backgroundColor: i < current ? Colors.mossLt : '#E0DDD4', maxWidth: 28 }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// Step 1 — Topic Picker
function TopicPicker({ onSelect }: { onSelect: (t: Topic) => void }) {
  return (
    <View className="flex-1 px-5">
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
        <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: Colors.ink, marginBottom: 8 }}>
          What do you want to read about?
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 15, marginBottom: 28 }}>
          Pick a topic and earn +{20} fuel!
        </Text>
      </MotiView>
      <View className="gap-4">
        {TOPICS.map((topic, i) => (
          <MotiView
            key={topic.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: i * 80 }}
          >
            <TouchableOpacity
              onPress={() => onSelect(topic.id)}
              className="rounded-2xl p-5 flex-row items-center gap-4"
              style={{ backgroundColor: topic.color }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 44 }}>{topic.emoji}</Text>
              <View className="flex-1">
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>{topic.label}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Reading mission</Text>
              </View>
              <View className="flex-row items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Zap size={12} color="#fff" fill="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>+{20}</Text>
              </View>
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

// Step 2 — Predict
function PredictStep({ story, onSelect }: { story: Story; onSelect: (i: number) => void }) {
  return (
    <View className="flex-1 px-5">
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
        <View className="flex-row items-center gap-2 mb-3">
          <Brain size={18} color={Colors.earth} />
          <Text style={{ color: Colors.earth, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            Predict First
          </Text>
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 6, lineHeight: 30 }}>
          {story.title}
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 14, marginBottom: 24 }}>
          What do you think this story will be about?
        </Text>
      </MotiView>
      <View className="gap-3">
        {story.predictOptions.map((opt, i) => (
          <MotiView key={i} from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: i * 80 }}>
            <TouchableOpacity
              onPress={() => onSelect(i)}
              className="rounded-2xl p-4 border-2"
              style={{ borderColor: Colors.mossLt + '60', backgroundColor: '#fff' }}
              activeOpacity={0.8}
            >
              <Text style={{ color: Colors.ink, fontSize: 15, lineHeight: 22 }}>{opt}</Text>
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>
      <Text style={{ color: Colors.muted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Any answer is fine — just make your best guess!
      </Text>
    </View>
  );
}

// Step 3 — Read (vocab shown as a definition box, no tap required)
function ReadStep({ story, onDone }: { story: Story; onDone: () => void }) {
  const [canDone, setCanDone] = useState(false);
  const a11y = useSproutStore((s) => s.settings.accessibility);
  const fs = a11y.largeFonts ? 4 : 0;

  // TTS state
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [activeSentence, setActiveSentence] = useState(-1);
  const soundsRef = useRef<(Audio.Sound | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setCanDone(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Load TTS whenever ElevenLabs is available
  useEffect(() => {
    if (!elevenLabsAvailable) return;
    setTtsLoading(true);
    loadStorySounds(story.sentences, story.id).then((sounds) => {
      soundsRef.current = sounds;
      setTtsReady(sounds.some(Boolean));
      setTtsLoading(false);
    });
    return () => {
      soundsRef.current.forEach((s) => s?.unloadAsync().catch(() => {}));
    };
  }, [story.id]);

  const playReadAlong = async () => {
    if (ttsPlaying) return;
    setTtsPlaying(true);
    for (let i = 0; i < soundsRef.current.length; i++) {
      const sound = soundsRef.current[i];
      if (!sound) continue;
      setActiveSentence(i);
      await sound.replayAsync();
      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) resolve();
        });
      });
    }
    setActiveSentence(-1);
    setTtsPlaying(false);
  };

  return (
    <View className="flex-1 px-5">
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <View className="flex-row items-center gap-2 mb-3">
          <BookOpen size={18} color={Colors.moss} />
          <Text style={{ color: Colors.moss, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            Reading Time
          </Text>
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 16, lineHeight: 30 }}>
          {story.title}
        </Text>
      </MotiView>

      {/* TTS controls */}
      {elevenLabsAvailable && (
        <View className="flex-row items-center gap-2 mb-3">
          {ttsLoading ? (
            <ActivityIndicator size="small" color={Colors.moss} />
          ) : ttsReady ? (
            <TouchableOpacity
              onPress={playReadAlong}
              disabled={ttsPlaying}
              className="flex-row items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: ttsPlaying ? Colors.muted + '20' : Colors.moss + '20' }}
            >
              {ttsPlaying ? <VolumeX size={15} color={Colors.muted} /> : <Volume2 size={15} color={Colors.moss} />}
              <Text style={{ color: ttsPlaying ? Colors.muted : Colors.moss, fontWeight: '600', fontSize: 13 }}>
                {ttsPlaying ? 'Reading…' : '▶ Read aloud'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: Colors.muted, fontSize: 12 }}>Audio unavailable</Text>
          )}
        </View>
      )}

      {/* Story text */}
      <View
        className="rounded-2xl p-5 mb-4"
        style={{
          backgroundColor: a11y.dyslexiaMode ? '#FFFEF5' : '#fff',
          borderWidth: 1,
          borderColor: Colors.mossLt + '30',
        }}
      >
        {story.sentences.map((sentence, idx) => (
          <Text
            key={idx}
            style={{
              color: Colors.ink,
              fontSize: 17 + fs,
              lineHeight: a11y.dyslexiaMode ? 36 : 28,
              letterSpacing: a11y.dyslexiaMode ? 0.8 : 0,
              marginBottom: idx < story.sentences.length - 1 ? (a11y.dyslexiaMode ? 14 : 10) : 0,
              backgroundColor: activeSentence === idx ? Colors.earth + '30' : 'transparent',
              borderRadius: 4,
              fontWeight: activeSentence === idx ? '700' : '400',
            }}
          >
            {sentence}
          </Text>
        ))}
      </View>

      {/* Vocab word box — always visible, no tap required */}
      <View className="rounded-2xl px-4 py-3 mb-5 flex-row items-start gap-3"
        style={{ backgroundColor: Colors.earthLt + '40', borderWidth: 1, borderColor: Colors.earth + '30' }}>
        <Text style={{ fontSize: 20 }}>📖</Text>
        <View className="flex-1">
          <Text style={{ color: Colors.bark, fontWeight: '700', fontSize: 15 }}>{story.vocabWord}</Text>
          <Text style={{ color: Colors.bark, fontSize: 14, lineHeight: 20, marginTop: 2 }}>{story.vocabDefinition}</Text>
        </View>
      </View>

      <AnimatePresence>
        {canDone ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}>
            <TouchableOpacity
              onPress={onDone}
              className="rounded-2xl p-4 items-center"
              style={{ backgroundColor: Colors.moss }}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>Done reading! ✓</Text>
            </TouchableOpacity>
          </MotiView>
        ) : (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="items-center py-2">
            <Text style={{ color: Colors.muted, fontSize: 14 }}>Read the whole story first…</Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

// Step 4 — Answer
function AnswerStep({ story, onCorrect }: { story: Story; onCorrect: (wrongAttempts: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;
  const a11y = useSproutStore((s) => s.settings.accessibility);

  const handleSelect = (idx: number) => {
    setWrong(false);
    setSelected(idx);
    if (idx === story.correctInferenceIndex) {
      setTimeout(() => onCorrect(wrongAttempts), 500);
    } else {
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      setWrong(true);
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setSelected(null));
    }
  };

  const fuelPreview = fuelForAttempts(wrongAttempts);

  return (
    <View className="flex-1 px-5">
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <View className="flex-row items-center gap-2 mb-3">
          <Brain size={18} color={Colors.moss} />
          <Text style={{ color: Colors.moss, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            Think About It
          </Text>
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 20, lineHeight: 28 }}>
          {story.inferenceQuestion}
        </Text>

        <View className="gap-3">
          {story.inferenceOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = isSelected && i === story.correctInferenceIndex;
            const isWrong = isSelected && i !== story.correctInferenceIndex;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(i)}
                className="rounded-2xl p-4 border-2"
                style={{
                  borderColor: isCorrect ? Colors.moss : isWrong ? Colors.earth : Colors.mossLt + '60',
                  backgroundColor: isCorrect ? Colors.moss + '15' : isWrong ? Colors.earth + '15' : '#fff',
                }}
                activeOpacity={0.8}
                disabled={selected !== null}
              >
                <Text style={{ color: Colors.ink, fontSize: 15, lineHeight: 22 }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {wrong && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl" style={{ backgroundColor: Colors.earthLt + '40' }}>
            <Text style={{ color: Colors.bark, fontSize: a11y.largeFonts ? 16 : 13, textAlign: 'center', lineHeight: a11y.dyslexiaMode ? 24 : undefined }}>
              Not quite — read the story again and try another answer!
            </Text>
          </MotiView>
        )}
        {wrongAttempts > 0 && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 items-center">
            <Text style={{ color: Colors.muted, fontSize: 12 }}>
              Reward if correct now: <Text style={{ color: Colors.moss, fontWeight: '700' }}>{fuelPreview} ⚡</Text>
            </Text>
          </MotiView>
        )}
      </Animated.View>
    </View>
  );
}

// Success screen
function SuccessStep({ story, fuelReward, onDone }: { story: Story; fuelReward: number; onDone: () => void }) {
  const earnFuel = useSproutStore((s) => s.earnFuel);
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const [count, setCount] = useState(fuelBalance);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    earnFuel(fuelReward, {
      topic: story.topic,
      title: story.title,
      fuelEarned: fuelReward,
      vocabWord: story.vocabWord,
    });

    let c = fuelBalance;
    const target = fuelBalance + fuelReward;
    const interval = setInterval(() => {
      c += 1;
      setCount(c);
      if (c >= target) clearInterval(interval);
    }, 30);

    // Play coin sound
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/coin.mp3'));
        await sound.playAsync();
      } catch {}
    })();

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-8">
      <MotiView
        from={{ scale: 0, rotate: '-20deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="items-center mb-8"
      >
        <Text style={{ fontSize: 80 }}>🎉</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }} className="items-center">
        <Text style={{ fontFamily: 'Georgia', fontSize: 30, fontWeight: '700', color: Colors.ink, marginBottom: 4 }}>
          Amazing!
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
          You read about {story.vocabWord} and answered correctly!
        </Text>

        <View className="flex-row items-center gap-2 mb-6 px-6 py-3 rounded-full" style={{ backgroundColor: Colors.moss + '20' }}>
          <Zap size={22} color={Colors.moss} fill={Colors.moss} />
          <Text style={{ color: Colors.moss, fontWeight: '700', fontSize: 26 }}>
            +{fuelReward} fuel!
          </Text>
        </View>

        <Text style={{ color: Colors.muted, fontSize: 14, marginBottom: 4 }}>Total balance:</Text>
        <Text style={{ color: Colors.ink, fontWeight: '700', fontSize: 32, fontFamily: 'Georgia', marginBottom: 32 }}>
          {count.toLocaleString()}
        </Text>

        <TouchableOpacity
          onPress={onDone}
          className="w-full rounded-2xl p-4 items-center"
          style={{ backgroundColor: Colors.moss }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(kid)/earn')}
          className="mt-3 w-full rounded-2xl p-4 items-center"
          style={{ backgroundColor: Colors.mossLt + '30' }}
          activeOpacity={0.85}
        >
          <Text style={{ color: Colors.mossDk, fontWeight: '700', fontSize: 16 }}>Do Another Mission</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

export default function EarnScreen() {
  const [step, setStep] = useState<Step>('topic');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [fuelReward, setFuelReward] = useState(20);
  const [aiLoading, setAiLoading] = useState(false);
  const readingLevel = useSproutStore((s) => s.readingLevel);
  const stepIndex: Record<Step, number> = { topic: 0, predict: 1, read: 2, answer: 3, success: 4 };

  const handleTopicSelect = async (t: Topic) => {
    setTopic(t);
    if (claudeAvailable) {
      setAiLoading(true);
      const result = await fetchStoryFromLibrary(t, readingLevel);
      setAiLoading(false);
      if (result) {
        setStory(shuffleAnswers({ id: `ol-${Date.now()}`, topic: t, ...result }));
        setStep('predict');
        return;
      }
    }
    setStory(shuffleAnswers(getRandomStory(t, readingLevel)));
    setStep('predict');
  };

  const handleCorrect = (wrongAttempts: number) => {
    setFuelReward(fuelForAttempts(wrongAttempts));
    setStep('success');
  };

  if (aiLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.paper }}>
        <ActivityIndicator size="large" color={Colors.moss} />
        <Text style={{ color: Colors.muted, fontSize: 15, marginTop: 16 }}>Fetching your story…</Text>
      </View>
    );
  }

  const renderStep = () => {
    if (step === 'topic') return <TopicPicker onSelect={handleTopicSelect} />;
    if (!story) return null;
    if (step === 'predict') return <PredictStep story={story} onSelect={() => setStep('read')} />;
    if (step === 'read') return <ReadStep story={story} onDone={() => setStep('answer')} />;
    if (step === 'answer') return <AnswerStep story={story} onCorrect={handleCorrect} />;
    if (step === 'success') return <SuccessStep story={story} fuelReward={fuelReward} onDone={() => router.replace('/(kid)/home')} />;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.paper }}>
      <SproutHeader />

      {step !== 'success' && (
        <View className="px-5 mb-2">
          <TouchableOpacity
            onPress={() => (step === 'topic' ? router.back() : setStep('topic'))}
            className="flex-row items-center gap-1 self-start"
          >
            <ChevronLeft size={20} color={Colors.muted} />
            <Text style={{ color: Colors.muted, fontSize: 14 }}>
              {step === 'topic' ? 'Home' : 'Start Over'}
            </Text>
          </TouchableOpacity>
          <StepIndicator current={stepIndex[step]} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={step}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: 'timing', duration: 200 }}
            style={{ flex: 1 }}
          >
            {renderStep()}
          </MotiView>
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}
