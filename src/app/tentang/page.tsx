import Link from "next/link";
import type { Metadata } from "next";
import {
  countries,
  countriesWithCapital,
  difficultyLevels,
  formatNumber,
  subdivisionCountries,
  subdivisionTotal,
} from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const dict = getDictionary(lang);
  return {
    title: dict.meta.pageTitles.about,
    description: `${dict.about.title} ${dict.about.description}`,
  };
}

export default async function AboutPage() {
  const lang = await getLang();
  const dict = getDictionary(lang);
  const counts = difficultyLevels.map((level) => ({
    ...level,
    ...dict.levels[level.level],
    count: countries.filter((country) => country.difficulty === level.level).length,
  }));

  return (
    <div className="wrap pb-20">
      <header className="max-w-2xl pt-10 sm:pt-14">
        <p className="eyebrow">{dict.about.eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,7vw,4rem)]">
          {dict.about.title}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
          {dict.about.description}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="max-w-2xl">
          <section aria-labelledby="sumber-data">
            <h2 id="sumber-data" className="display text-2xl sm:text-3xl">
              {dict.about.sourceTitle}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft">
              <p>
                {dict.about.sourceFlags.split("iso3166-flags")[0]}
                <a
                  href="https://github.com/amckenna41/iso3166-flags"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline font-medium text-ink"
                >
                  iso3166-flags
                </a>
                {dict.about.sourceFlags.split("iso3166-flags").slice(1).join("iso3166-flags")}
              </p>
              <p>
                {dict.about.sourceCountries.split("mledoze/countries")[0]}
                <a
                  href="https://github.com/mledoze/countries"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline font-medium text-ink"
                >
                  mledoze/countries
                </a>
                {dict.about.sourceCountries
                  .split("mledoze/countries")
                  .slice(1)
                  .join("mledoze/countries")}
              </p>
              <p>{dict.about.sourceBuild}</p>
              <p>{dict.about.exclusions}</p>
            </div>
          </section>

          <section className="mt-10 border-t border-line pt-8" aria-labelledby="angka">
            <h2 id="angka" className="display text-2xl sm:text-3xl">
              {dict.about.numbersTitle}
            </h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-muted">{dict.about.numbersCountries}</dt>
                <dd className="tnum text-lg font-semibold">{countries.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-muted">{dict.about.numbersCapitals}</dt>
                <dd className="tnum text-lg font-semibold">
                  {countriesWithCapital.length}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-muted">
                  {dict.about.numbersSubdivisions}
                </dt>
                <dd className="tnum text-lg font-semibold">
                  {formatNumber(subdivisionTotal, lang)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-muted">
                  {dict.about.numbersSubdivisionCountries}
                </dt>
                <dd className="tnum text-lg font-semibold">
                  {subdivisionCountries.length}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-10 border-t border-line pt-8" aria-labelledby="kesulitan">
            <h2 id="kesulitan" className="display text-2xl sm:text-3xl">
              {dict.about.difficultyTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {dict.about.difficultyBody}
            </p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {counts.map((level) => (
                <li
                  key={level.level}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                >
                  <span className="text-sm font-semibold text-ink">
                    {level.level}. {level.label}
                  </span>
                  <span className="text-xs text-muted">
                    {dict.about.difficultyMeta(level.seconds)}
                  </span>
                  <span className="tnum text-sm text-ink-soft">
                    {dict.about.difficultyCount(level.count)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {dict.about.difficultyNote}
            </p>
          </section>

          <section className="mt-10 border-t border-line pt-8" aria-labelledby="skor">
            <h2 id="skor" className="display text-2xl sm:text-3xl">
              {dict.about.scoreTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {dict.about.scoreBody}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {dict.about.scoreStorage}
            </p>
          </section>

          <section className="mt-10 border-t border-line pt-8" aria-labelledby="akses">
            <h2 id="akses" className="display text-2xl sm:text-3xl">
              {dict.about.accessTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {dict.about.accessBody}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {dict.about.accessNote}
            </p>
          </section>

          <section className="mt-10 border-t border-line pt-8" aria-labelledby="teknologi">
            <h2 id="teknologi" className="display text-2xl sm:text-3xl">
              {dict.about.techTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {dict.about.techBody}
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="eyebrow">{dict.about.sidebar}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/bendera" className="link-underline w-fit text-ink">
                {dict.about.sidebarFlags}
              </Link>
              <Link href="/ibu-kota" className="link-underline w-fit text-ink">
                {dict.about.sidebarCapitals}
              </Link>
              <Link href="/negara-bagian" className="link-underline w-fit text-ink">
                {dict.about.sidebarSubdivisions}
              </Link>
              <Link href="/latihan" className="link-underline w-fit text-ink">
                {dict.about.sidebarPractice}
              </Link>
            </div>
          </div>
          <div className="card mt-4 p-4 text-xs leading-relaxed text-muted">
            <p className="font-semibold text-ink-soft">{dict.about.licenseTitle}</p>
            <p className="mt-2">{dict.about.licenseBody}</p>
            <p className="mt-2">{dict.about.licenseFlags}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
