import rawCountries from "@/data/countries.json";
import rawSubdivisions from "@/data/subdivision-summary.json";
import type { Lang } from "@/lib/i18n";

export type Country = {
  code: string;
  alpha3: string;
  numeric: string;
  name: string;
  nameEn: string;
  capital: string[];
  region: string;
  subregion: string;
  area: number;
  latlng: number[];
  difficulty: 1 | 2 | 3 | 4;
  independent: boolean;
  unMember: boolean;
  flag: string;
  colors: string[];
};

export type SubdivisionCountry = {
  code: string;
  name: string;
  count: number;
};

export const countries = rawCountries as Country[];
export const subdivisionCountries = rawSubdivisions as SubdivisionCountry[];

export const countryByCode = new Map(countries.map((c) => [c.code, c]));

export const countriesWithCapital = countries.filter((c) => c.capital.length > 0);

export const subdivisionTotal = subdivisionCountries.reduce(
  (total, item) => total + item.count,
  0,
);

export const regions = [
  "Afrika",
  "Amerika",
  "Asia",
  "Eropa",
  "Oseania",
  "Antarktika",
] as const;

export const difficultyLevels = [
  { level: 1 as const, seconds: 20 },
  { level: 2 as const, seconds: 18 },
  { level: 3 as const, seconds: 15 },
  { level: 4 as const, seconds: 12 },
];

export type DifficultyLevel = (typeof difficultyLevels)[number]["level"];

export function difficultyMeta(level: number) {
  return difficultyLevels.find((item) => item.level === level) ?? difficultyLevels[0];
}

export function countByDifficulty(level: number, pool: Country[] = countries) {
  return pool.filter((c) => c.difficulty === level).length;
}

export function flagSrc(country: Country) {
  return `/flags/${country.flag}`;
}

export function countryName(country: Country, lang: Lang = "id") {
  return lang === "en" ? country.nameEn : country.name;
}

export function formatNumber(value: number, lang: Lang = "id") {
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "id-ID").format(value);
}
