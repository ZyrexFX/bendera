"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DifficultyLabel, FlagImage } from "@/components/flag-image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  SearchIcon,
} from "@/components/icons";
import { useLang } from "@/components/lang-provider";
import { DetailDialog } from "@/components/practice/detail-dialog";
import {
  countries,
  countryName,
  difficultyLevels,
  formatNumber,
  regions,
} from "@/lib/countries";
import type { Country } from "@/lib/countries";
import { regionLabel, subregionLabel } from "@/lib/i18n";

export function PracticeWorld() {
  const { lang, dict } = useLang();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [level, setLevel] = useState("");
  const [openCode, setOpenCode] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return countries.filter((country) => {
      if (region && country.region !== region) return false;
      if (level && country.difficulty !== Number(level)) return false;
      if (!query) return true;
      return (
        country.name.toLocaleLowerCase("id").includes(query) ||
        country.nameEn.toLocaleLowerCase("en").includes(query) ||
        country.capital.join(" ").toLocaleLowerCase("id").includes(query) ||
        country.alpha3.toLocaleLowerCase("en").includes(query)
      );
    });
  }, [level, region, search]);

  const selectedIndex = openCode
    ? filtered.findIndex((country) => country.code === openCode)
    : -1;
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;

  function step(direction: 1 | -1) {
    if (selectedIndex < 0 || filtered.length === 0) return;
    const nextIndex =
      (selectedIndex + direction + filtered.length) % filtered.length;
    setOpenCode(filtered[nextIndex].code);
  }

  function reset() {
    setSearch("");
    setRegion("");
    setLevel("");
  }

  return (
    <div>
      <div className="grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <label htmlFor="cari-dunia" className="eyebrow">
            {dict.practice.searchWorld}
          </label>
          <div className="relative mt-2">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="cari-dunia"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={dict.practice.searchWorldPlaceholder}
              className="min-h-11 w-full rounded-sm border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 hover:border-line-strong"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-kawasan" className="eyebrow">
            {dict.practice.region}
          </label>
          <select
            id="filter-kawasan"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-sm border border-line bg-canvas px-3 text-sm text-ink hover:border-line-strong"
          >
            <option value="">{dict.practice.allRegions}</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {regionLabel(item, lang)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-tingkat" className="eyebrow">
            {dict.practice.level}
          </label>
          <select
            id="filter-tingkat"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-sm border border-line bg-canvas px-3 text-sm text-ink hover:border-line-strong"
          >
            <option value="">{dict.practice.allLevels}</option>
            {difficultyLevels.map((item) => (
              <option key={item.level} value={item.level}>
                {dict.levels[item.level].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted" aria-live="polite">
          {dict.practice.shown(filtered.length)}
        </p>
        <p className="text-xs text-muted">{dict.practice.clickCard}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-sm border border-line bg-surface p-6">
          <p className="text-sm font-semibold">{dict.practice.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted">{dict.practice.emptyBody}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold"
          >
            {dict.practice.resetFilters}
          </button>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((country) => (
            <li key={country.code}>
              <button
                type="button"
                onClick={() => setOpenCode(country.code)}
                className="group flex h-full w-full flex-col rounded-sm border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent"
              >
                <FlagImage
                  src={`/flags/${country.flag}`}
                  alt={countryName(country, lang)}
                  plateClassName="p-1"
                />
                <span className="mt-2 block truncate text-sm font-semibold text-ink">
                  {countryName(country, lang)}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {country.capital.join(", ") || dict.practice.noCapital}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <DetailDialog
        open={Boolean(selected)}
        onClose={() => setOpenCode(null)}
        label={
          selected
            ? `${dict.practice.detail} ${countryName(selected, lang)}`
            : dict.practice.detail
        }
      >
        {selected ? (
          <CountryDetail
            country={selected}
            position={dict.practice.detailOf(selectedIndex + 1, filtered.length)}
            onClose={() => setOpenCode(null)}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        ) : null}
      </DetailDialog>
    </div>
  );
}

function CountryDetail({
  country,
  position,
  onClose,
  onPrev,
  onNext,
}: {
  country: Country;
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { lang, dict } = useLang();
  const name = countryName(country, lang);
  const showEnglish = lang === "id" && country.nameEn !== country.name;

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">
          {dict.practice.detail} · {position}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.practice.closeDetail}
          className="grid size-9 place-items-center rounded-sm border border-line text-ink-soft hover:border-line-strong"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[220px_1fr] sm:items-start">
        <FlagImage
          src={`/flags/${country.flag}`}
          alt={name}
          eager
          plateClassName="mx-auto w-full max-w-[260px] p-1.5 shadow-[4px_4px_0_0_var(--line)] sm:mx-0 sm:max-w-none"
        />
        <div>
          <h2 className="display text-3xl">{name}</h2>
          {showEnglish ? (
            <p className="mt-1 text-sm text-muted">{country.nameEn}</p>
          ) : null}
          <div className="mt-3">
            <DifficultyLabel level={country.difficulty} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">{dict.practice.capital}</dt>
              <dd className="mt-0.5 font-medium">
                {country.capital.join(", ") || dict.common.none}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.practice.isoCode}</dt>
              <dd className="tnum mt-0.5 font-medium uppercase">
                {country.code} / {country.alpha3}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.practice.regionLabel}</dt>
              <dd className="mt-0.5 font-medium">
                {regionLabel(country.region, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.practice.subregion}</dt>
              <dd className="mt-0.5 font-medium">
                {country.subregion
                  ? subregionLabel(country.subregion, lang)
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.practice.area}</dt>
              <dd className="tnum mt-0.5 font-medium">
                {country.area
                  ? `${formatNumber(country.area, lang)} km²`
                  : dict.common.notRecorded}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{dict.practice.membership}</dt>
              <dd className="mt-0.5 font-medium">
                {country.unMember
                  ? dict.practice.unMember
                  : dict.practice.notUnMember}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-line px-3 text-sm font-medium hover:border-line-strong"
          >
            <ChevronLeftIcon className="size-4" />
            {dict.common.previous}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-line px-3 text-sm font-medium hover:border-line-strong"
          >
            {dict.common.next}
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
        <Link
          href={`/bendera?level=${country.difficulty}`}
          className="min-h-10 text-sm font-semibold text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent"
        >
          {dict.practice.quizAtLevel(dict.levels[country.difficulty].label)}
        </Link>
      </div>
    </div>
  );
}
