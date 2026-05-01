import { hashIndex } from './_hash';

export interface PhotoTagInput {
  patientId: string;
  photoId: string;
}

export interface PhotoTagResult {
  tags: string[];
  category: 'before' | 'after' | 'progress' | 'other';
  confidence: number;
}

const TAG_POOLS = [
  ['face', 'frontal', 'forehead', 'no-makeup'],
  ['face', 'side-profile', 'cheek', 'no-makeup'],
  ['face', 'frontal', 'pigmentation', 'around-eyes'],
  ['face', 'frontal', 'redness', 'post-treatment'],
  ['neck', 'side', 'no-makeup'],
  ['hand', 'palm', 'pigmentation'],
];

const CATEGORIES = ['before', 'after', 'progress', 'other'] as const;

export function tagPhoto(input: PhotoTagInput): PhotoTagResult {
  const seed = `${input.patientId}:${input.photoId}`;
  const tagsIdx = hashIndex(seed, TAG_POOLS.length);
  const catIdx = hashIndex(`${seed}:cat`, CATEGORIES.length);
  // Confidence pinned to a deterministic but believable range (0.72–0.95).
  const confidence = 0.72 + (hashIndex(`${seed}:conf`, 24) / 24) * 0.23;
  return {
    tags: TAG_POOLS[tagsIdx]!,
    category: CATEGORIES[catIdx]!,
    confidence: Math.round(confidence * 100) / 100,
  };
}
