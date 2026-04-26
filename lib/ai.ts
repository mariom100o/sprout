import { Topic, Story } from '../store';
import { fetchBookContent } from './openLibrary';
import { sentencesForLevel } from './stories';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export const claudeAvailable = !!API_KEY;

type Questions = Omit<Story, 'id' | 'topic' | 'title' | 'sentences'>;

const SYSTEM = `You are an educational content creator for 2nd grade children (age 7-8).
Rules:
- vocabWord: one interesting word that actually appears in the provided sentences
- vocabDefinition: simple child-friendly definition, max 12 words
- predictOptions: 3 options — shuffle them so the correct one is NOT always first
- inferenceQuestion: requires thinking — answer NOT stated directly in text
- inferenceOptions: exactly 3 options, correctInferenceIndex is 0, 1, or 2 (vary it, do NOT always use 0)
- Return ONLY a valid JSON object, no markdown, no explanation`;

export async function fetchStoryFromLibrary(
  topic: Topic,
  readingLevel = 3.0
): Promise<(Omit<Story, 'id' | 'topic'> & { isAI: true }) | null> {
  if (!API_KEY) return null;

  const targetCount = sentencesForLevel(readingLevel);
  const content = await fetchBookContent(topic, targetCount);
  if (!content || content.sentences.length < 3) return null;

  const passageText = content.sentences.join(' ');
  const gradeDesc =
    readingLevel < 2.5
      ? 'early 2nd grade (age 7, simple questions)'
      : readingLevel < 3.5
      ? '2nd–3rd grade (age 7–8, moderate questions)'
      : '3rd–4th grade (age 8–9, more challenging questions)';

  const prompt = `A child reading at ${gradeDesc} is about to read this passage from a real book called "${content.title}":

"${passageText}"

Generate comprehension materials appropriate for that reading level. Return JSON with exactly this shape:
{
  "vocabWord": "word from the passage",
  "vocabDefinition": "simple definition",
  "predictOptions": ["option A", "option B", "option C"],
  "inferenceQuestion": "thinking question",
  "inferenceOptions": ["option 0", "option 1", "option 2"],
  "correctInferenceIndex": 1
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const q = JSON.parse(match[0]) as Questions;

    return {
      title: content.title,
      sentences: content.sentences,
      vocabWord: q.vocabWord,
      vocabDefinition: q.vocabDefinition,
      predictOptions: q.predictOptions,
      inferenceQuestion: q.inferenceQuestion,
      inferenceOptions: q.inferenceOptions,
      correctInferenceIndex: q.correctInferenceIndex,
      isAI: true as const,
    };
  } catch {
    return null;
  }
}
