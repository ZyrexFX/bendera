"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/lang-provider";
import { QuizGame } from "@/components/quiz/quiz-game";
import type { AnswerMode } from "@/components/quiz/quiz-game";
import {
  CountSelect,
  LevelSelect,
  ModeSelect,
  RegionSelect,
} from "@/components/quiz/quiz-controls";
import {
  countries,
  countriesWithCapital,
  difficultyLevels,
  difficultyMeta,
  formatNumber,
  regions,
} from "@/lib/countries";
import type { DifficultyLevel } from "@/lib/countries";
import { regionLabel } from "@/lib/i18n";
import { buildCapitalQuestions, buildFlagQuestions } from "@/lib/quiz";
import { playTone } from "@/lib/sound";
import { readBest, readSoundPreference } from "@/lib/storage";

const COUNT_OPTIONS = [10, 20, 30, 50, 100];

type CountValue = number | "all";

export function WorldQuiz({
  kind,
  initialLevel = 1,
}: {
  kind: "flags" | "capitals";
  initialLevel?: DifficultyLevel;
}) {
  const { lang, dict } = useLang();
  const text = dict.setup[kind];
  const basePool = kind === "flags" ? countries : countriesWithCapital;
  const [level, setLevel] = useState<DifficultyLevel>(initialLevel);
  const [region, setRegion] = useState("");
  const [count, setCount] = useState<CountValue>(10);
  const [mode, setMode] = useState<AnswerMode>("choice");
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [roundLang, setRoundLang] = useState(lang);
  const [best, setBest] = useState<{ score: number; correct: number; total: number } | null>(
    null,
  );

  const pool = useMemo(
    () =>
      basePool.filter(
        (country) =>
          country.difficulty === level && (!region || country.region === region),
      ),
    [basePool, level, region],
  );

  const questionCount =
    count === "all" ? pool.length : Math.min(count, pool.length);

  useEffect(() => {
    setCount((current) => {
      if (current === "all") return current;
      return current > pool.length ? "all" : current;
    });
  }, [pool.length]);

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of difficultyLevels) {
      counts[item.level] = basePool.filter(
        (country) =>
          country.difficulty === item.level &&
          (!region || country.region === region),
      ).length;
    }
    return counts;
  }, [basePool, region]);

  const regionOptions = useMemo(
    () => [
      {
        value: "",
        label: dict.setup.allRegions,
        count: basePool.filter((c) => c.difficulty === level).length,
      },
      ...regions.map((item) => ({
        value: item,
        label: regionLabel(item, lang),
        count: basePool.filter(
          (c) => c.difficulty === level && c.region === item,
        ).length,
      })),
    ],
    [basePool, dict.setup.allRegions, lang, level],
  );

  const bestKey = `${kind}:${mode}:${level}:${region || "semua"}:${questionCount}`;
  const bestLabel = `${dict.levels[level].label}, ${dict.result.questions(questionCount)}`;
  const meta = difficultyMeta(level);

  useEffect(() => {
    const entry = readBest(bestKey);
    setBest(entry);
  }, [bestKey, playing]);

  function start() {
    if (pool.length < 4) return;
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
    if (!playing) return [];
    return kind === "flags"
      ? buildFlagQuestions(pool, questionCount, basePool, roundLang)
      : buildCapitalQuestions(pool, questionCount, roundLang);
  }, [basePool, kind, playing, pool, questionCount, round, roundLang]);

  if (playing) {
    return (
      <div className="wrap">
        <QuizGame
          key={round}
          questions={questions}
          seconds={meta.seconds}
          title={kind === "flags" ? dict.game.flagsTitle : dict.game.capitalsTitle}
          subtitle={`${dict.levels[level].label} · ${dict.result.questions(
            questions.length,
          )}${region ? ` · ${regionLabel(region, lang)}` : ""}`}
          bestKey={bestKey}
          bestLabel={bestLabel}
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

  return (
    <div className="wrap pb-20">
      <header className="max-w-2xl pt-10 sm:pt-14">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,7vw,4rem)]">{text.title}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
          {text.description}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <form
          className="flex flex-col gap-7"
          onSubmit={(event) => {
            event.preventDefault();
            start();
          }}
        >
          <LevelSelect value={level} onChange={setLevel} counts={levelCounts} />

          <div className="grid gap-6 sm:grid-cols-2">
            <RegionSelect value={region} onChange={setRegion} options={regionOptions} />
            <CountSelect
              value={count}
              onChange={setCount}
              options={COUNT_OPTIONS}
              available={pool.length}
            />
          </div>

          <ModeSelect value={mode} onChange={setMode} />

          {pool.length < 4 ? (
            <p
              role="status"
              className="rounded-sm border border-danger bg-danger-soft px-3 py-2 text-sm text-ink"
            >
              {dict.setup.notEnough}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pool.length < 4}
              className="min-h-12 rounded-sm bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-45"
            >
              {dict.setup.start}
            </button>
            <p className="text-xs text-muted">
              {pool.length < 4
                ? dict.setup.needFour
                : dict.setup.roundNote(questionCount)}
            </p>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="eyebrow">{dict.setup.scoring}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <li className="flex justify-between gap-4 border-b border-line pb-2">
                <span>{dict.setup.correct}</span>
                <span className="tnum font-semibold text-ink">+100</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-line pb-2">
                <span>{dict.setup.speed}</span>
                <span className="tnum font-semibold text-ink">
                  {dict.setup.speedValue}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>{dict.setup.streak}</span>
                <span className="tnum font-semibold text-ink">
                  {dict.setup.streakValue}
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {dict.setup.scoringNote(meta.seconds)}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">{dict.setup.best}</p>
              <span className="text-[11px] text-muted">{bestLabel}</span>
            </div>
            {best ? (
              <p className="tnum mt-3 text-2xl font-semibold text-ink">
                {formatNumber(best.score, lang)}
                <span className="ml-2 text-sm font-normal text-muted">
                  ({dict.setup.bestCorrect(best.correct, best.total)})
                </span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">{dict.setup.noBest}</p>
            )}
            <p className="mt-3 text-xs text-muted">{dict.setup.bestNote}</p>
          </div>

          <p className="px-1 text-xs leading-relaxed text-muted">
            {mode === "choice" ? dict.setup.keyboard : dict.setup.keyboardTyped}
          </p>
        </aside>
      </div>
    </div>
  );
}
