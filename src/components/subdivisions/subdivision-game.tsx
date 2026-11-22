"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlagImage } from "@/components/flag-image";
import { SearchIcon, SpinnerIcon } from "@/components/icons";
import { useLang } from "@/components/lang-provider";
import { QuizGame } from "@/components/quiz/quiz-game";
import type { AnswerMode } from "@/components/quiz/quiz-game";
import { CountSelect, ModeSelect } from "@/components/quiz/quiz-controls";
import {
  countryByCode,
  countryName,
  formatNumber,
  subdivisionCountries,
  subdivisionTotal,
} from "@/lib/countries";
import { typeLabel } from "@/lib/i18n";
import { buildSubdivisionQuestions } from "@/lib/quiz";
import type { SubdivisionItem } from "@/lib/quiz";
import { playTone } from "@/lib/sound";
import { readBest, readSoundPreference } from "@/lib/storage";
import { loadSubdivisionFlags } from "@/lib/subdivisions";

const COUNT_OPTIONS = [10, 20, 30, 50, 100];

type CountValue = number | "all";

export function SubdivisionGame() {
  const { lang, dict } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState<SubdivisionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState<CountValue>(10);
  const [mode, setMode] = useState<AnswerMode>("choice");
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [roundLang, setRoundLang] = useState(lang);
  const [best, setBest] = useState<{ score: number; correct: number; total: number } | null>(
    null,
  );
  const requestRef = useRef(0);

  const country = selected ? countryByCode.get(selected) : null;
  const countryLabel = country ? countryName(country, lang) : "";

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(lang === "en" ? "en" : "id");
    const list = subdivisionCountries.filter((item) => {
      if (!query) return true;
      const parent = countryByCode.get(item.code);
      return (
        item.name.toLocaleLowerCase("id").includes(query) ||
        (parent?.nameEn ?? "").toLocaleLowerCase("en").includes(query) ||
        item.code.includes(query)
      );
    });
    return [...list].sort((a, b) => {
      if (a.code === "id") return -1;
      if (b.code === "id") return 1;
      return countryLabelOf(a.code).localeCompare(
        countryLabelOf(b.code),
        lang === "en" ? "en" : "id",
      );
    });
  }, [lang, search]);

  function countryLabelOf(code: string) {
    const parent = countryByCode.get(code);
    return parent ? countryName(parent, lang) : code.toUpperCase();
  }

  const typeBreakdown = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, number>();
    for (const item of items) {
      const label = item.type ? typeLabel(item.type, lang) : dict.common.other;
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [dict.common.other, items, lang]);

  const questionCount =
    count === "all" ? (items?.length ?? 0) : Math.min(count, items?.length ?? 0);

  useEffect(() => {
    if (!items) return;
    setCount((current) => {
      if (current === "all") return current;
      return current > items.length ? "all" : current;
    });
  }, [items]);

  const bestKey =
    selected && items
      ? `subdiv:${mode}:${selected}:${questionCount}`
      : "";

  useEffect(() => {
    if (!bestKey) {
      setBest(null);
      return;
    }
    setBest(readBest(bestKey));
  }, [bestKey, playing]);

  useEffect(() => {
    if (!selected) return;
    setPlaying(false);
    setItems(null);
    setError(false);
    setCount(10);
    setMode("choice");

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);

    loadSubdivisionFlags(selected)
      .then((nextItems) => {
        if (requestRef.current !== requestId) return;
        setItems(nextItems);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setError(true);
      })
      .finally(() => {
        if (requestRef.current !== requestId) return;
        setLoading(false);
      });
  }, [selected]);

  function retry() {
    if (!selected) return;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setError(false);
    setLoading(true);
    loadSubdivisionFlags(selected)
      .then((nextItems) => {
        if (requestRef.current !== requestId) return;
        setItems(nextItems);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setError(true);
      })
      .finally(() => {
        if (requestRef.current !== requestId) return;
        setLoading(false);
      });
  }

  function start() {
    if (!items || items.length < 4) return;
    setRoundLang(lang);
    setRound((value) => value + 1);
    setPlaying(true);
    if (readSoundPreference()) playTone("start");
  }

  function restart() {
    setRoundLang(lang);
    setRound((value) => value + 1);
    if (readSoundPreference()) playTone("start");
  }

  const questions = useMemo(() => {
    if (!playing || !items) return [];
    return buildSubdivisionQuestions(
      items,
      count === "all" ? items.length : Math.min(count, items.length),
      roundLang,
    );
  }, [count, items, playing, round, roundLang]);

  if (playing && country && questions.length) {
    return (
      <div className="wrap">
        <QuizGame
          key={round}
          questions={questions}
          seconds={18}
          title={dict.game.subdivisionTitle}
          subtitle={`${countryLabel} · ${dict.result.questions(questions.length)}`}
          bestKey={bestKey}
          bestLabel={`${countryLabel}, ${dict.result.questions(questions.length)}`}
          mode={mode}
          onRestart={restart}
          onExit={() => {
            setPlaying(false);
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        />
      </div>
    );
  }

  if (selected && country) {
    return (
      <div className="wrap pb-20">
        <header className="max-w-2xl pt-10 sm:pt-14">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="min-h-10 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            {dict.subdivisions.back}
          </button>
          <div className="mt-4 flex items-start gap-4">
            <div className="w-24 shrink-0 sm:w-28">
              <FlagImage
                src={`/flags/${country.flag}`}
                alt={countryLabel}
                eager
                plateClassName="p-1"
              />
            </div>
            <div>
              <p className="eyebrow">{dict.subdivisions.pageEyebrow}</p>
              <h1 className="display mt-2 text-3xl sm:text-4xl">{countryLabel}</h1>
              <p className="mt-2 text-sm text-muted">
                {loading
                  ? dict.subdivisions.loadingList
                  : items
                    ? dict.subdivisions.available(items.length)
                    : dict.subdivisions.noData}
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-8 flex items-center gap-3 rounded-sm border border-line bg-surface px-4 py-8 text-sm text-muted">
            <SpinnerIcon className="size-5 animate-spin text-accent" />
            {dict.subdivisions.loadingOne(countryLabel)}
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-sm border border-danger bg-danger-soft p-4">
            <p className="text-sm font-semibold text-ink">
              {dict.subdivisions.loadError}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {dict.subdivisions.loadErrorBody}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={retry}
                className="min-h-10 rounded-sm bg-ink px-4 text-sm font-semibold text-canvas"
              >
                {dict.common.retry}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold text-ink"
              >
                {dict.subdivisions.pickOther}
              </button>
            </div>
          </div>
        ) : null}

        {items ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="eyebrow">{dict.subdivisions.roundContent}</p>
                <p className="text-xs text-muted">{dict.subdivisions.cdnNote}</p>
              </div>
              {items.length < 4 ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-ink">
                    {dict.subdivisions.notEnoughTitle}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {dict.subdivisions.notEnoughBody(countryLabel, items.length)}
                  </p>
                  <Link
                    href="/latihan"
                    className="mt-4 inline-flex min-h-10 items-center rounded-sm bg-ink px-4 text-sm font-semibold text-canvas"
                  >
                    {dict.subdivisions.seePractice}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-col gap-6">
                    <CountSelect
                      value={count}
                      onChange={setCount}
                      options={COUNT_OPTIONS}
                      available={items.length}
                    />
                    {items.length > 4 ? (
                      <ModeSelect value={mode} onChange={setMode} />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={start}
                    className="mt-6 min-h-12 w-full rounded-sm bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong sm:w-auto"
                  >
                    {dict.subdivisions.start}
                  </button>
                  <p className="mt-3 text-xs text-muted">
                    {dict.subdivisions.timerNote}
                  </p>
                </>
              )}
            </div>

            <aside className="flex flex-col gap-4">
              <div className="card p-5">
                <p className="eyebrow">{dict.subdivisions.glance}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">{dict.subdivisions.flagTotal}</dt>
                    <dd className="tnum font-semibold">{items.length}</dd>
                  </div>
                  {typeBreakdown.map(([label, amount]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 border-b border-line pb-2 last:border-b-0 last:pb-0"
                    >
                      <dt className="text-muted">{label}</dt>
                      <dd className="tnum font-semibold">{amount}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="card p-5">
                <p className="eyebrow">{dict.subdivisions.best}</p>
                {best ? (
                  <p className="tnum mt-2 text-2xl font-semibold">
                    {formatNumber(best.score, lang)}
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({best.correct}/{best.total})
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    {dict.subdivisions.noBest}
                  </p>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="wrap pb-20">
      <header className="max-w-2xl pt-10 sm:pt-14">
        <p className="eyebrow">{dict.subdivisions.pageEyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,7vw,4rem)]">
          {dict.subdivisions.pageTitle}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
          {dict.subdivisions.pageDescription(
            formatNumber(subdivisionTotal, lang),
            subdivisionCountries.length,
          )}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="cari-negara" className="eyebrow">
            {dict.subdivisions.searchCountry}
          </label>
          <div className="relative mt-2">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="cari-negara"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={dict.subdivisions.searchCountryPlaceholder}
              className="min-h-11 w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 hover:border-line-strong"
            />
          </div>
        </div>
        <p className="text-xs text-muted" aria-live="polite">
          {dict.subdivisions.shown(filteredCountries.length)}
        </p>
      </div>

      {filteredCountries.length === 0 ? (
        <div className="mt-8 rounded-sm border border-line bg-surface p-6">
          <p className="text-sm font-semibold">{dict.subdivisions.noMatch}</p>
          <p className="mt-1 text-sm text-muted">
            {dict.subdivisions.noMatchBody}
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold"
          >
            {dict.subdivisions.clearSearch}
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredCountries.map((item) => {
            const parent = countryByCode.get(item.code);
            const label = countryLabelOf(item.code);
            const playable = item.count >= 4;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  disabled={!playable}
                  onClick={() => setSelected(item.code)}
                  className="group flex w-full flex-col rounded-sm border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent disabled:opacity-55 disabled:hover:border-line"
                >
                  <FlagImage
                    src={parent ? `/flags/${parent.flag}` : undefined}
                    alt={label}
                    plateClassName="p-1"
                  />
                  <span className="mt-2 flex min-w-0 flex-1 items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">
                      {label}
                    </span>
                    <span className="tnum shrink-0 text-xs text-muted">
                      {item.count}
                    </span>
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted">
                    {playable
                      ? dict.subdivisions.playable
                      : dict.subdivisions.needsFour}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
