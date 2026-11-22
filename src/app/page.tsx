import Link from "next/link";
import { SampleQuiz } from "@/components/home/sample-quiz";
import { FlagImage } from "@/components/flag-image";
import {
  CapitalIcon,
  CardsIcon,
  FlagIcon,
  LayersIcon,
} from "@/components/icons";
import {
  countries,
  countriesWithCapital,
  countryByCode,
  countryName,
  difficultyLevels,
  formatNumber,
  subdivisionCountries,
  subdivisionTotal,
} from "@/lib/countries";
import { buildSampleQuestion } from "@/lib/quiz";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";

const flagCardFlags = ["jp", "br", "ke"]
  .map((code) => countryByCode.get(code))
  .filter(Boolean);
const capitalCardFlags = ["fr", "in", "mx"]
  .map((code) => countryByCode.get(code))
  .filter(Boolean);

export default async function HomePage() {
  const lang = await getLang();
  const dict = getDictionary(lang);
  const sample = buildSampleQuestion(lang);

  const levelRows = difficultyLevels.map((level) => {
    const pool = countries.filter((country) => country.difficulty === level.level);
    return {
      ...level,
      ...dict.levels[level.level],
      count: pool.length,
      examples: pool.slice(0, 3),
    };
  });

  return (
    <div className="pb-4">
      <section className="wrap grid gap-10 pb-14 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-16">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-6 bg-accent" />
            {dict.home.eyebrow}
          </p>
          <h1 className="display mt-4 text-[clamp(2.7rem,8vw,4.6rem)]">
            {dict.home.title}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
            {dict.home.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/bendera"
              className="inline-flex min-h-12 items-center rounded-sm bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              {dict.home.startFlags}
            </Link>
            <Link
              href="/latihan"
              className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              {dict.home.practiceCta}
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-5">
            <div>
              <dt className="text-xs text-muted">{dict.home.statCountries}</dt>
              <dd className="tnum mt-1 text-lg font-semibold">{countries.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.home.statSubdivisions}</dt>
              <dd className="tnum mt-1 text-lg font-semibold">
                {formatNumber(subdivisionTotal, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.home.statCapitals}</dt>
              <dd className="tnum mt-1 text-lg font-semibold">
                {countriesWithCapital.length}
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:pl-2">
          <SampleQuiz initial={sample} />
        </div>
      </section>

      <section className="wrap mt-6" aria-labelledby="pilih-permainan">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <h2 id="pilih-permainan" className="display text-3xl sm:text-4xl">
            {dict.home.pickGame}
          </h2>
          <p className="text-sm text-muted">{dict.home.pickGameNote}</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          <Link
            href="/bendera"
            className="group card relative overflow-hidden p-5 transition-colors hover:border-accent sm:p-6 lg:col-span-3"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-10 place-items-center rounded-sm border border-line bg-canvas text-ink">
                <FlagIcon className="size-5" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {dict.home.flagsTag}
              </span>
            </div>
            <h3 className="display mt-8 text-3xl sm:text-4xl">
              {dict.home.flagsTitle}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {dict.home.flagsDescription}
            </p>
            <div className="mt-7 grid grid-cols-3 gap-2">
              {flagCardFlags.map((country) =>
                country ? (
                  <FlagImage
                    key={country.code}
                    src={`/flags/${country.flag}`}
                    alt={countryName(country, lang)}
                    plateClassName="p-1 transition-transform duration-200 group-hover:-translate-y-0.5"
                  />
                ) : null,
              )}
            </div>
            <p className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
              <span>{dict.home.flagsMeta(countries.length)}</span>
              <span className="font-semibold text-ink group-hover:text-accent">
                {dict.home.openQuiz}
              </span>
            </p>
          </Link>

          <Link
            href="/ibu-kota"
            className="group card relative overflow-hidden p-5 transition-colors hover:border-accent sm:p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-10 place-items-center rounded-sm border border-line bg-canvas text-ink">
                <CapitalIcon className="size-5" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {dict.home.capitalsTag}
              </span>
            </div>
            <h3 className="display mt-8 text-3xl">{dict.home.capitalsTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {dict.home.capitalsDescription}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {capitalCardFlags.map((country) =>
                country ? (
                  <FlagImage
                    key={country.code}
                    src={`/flags/${country.flag}`}
                    alt={countryName(country, lang)}
                    plateClassName="p-1 transition-transform duration-200 group-hover:-translate-y-0.5"
                  />
                ) : null,
              )}
            </div>
            <p className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
              <span>{dict.home.capitalsMeta(countriesWithCapital.length)}</span>
              <span className="font-semibold text-ink group-hover:text-accent">
                {dict.home.openQuiz}
              </span>
            </p>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/negara-bagian"
            className="group flex items-center gap-4 rounded-md border border-line bg-surface p-4 transition-colors hover:border-accent sm:p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-line bg-canvas text-ink">
              <LayersIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {dict.home.subdivisionsTitle}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {dict.home.subdivisionsMeta(
                  formatNumber(subdivisionTotal, lang),
                  subdivisionCountries.length,
                )}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-ink-soft group-hover:text-accent">
              {dict.home.subdivisionsCta}
            </span>
          </Link>

          <Link
            href="/latihan"
            className="group flex items-center gap-4 rounded-md border border-line bg-surface p-4 transition-colors hover:border-accent sm:p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-line bg-canvas text-ink">
              <CardsIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {dict.home.practiceTitle}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {dict.home.practiceDescription}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-ink-soft group-hover:text-accent">
              {dict.home.practiceCtaCard}
            </span>
          </Link>
        </div>
      </section>

      <section className="wrap mt-20" aria-labelledby="tingkat-kesulitan">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <p className="eyebrow">{dict.home.difficultyEyebrow}</p>
            <h2 id="tingkat-kesulitan" className="display mt-3 text-3xl sm:text-4xl">
              {dict.home.difficultyTitle}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {dict.home.difficultyDescription}
            </p>
            <Link href="/tentang" className="link-underline mt-4 inline-block text-sm text-ink">
              {dict.home.difficultyLink}
            </Link>
          </div>

          <ol className="border-t border-line">
            {levelRows.map((row) => (
              <li key={row.level}>
                <Link
                  href={`/bendera?level=${row.level}`}
                  className="group grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 border-b border-line py-4 transition-colors hover:bg-surface sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-2"
                >
                  <span className="tnum mt-1 text-xs font-semibold text-muted sm:mt-0">
                    0{row.level}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-base font-semibold text-ink">
                        {row.label}
                      </span>
                      <span className="tnum text-xs text-muted">
                        {dict.home.difficultyRowMeta(row.count, row.seconds)}
                      </span>
                    </span>
                    <span className="mt-1 block max-w-md text-[13px] leading-snug text-muted">
                      {row.description}
                    </span>
                  </span>
                  <span className="col-span-2 flex gap-1.5 sm:col-span-1">
                    {row.examples.map((country) => (
                      <FlagImage
                        key={country.code}
                        src={`/flags/${country.flag}`}
                        alt={countryName(country, lang)}
                        plateClassName="w-10 p-0.5"
                      />
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap mt-20" aria-labelledby="cakupan-data">
        <div className="grid gap-6 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p id="cakupan-data" className="eyebrow">
              {dict.home.dataEyebrow}
            </p>
            <p className="display mt-2 text-4xl">{countries.length}</p>
            <p className="mt-1 text-sm text-muted">{dict.home.dataCountries}</p>
          </div>
          <div>
            <p className="eyebrow">{dict.home.dataFlags}</p>
            <p className="display mt-2 text-4xl">{countries.length}</p>
            <p className="mt-1 text-sm text-muted">{dict.home.dataFlagsUnit}</p>
          </div>
          <div>
            <p className="eyebrow">{dict.home.dataSubdivisions}</p>
            <p className="display mt-2 text-4xl">
              {formatNumber(subdivisionTotal, lang)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {dict.home.dataSubdivisionsUnit(subdivisionCountries.length)}
            </p>
          </div>
          <div>
            <p className="eyebrow">{dict.home.dataRegions}</p>
            <p className="display mt-2 text-4xl">6</p>
            <p className="mt-1 text-sm text-muted">{dict.home.dataRegionsUnit}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {dict.home.dataNote}{" "}
          <Link href="/tentang" className="link-underline">
            {dict.home.dataNoteLink}
          </Link>
          .
        </p>
      </section>

      <section className="wrap mt-20" aria-labelledby="latihan-dulu">
        <div className="card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">{dict.home.practiceEyebrow}</p>
              <h2 id="latihan-dulu" className="display mt-2 text-2xl sm:text-3xl">
                {dict.home.practiceTitleCta}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {dict.home.practiceDescriptionCta}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/latihan"
                className="inline-flex min-h-11 items-center rounded-sm bg-ink px-5 text-sm font-semibold text-canvas transition-opacity hover:opacity-85"
              >
                {dict.home.practiceOpen}
              </Link>
              <Link
                href="/negara-bagian"
                className="inline-flex min-h-11 items-center rounded-sm border border-line-strong px-5 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
              >
                {dict.home.practiceSubdivisions}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
