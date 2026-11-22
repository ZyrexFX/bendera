export type BestEntry = {
  score: number;
  correct: number;
  total: number;
  at: string;
};

const BEST_KEY = "flagmint:best";
const SOUND_KEY = "flagmint:sound";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readBestScores(): Record<string, BestEntry> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readBest(key: string): BestEntry | null {
  return readBestScores()[key] ?? null;
}

export function recordBest(key: string, entry: BestEntry) {
  const all = readBestScores();
  const previous = all[key];
  if (previous && previous.score >= entry.score) {
    return { best: previous, isRecord: false };
  }
  all[key] = entry;
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(all));
  } catch {
    // Saving is a bonus, not a requirement to play.
  }
  return { best: entry, isRecord: true };
}

export function readSoundPreference(): boolean {
  if (!canUseStorage()) return true;
  return localStorage.getItem(SOUND_KEY) !== "off";
}

export function saveSoundPreference(enabled: boolean) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // Ignore blocked storage.
  }
}
