import { Topic } from '../store';

export interface BookContent {
  title: string;
  sentences: string[];
}

const QUERIES: Record<Topic, string> = {
  dinosaurs: 'dinosaurs prehistoric nonfiction children',
  minecraft: 'minecraft kids guide gaming',
  space: 'space planets solar system nonfiction children',
};

function parseSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 350 && /[A-Za-z]{3}/.test(s));
}

async function fetchWorkSentences(workKey: string): Promise<string[]> {
  const res = await fetch(`https://openlibrary.org${workKey}.json`);
  if (!res.ok) return [];
  const work = await res.json();
  const sentences: string[] = [];

  if (Array.isArray(work.excerpts)) {
    for (const exc of work.excerpts) {
      const text = typeof exc.excerpt === 'string' ? exc.excerpt : exc.excerpt?.value;
      if (text) sentences.push(...parseSentences(text));
    }
  }

  const desc =
    typeof work.description === 'string'
      ? work.description
      : work.description?.value;
  if (desc) sentences.push(...parseSentences(desc));

  return sentences;
}

export async function fetchBookContent(
  topic: Topic,
  targetCount = 6
): Promise<BookContent | null> {
  try {
    const q = encodeURIComponent(QUERIES[topic]);
    const searchRes = await fetch(
      `https://openlibrary.org/search.json?q=${q}&subject=juvenile&limit=20`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    const minRequired = Math.max(3, Math.floor(targetCount * 0.6));

    for (const doc of searchData.docs ?? []) {
      const sentences: string[] = [];

      // first_sentence from search index (actual book sentences)
      const fs = doc.first_sentence;
      if (Array.isArray(fs)) {
        sentences.push(...fs.filter((s: unknown) => typeof s === 'string' && (s as string).length >= 20));
      } else if (typeof fs === 'string' && fs.length >= 20) {
        sentences.push(fs);
      }

      // description from search index
      if (typeof doc.description === 'string') {
        sentences.push(...parseSentences(doc.description));
      }

      // If not enough yet, fetch work details for excerpts/description
      if (sentences.length < targetCount && doc.key) {
        try {
          const workSentences = await fetchWorkSentences(doc.key);
          sentences.push(...workSentences);
        } catch {}
      }

      const unique = [...new Set(sentences)].slice(0, targetCount);
      if (unique.length >= minRequired) {
        return { title: doc.title, sentences: unique };
      }
    }
    return null;
  } catch {
    return null;
  }
}
