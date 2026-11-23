import type { Country } from "@/lib/countries";
import {
  countriesWithCapital,
  countryName,
  difficultyMeta,
  flagSrc,
} from "@/lib/countries";
import { getDictionary, regionLabel, typeLabel } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export type Option = {
  key: string;
  label: string;
};

export type Question = {
  key: string;
  prompt: string;
  hint?: string;
  imageSrc?: string;
  imageAlt?: string;
  answerKey: string;
  answerLabel: string;
  answers: string[];
  options: Option[];
  reviewImageAlt?: string;
};

export type SubdivisionItem = {
  code: string;
  name: string;
  type: string;
  file: string;
  ext: string;
};

const SUBDIVISION_CDN =
  "https://cdn.jsdelivr.net/gh/amckenna41/iso3166-flags@main/iso3166-2-flags";

export const OPTION_COUNT = 4;

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.max(0, count));
}

function uniqueByLabel<T extends { label: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.label.toLocaleLowerCase("id");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildOptions(
  answer: Option,
  candidates: Option[],
  count = OPTION_COUNT,
): Option[] {
  const picked = uniqueByLabel(
    candidates.filter(
      (item) =>
        item.key !== answer.key &&
        item.label.toLocaleLowerCase("id") !==
          answer.label.toLocaleLowerCase("id"),
    ),
  ).slice(0, count - 1);
  return shuffle([answer, ...picked]);
}

function countryOption(country: Country, lang: Lang): Option {
  return { key: country.code, label: countryName(country, lang) };
}

/**
 * Flags that are easy to mix up by design. Colour overlap alone already catches
 * most of these, but a curated list keeps the classics together even when the
 * palette extraction misses a detail.
 */
const LOOKALIKE_GROUPS: string[][] = [
  ["id", "mc", "pl", "sg"],
  ["nl", "lu", "ru", "fr", "it", "ie", "be"],
  ["ro", "td", "ad", "md"],
  ["dk", "no", "se", "fi", "is"],
  ["eg", "iq", "sy", "ye", "jo", "ps", "ae", "kw", "ly", "sd"],
  ["ru", "sk", "si", "hr", "rs", "cz", "pl", "bg"],
  ["hn", "sv", "ni", "gt", "cr", "do", "cu", "pr"],
  ["ml", "sn", "gn", "ci", "ne", "gh", "cm", "bf", "tg", "bj", "gw"],
  ["ke", "tz", "ug", "rw", "bi", "zm", "mw", "mz"],
  ["au", "nz", "fj", "tu", "ws", "ck", "to", "vu", "sb", "pg"],
  ["co", "ec", "ve"],
  ["de", "be", "nl", "lu", "ee", "ie"],
  ["at", "lv", "pe", "ca", "ge"],
  ["in", "ne", "ci", "ie"],
  ["us", "lr", "my", "ph"],
];

function sharesLookalikeGroup(a: string, b: string): boolean {
  return LOOKALIKE_GROUPS.some(
    (group) => group.includes(a) && group.includes(b),
  );
}

function normalizeColor(value: string): [number, number, number] | null {
  const trimmed = value.trim();
  const rgb = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  );
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  let hex = trimmed.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6 || !/^[0-9a-f]{6}$/i.test(hex)) return null;
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function colorBucket(value: string): string | null {
  const rgb = normalizeColor(value);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta < 0.12) {
    if (lightness > 0.9) return "white";
    if (lightness < 0.16) return "black";
    return "gray";
  }

  let hue = 0;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  hue *= 60;
  if (hue < 0) hue += 360;

  if (hue < 16 || hue >= 345) return "red";
  if (hue < 42) return "orange";
  if (hue < 70) return "yellow";
  if (hue < 165) return "green";
  if (hue < 200) return "cyan";
  if (hue < 258) return "blue";
  if (hue < 320) return "purple";
  return "pink";
}

function colorBuckets(country: Country): Set<string> {
  const buckets = new Set<string>();
  for (const value of country.colors ?? []) {
    const bucket = colorBucket(value);
    if (bucket) buckets.add(bucket);
  }
  return buckets;
}

