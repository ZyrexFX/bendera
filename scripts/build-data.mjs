// Builds the local dataset used by the site.
//
// Sources
// - Countries, capitals, region, area: github.com/mledoze/countries (ODbL)
// - Flag files + subdivision names: github.com/amckenna41/iso3166-flags (MIT)
// - Indonesian country names: i18n-iso-countries (id locale, CLDR)
//
// Run with: npm run data

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import isoCountries from "i18n-iso-countries";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(root, "scripts", ".cache");
const flagsDir = path.join(root, "public", "flags");
const subdivDir = path.join(root, "public", "data", "subdivisions");
const dataDir = path.join(root, "src", "data");

const FLAGS_REPO =
  "https://raw.githubusercontent.com/amckenna41/iso3166-flags/main";
const META_BASE = `${FLAGS_REPO}/iso3166-flags-metadata`;

const REGION_ID = {
  Africa: "Afrika",
  Americas: "Amerika",
  Asia: "Asia",
  Europe: "Eropa",
  Oceania: "Oseania",
  Antarctic: "Antarktika",
};

// Editorial difficulty. 1 = paling dikenal, 4 = paling obscurity.
// Tiers are opinionated on purpose: fame of the country + how easy the flag
// is to tell apart from its neighbours. Anything not listed starts at 3.
const EASY = `us gb fr de it es pt nl be ch at se no dk fi ie pl cz gr ru ua tr jp cn kr
in id th vn ph my sg sa ae il eg za ng ke et br ar mx ca au nz cu`.split(/\s+/);
const MEDIUM = `is lu hu ro bg hr rs sk si ee lv lt by kz uz az ge am mn tw hk pk bd
lk np mm kh la bn qa kw om jo lb sy iq ir af ma dz tn ly sd gh ci sn cm ug tz zm zw
mz ao na bw mg mu sc cl pe co ve ec bo py uy gy sr cr pa gt hn sv ni do ht jm tt bs
bb bz fj pg ws to vu sb nc pf gu pr gl fo`.split(/\s+/);
const EXTREME = `aq bv hm tf um gs io ck nu tk nf pn sh eh sj ax cc cx
bl mf pm wf yt re gp mq gf`.split(/\s+/);
const CONFUSABLE = `td ro mc pl nl lu ru si sk hr rs no is au nz co ec ve ie ci
gn gw ml ne td sd ss`.split(/\s+/);
const CONFUSABLE_SET = new Set(CONFUSABLE);

const easy = new Set(EASY);
const medium = new Set(MEDIUM);
const extreme = new Set(EXTREME);

function difficultyFor(code) {
  let tier;
  if (easy.has(code)) tier = 1;
  else if (extreme.has(code)) tier = 4;
  else if (medium.has(code)) tier = 2;
  else tier = 3;
  if (CONFUSABLE_SET.has(code) && tier < 3) tier = 3;
  return tier;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((c) => c.trim() !== ""));
}

