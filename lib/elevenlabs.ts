import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';
// "Rachel" — clear, warm, child-friendly voice
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export const elevenLabsAvailable = !!API_KEY;

export async function speakText(text: string, cacheKey: string): Promise<Audio.Sound | null> {
  if (!API_KEY) return null;
  try {
    const uri = `${FileSystem.cacheDirectory}sprout_tts_${cacheKey}.mp3`;

    // Skip download if already cached
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );
      if (!res.ok) return null;

      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    return sound;
  } catch {
    return null;
  }
}

export async function loadStorySounds(
  sentences: string[],
  storyId: string
): Promise<(Audio.Sound | null)[]> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  return Promise.all(
    sentences.map((s, i) => speakText(s, `${storyId}_${i}`))
  );
}