function paletteOverlap(a: Country, b: Country): number {
  const left = colorBuckets(a);
  const right = colorBuckets(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const bucket of left) if (right.has(bucket)) shared += 1;
  const union = new Set([...left, ...right]).size;
  return shared / union;
}

/** True when two flags share a curated family or almost the same palette. */
export function isLookalike(a: Country, b: Country): boolean {
  if (a.code === b.code) return false;
  return (
    sharesLookalikeGroup(a.code, b.code) || paletteOverlap(a, b) >= 0.72
  );
}

function dedupeCountries(items: Country[]): Country[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

/**
 * Distractors stay inside the question's difficulty tier. Pulling in a famous
 * easy-tier country as a wrong answer for a hard flag gives the answer away:
 * you can cross off the names you already know. Within the tier we still lead
 * with lookalike flags, then the same subregion, then the same region.
 */
function countryCandidates(
  target: Country,
  pool: Country[],
  lang: Lang,
): Option[] {
  const withoutTarget = pool.filter((c) => c.code !== target.code);
  const sameTier = withoutTarget.filter(
    (c) => c.difficulty === target.difficulty,
  );
  // Only widen past the tier when it is too small to fill the options.
  const base =
    sameTier.length >= OPTION_COUNT - 1 ? sameTier : withoutTarget;

  const lookalikes = base
    .map((country) => ({
      country,
      score:
        paletteOverlap(target, country) +
        (sharesLookalikeGroup(target.code, country.code) ? 0.6 : 0),
    }))
    .filter((item) => item.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => item.country);

  const subregion = base.filter((c) => c.subregion === target.subregion);
  const region = base.filter((c) => c.region === target.region);

  return dedupeCountries([
    ...shuffle(lookalikes),
    ...shuffle(subregion),
    ...shuffle(region),
    ...shuffle(base),
  ]).map((country) => countryOption(country, lang));
}

const COUNTRY_ALIASES: Record<string, string[]> = {
  us: ["USA", "United States of America", "Amerika", "America"],
  gb: ["UK", "Great Britain", "Britain", "Inggris", "England"],
  cd: [
    "DRC",
    "Democratic Republic of the Congo",
    "Democratic Republic of Congo",
    "Kongo",
  ],
  cg: ["Republic of the Congo", "Congo Brazzaville"],
  ci: ["Cote d'Ivoire", "Côte d'Ivoire"],
  nl: ["Holland"],
  cz: ["Czech Republic"],
  tr: ["Turkey", "Turkiye"],
  ae: ["UAE", "Emirates"],
  va: ["Holy See"],
  sz: ["Swaziland"],
  mk: ["Macedonia"],
  mm: ["Burma"],
  tl: ["East Timor", "Timor Timur"],
};

function countryAnswers(country: Country): string[] {
  return [
    ...new Set(
      [country.name, country.nameEn, ...(COUNTRY_ALIASES[country.code] ?? [])]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

/** Lowercase, strip accents, drop punctuation, and collapse spaces. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesAnswer(
  value: string,
  answers: readonly string[],
): boolean {
  const given = normalizeAnswer(value);
  if (!given) return false;
  return answers.some((answer) => {
    const normalized = normalizeAnswer(answer);
    if (!normalized) return false;
    return given === normalized || given === `the ${normalized}`;
  });
}

export function buildFlagQuestions(
  pool: Country[],
  count: number,
  optionPool: Country[] = pool,
  lang: Lang = "id",
): Question[] {
  const dict = getDictionary(lang);
  const targets = sample(pool, count);
  return targets.map((target) => {
    const answer = countryOption(target, lang);
    const name = countryName(target, lang);
    return {
      key: target.code,
      prompt: dict.game.flagPrompt,
      imageSrc: flagSrc(target),
      imageAlt: dict.game.flagAlt,
      reviewImageAlt: `${dict.game.answer}: ${name}`,
      answerKey: answer.key,
      answerLabel: answer.label,
      answers: countryAnswers(target),
      options: buildOptions(
        answer,
        countryCandidates(target, optionPool, lang),
      ),
    };
  });
}

export function capitalLabel(country: Country): string {
  return country.capital.join(", ");
}

export function buildCapitalQuestions(
  pool: Country[],
  count: number,
  lang: Lang = "id",
): Question[] {
  const dict = getDictionary(lang);
  const capitalPool = pool.filter((c) => c.capital.length > 0);
  const allCapitals = countriesWithCapital;
  const targets = sample(capitalPool, count);

  return targets.map((target) => {
    const answer: Option = {
      key: `capital:${target.code}`,
      label: capitalLabel(target),
    };

    // Keep wrong capitals in the same tier for the same reason as flags:
    // familiar capitals from easier countries would make hard questions easy.
    const withoutTarget = allCapitals.filter(
      (c) => c.code !== target.code,
    );
    const sameTier = withoutTarget.filter(
      (c) => c.difficulty === target.difficulty,
    );
    const base =
      sameTier.length >= OPTION_COUNT - 1 ? sameTier : withoutTarget;
    const sameSubregion = base.filter(
      (c) => c.subregion === target.subregion,
    );
    const sameRegion = base.filter((c) => c.region === target.region);
    const ordered = dedupeCountries([
      ...shuffle(sameSubregion),
      ...shuffle(sameRegion),
      ...shuffle(base),
    ]).map((c) => ({
      key: `capital:${c.code}`,
      label: capitalLabel(c),
    }));

    const name = countryName(target, lang);
    return {
      key: target.code,
      prompt: dict.game.capitalPrompt(name),
      hint:
        target.capital.length > 1
          ? dict.game.capitalHintMulti(target.capital.length)
          : regionLabel(target.region, lang),
      imageSrc: flagSrc(target),
      imageAlt: `${dict.game.answer}: ${name}`,
      reviewImageAlt: `${dict.game.answer}: ${name}`,
      answerKey: answer.key,
      answerLabel: answer.label,
      answers: [
        ...target.capital,
        capitalLabel(target),
        ...target.capital.map((city) => city.split(/[,(]/)[0].trim()),
      ],
      options: buildOptions(answer, ordered),
    };
  });
}

export function subdivisionFlagUrl(item: SubdivisionItem) {
  const country = item.code.slice(0, 2).toUpperCase();
  return `${SUBDIVISION_CDN}/${country}/${item.file}`;
}

export { typeLabel };

export function buildSubdivisionQuestions(
  items: SubdivisionItem[],
  count: number,
  lang: Lang = "id",
): Question[] {
  const dict = getDictionary(lang);
  const playable = items.length >= OPTION_COUNT ? items : [];
  const targets = sample(playable, count);

  return targets.map((target) => {
    const answer: Option = { key: target.code, label: target.name };
    const candidates = items
      .filter((item) => item.code !== target.code)
      .map((item) => ({ key: item.code, label: item.name }));

    return {
      key: target.code,
      prompt: dict.game.subdivisionPrompt,
      hint: target.type ? typeLabel(target.type, lang) : undefined,
      imageSrc: subdivisionFlagUrl(target),
      imageAlt: dict.game.subdivisionAlt,
      reviewImageAlt: `${dict.game.answer}: ${target.name}`,
      answerKey: answer.key,
      answerLabel: answer.label,
      answers: [target.name],
      options: buildOptions(answer, candidates),
    };
  });
}

export function buildSampleQuestion(lang: Lang = "id"): Question {
  const easy = countriesWithCapital.filter((c) => c.difficulty <= 2);
  const [question] = buildFlagQuestions(easy, 1, easy, lang);
  return question;
}

export function scoreAnswer({
  correct,
  secondsLeft,
  secondsTotal,
  streak,
}: {
  correct: boolean;
  secondsLeft: number;
  secondsTotal: number;
  streak: number;
}) {
  if (!correct) return { points: 0, nextStreak: 0 };
  const speed = Math.max(0, Math.min(1, secondsLeft / secondsTotal));
  const timeBonus = Math.round(speed * 60);
  const streakBonus = Math.min(streak, 5) * 10;
  return { points: 100 + timeBonus + streakBonus, nextStreak: streak + 1 };
}

export function timeLimitFor(level: number) {
  return difficultyMeta(level).seconds;
}
