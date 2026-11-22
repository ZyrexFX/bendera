import type { SubdivisionItem } from "@/lib/quiz";

export type SubdivisionPayload = {
  country: string;
  items: SubdivisionItem[];
};

const cache = new Map<string, SubdivisionItem[]>();

export async function loadSubdivisionFlags(code: string): Promise<SubdivisionItem[]> {
  const cached = cache.get(code);
  if (cached) return cached;
  const response = await fetch(`/data/subdivisions/${code}.json`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as SubdivisionPayload;
  if (!payload || !Array.isArray(payload.items)) {
    throw new Error("Format data tidak dikenal");
  }
  cache.set(code, payload.items);
  return payload.items;
}