async function cachedFetch(url, cacheName) {
  const file = path.join(cacheDir, cacheName);
  try {
    return await fs.readFile(file, "utf8");
  } catch {}
  const res = await fetch(url, {
    headers: { "User-Agent": "bendera-data-builder/1.0" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(file, text);
  return text;
}

async function pool(items, worker, concurrency = 10) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = { error: String(error) };
      }
      if (cursor % 25 === 0) process.stdout.write(".");
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  process.stdout.write("\n");
  return results;
}

async function main() {
  await fs.mkdir(flagsDir, { recursive: true });
  await fs.mkdir(subdivDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  // i18n-iso-countries: Indonesian country names
  const idLocale = JSON.parse(
    await fs.readFile(
      path.join(root, "node_modules/i18n-iso-countries/langs/id.json"),
      "utf8",
    ),
  );
  isoCountries.registerLocale(idLocale);

  console.log("Fetching country list and flag metadata...");
  const rawCountries = JSON.parse(
    await cachedFetch(
      "https://raw.githubusercontent.com/mledoze/countries/master/countries.json",
      "countries.json",
    ),
  );
  const flagMeta = parseCsv(
    await cachedFetch(`${META_BASE}/iso3166_1_flag_metadata.csv`, "iso1.csv"),
  );
  const flagExt = new Map();
  const flagColors = new Map();
  for (const row of flagMeta.slice(1)) {
    const code = row[0]?.trim().toLowerCase();
    const ext = row[3]?.trim().toLowerCase();
    if (code && ext) flagExt.set(code, ext);
    if (code) {
      const colors = [...new Set(
        (row[9] ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter((value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) || /^rgb\(/i.test(value)),
      )].slice(0, 12);
      flagColors.set(code, colors);
    }
  }
  const subMeta = parseCsv(
    await cachedFetch(`${META_BASE}/iso3166_2_flag_metadata.csv`, "iso2.csv"),
  );
  const excludedSubdivisions = new Set(
    (
      JSON.parse(
        await fs.readFile(path.join(root, "scripts", "exclusions.json"), "utf8"),
      ).subdivisions ?? []
    ).map((item) => item.code),
  );

  const NAME_OVERRIDES = {
    gb: "Britania Raya",
    us: "Amerika Serikat",
    kr: "Korea Selatan",
    kp: "Korea Utara",
    cz: "Ceko",
    nl: "Belanda",
    ae: "Uni Emirat Arab",
    cd: "Republik Demokratik Kongo",
    cg: "Republik Kongo",
    la: "Laos",
    mm: "Myanmar",
    sz: "Eswatini",
    cv: "Tanjung Verde",
    ci: "Pantai Gading",
    tl: "Timor Leste",
    va: "Vatikan",
    ru: "Rusia",
    sy: "Suriah",
    ir: "Iran",
    vn: "Vietnam",
  };

  const countries = [];
  const usedFlagCodes = new Set();

  for (const c of rawCountries) {
    if (!c.cca2) continue;
    const code = c.cca2.toLowerCase();
    const ext = flagExt.get(code) ?? "svg";
    const file = `${code}.${ext}`;

    // Make sure the dataset really ships this file before referencing it.
    const flagFile = await ensureFlag(code, ext, file);
    if (!flagFile) {
      console.warn(`\n  missing flag for ${code}, skipped`);
      continue;
    }
    usedFlagCodes.add(code);

    const name =
      NAME_OVERRIDES[code] ||
      isoCountries.getName(c.cca2, "id", { select: "official" }) ||
      isoCountries.getName(c.cca2, "id") ||
      c.name.common;

    countries.push({
      code,
      alpha3: c.cca3 ?? "",
      numeric: c.ccn3 ?? "",
      name,
      nameEn: c.name.common,
      capital: Array.isArray(c.capital) ? c.capital : [],
      region: REGION_ID[c.region] ?? c.region ?? "Lainnya",
      subregion: c.subregion ?? "",
      area: typeof c.area === "number" ? c.area : 0,
      latlng: Array.isArray(c.latlng) ? c.latlng : [],
      difficulty: difficultyFor(code),
      independent: Boolean(c.independent),
      unMember: Boolean(c.unMember),
      flag: file,
      colors: flagColors.get(code) ?? [],
    });
  }

  countries.sort((a, b) => a.name.localeCompare(b.name, "id"));
  console.log(`Countries ready: ${countries.length}`);

  // --- Subdivisions -------------------------------------------------------
  const byCountry = new Map();
  let excludedCount = 0;
  for (const row of subMeta.slice(1)) {
    const code = row[0]?.trim();
    const fileName = row[1]?.trim();
    const ext = row[3]?.trim()?.toLowerCase();
    if (!code || !fileName) continue;
    if (excludedSubdivisions.has(code)) {
      excludedCount += 1;
      continue;
    }
    const cc = code.slice(0, 2);
    if (!byCountry.has(cc)) byCountry.set(cc, []);
    byCountry.get(cc).push({ code, file: fileName, ext });
  }
  if (excludedCount) {
    console.log(`Excluded ${excludedCount} subdivision flags that reuse the parent flag`);
  }

  const countryByCode = new Map(countries.map((c) => [c.code, c]));
  const subdivisionSummary = [];
  const dirs = [...byCountry.keys()].filter((cc) =>
    countryByCode.has(cc.toLowerCase()),
  );

  console.log(`Fetching ${dirs.length} subdivision lists...`);
  const readmes = await pool(
    dirs,
    (cc) => cachedFetch(`${FLAGS_REPO}/iso3166-2-flags/${cc}/README.md`, `sub-${cc}.md`),
    8,
  );

  for (let i = 0; i < dirs.length; i += 1) {
    const cc = dirs[i];
    const country = countryByCode.get(cc.toLowerCase());
    const readme = typeof readmes[i] === "string" ? readmes[i] : "";
    const nameMap = new Map();
    const typeMap = new Map();
    const rowRe = /^\|\s*([A-Z]{2}-[A-Z0-9]+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/gm;
    let match;
    while ((match = rowRe.exec(readme))) {
      nameMap.set(match[1], match[2].trim());
      typeMap.set(match[1], match[3].trim());
    }

    const items = byCountry
      .get(cc)
      .map((s) => ({
        code: s.code,
        name: nameMap.get(s.code) || s.code,
        type: typeMap.get(s.code) || "",
        file: s.file,
        ext: s.ext,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "id"));

    if (!items.length) continue;

    await fs.writeFile(
      path.join(subdivDir, `${cc.toLowerCase()}.json`),
      JSON.stringify({ country: cc.toLowerCase(), items }),
    );

    subdivisionSummary.push({
      code: cc.toLowerCase(),
      name: country.name,
      count: items.length,
    });
  }

  subdivisionSummary.sort((a, b) => a.name.localeCompare(b.name, "id"));

  await fs.writeFile(
    path.join(dataDir, "subdivision-summary.json"),
    JSON.stringify(subdivisionSummary),
  );

  const counts = countries.reduce(
    (acc, c) => {
      acc[c.difficulty] = (acc[c.difficulty] ?? 0) + 1;
      acc.regions[c.region] = (acc.regions[c.region] ?? 0) + 1;
      return acc;
    },
    { regions: {} },
  );

  await fs.writeFile(
    path.join(dataDir, "countries.json"),
    JSON.stringify(countries, null, 2),
  );

  console.log("Difficulty spread:", {
    1: counts[1] ?? 0,
    2: counts[2] ?? 0,
    3: counts[3] ?? 0,
    4: counts[4] ?? 0,
  });
  console.log("Regions:", counts.regions);
  console.log(
    `Subdivision countries: ${subdivisionSummary.length}, flags: ${subdivisionSummary.reduce(
      (n, s) => n + s.count,
      0,
    )}`,
  );
  console.log("Done.");
}

async function ensureFlag(code, ext, file) {
  const target = path.join(flagsDir, file);
  try {
    await fs.access(target);
    return file;
  } catch {}
  try {
    const res = await fetch(`${FLAGS_REPO}/iso3166-1-flags/${file}`, {
      headers: { "User-Agent": "bendera-data-builder/1.0" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(target, buf);
    return file;
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
