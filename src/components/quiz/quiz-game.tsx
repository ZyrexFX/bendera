"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FlagImage } from "@/components/flag-image";
import { CheckIcon, CrossIcon, SoundIcon } from "@/components/icons";
import { useLang } from "@/components/lang-provider";
import { formatNumber } from "@/lib/countries";
import type { Question } from "@/lib/quiz";
import { matchesAnswer, scoreAnswer } from "@/lib/quiz";
import { playTone } from "@/lib/sound";
import { readSoundPreference, recordBest, saveSoundPreference } from "@/lib/storage";

export type AnswerMode = "choice" | "typed";

type AnswerRecord = {
  optionKey: string | null;
  givenText: string | null;
  correct: boolean;
  points: number;
  secondsLeft: number;
  reason: "correct" | "wrong" | "timeout" | "skip";
};

type Summary = {
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  maxStreak: number;
  isRecord: boolean;
  previousScore: number | null;
};

export function QuizGame({
  questions,
  seconds,
  title,
  subtitle,
  bestKey,
  bestLabel,
  mode = "choice",
  onRestart,
  onExit,
}: {
  questions: Question[];
  seconds: number;
  title: string;
  subtitle: string;
  bestKey: string;
  bestLabel: string;
  mode?: AnswerMode;
  onRestart: () => void;
  onExit: () => void;
}) {
  const { lang, dict } = useLang();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "revealed" | "done">(
    "answering",
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const [soundOn, setSoundOn] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  const deadlineRef = useRef(0);
  const submittedRef = useRef(false);
  const submitRef = useRef<
    (optionKey: string | null, givenText: string | null, timedOut?: boolean) => void
  >(() => {});
  const nextRef = useRef<() => void>(() => {});
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const question = questions[index];

  useEffect(() => {
    setSoundOn(readSoundPreference());
    // Setup screens can be long. A new round should start at the top.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const submit = useCallback(
    (optionKey: string | null, givenText: string | null, timedOut = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const current = questions[index];
      if (!current) return;

      const written = givenText?.trim() ?? "";
      const correct =
        optionKey !== null
          ? optionKey === current.answerKey
          : written
            ? matchesAnswer(written, current.answers)
            : false;
      const reason: AnswerRecord["reason"] = correct
        ? "correct"
        : timedOut
          ? "timeout"
          : written
            ? "wrong"
            : "skip";

      const left = Math.max(
        0,
        (deadlineRef.current - performance.now()) / 1000,
      );
      const { points, nextStreak } = scoreAnswer({
        correct,
        secondsLeft: left,
        secondsTotal: seconds,
        streak,
      });

      setSelected(optionKey);
      setAnswers((current_answers) => [
        ...current_answers,
        {
          optionKey,
          givenText: written || null,
          correct,
          points,
          secondsLeft: left,
          reason,
        },
      ]);
      setScore((value) => value + points);
      setStreak(nextStreak);
      setMaxStreak((value) => Math.max(value, nextStreak));
      setPhase("revealed");

      if (soundOn) playTone(correct ? "correct" : "wrong");
    },
    [index, questions, seconds, soundOn, streak],
  );
  submitRef.current = submit;

  const finish = useCallback(() => {
    const total = questions.length;
    const correct = answers.filter((answer) => answer.correct).length;
    const finalScore = answers.reduce((sum, answer) => sum + answer.points, 0);
    const previous = recordBest(bestKey, {
      score: finalScore,
      correct,
      total,
      at: new Date().toISOString(),
    });
    setSummary({
      score: finalScore,
      correct,
      total,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      maxStreak,
      isRecord: previous.isRecord,
      previousScore: previous.isRecord ? null : previous.best.score,
    });
    setPhase("done");
    window.scrollTo({ top: 0, behavior: "auto" });
    if (soundOn) playTone("finish");
  }, [answers, bestKey, maxStreak, questions.length, soundOn]);

  const next = useCallback(() => {
    if (phase !== "revealed") return;
    if (index + 1 >= questions.length) {
      finish();
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setTyped("");
    setPhase("answering");
  }, [finish, index, phase, questions.length]);
  nextRef.current = next;

  useEffect(() => {
    if (phase !== "answering") return;
    submittedRef.current = false;
    deadlineRef.current = performance.now() + seconds * 1000;
    setSecondsLeft(seconds);

    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        (deadlineRef.current - performance.now()) / 1000,
      );
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        submitRef.current(null, null, true);
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [index, phase, seconds]);

  useEffect(() => {
    if (phase === "revealed") {
      nextButtonRef.current?.focus({ preventScroll: true });
    }
    if (phase === "answering" && mode === "typed") {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [index, mode, phase]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        /^(input|textarea|select)$/i.test(target.tagName)
      ) {
        return;
      }
      if (
        mode === "choice" &&
        phase === "answering" &&
        /^[1-4]$/.test(event.key)
      ) {
        const option = question?.options[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          submitRef.current(option.key, null);
        }
      }
      if (phase === "revealed" && event.key === "Enter") {
        event.preventDefault();
        nextRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, phase, question]);

  function toggleSound() {
    const nextValue = !soundOn;
    setSoundOn(nextValue);
    saveSoundPreference(nextValue);
    if (nextValue) playTone("tap");
  }

  if (phase === "done" && summary) {
    return (
      <ResultView
        summary={summary}
        questions={questions}
        answers={answers}
        title={title}
        subtitle={subtitle}
        bestLabel={bestLabel}
        onRestart={onRestart}
        onExit={onExit}
      />
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="display text-3xl">{dict.game.noQuestionsTitle}</h1>
        <p className="mt-3 text-muted">{dict.game.noQuestionsBody}</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-6 min-h-11 rounded-sm bg-accent px-5 text-sm font-semibold text-on-accent"
        >
          {dict.game.changeChoice}
        </button>
      </div>
    );
  }

  const latest = answers[answers.length - 1];
  const answered = phase !== "answering";
  const lowTime = secondsLeft <= 5;
  const percent = Math.max(0, Math.min(100, (secondsLeft / seconds) * 100));

  const feedbackTitle = latest
    ? latest.correct
      ? dict.game.correct(latest.points)
      : latest.reason === "timeout"
        ? dict.game.timeout
        : latest.reason === "skip"
          ? dict.game.skipped
          : dict.game.wrong
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl pb-16 pt-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="min-h-11 rounded-sm px-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          {dict.game.exit}
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? dict.game.soundOn : dict.game.soundOff}
          aria-pressed={soundOn}
          className="grid size-10 place-items-center rounded-sm border border-line text-ink-soft transition-colors hover:border-line-strong"
        >
          <SoundIcon muted={!soundOn} className="size-5" />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {dict.game.question(index + 1, questions.length)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {dict.game.score}{" "}
            <span className="tnum font-semibold text-ink">
              {formatNumber(score, lang)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">{dict.game.streak}</p>
          <p className="tnum mt-1 text-sm font-semibold text-ink">
            {streak > 0 ? `${streak}x` : dict.game.noStreak}
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-[3px] w-full overflow-hidden rounded-[1px] bg-canvas-deep"
        aria-hidden="true"
      >
        <div
          className="h-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <section className="mt-8" aria-labelledby="soal-judul">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 id="soal-judul" className="display text-2xl sm:text-3xl">
            {question.prompt}
          </h1>
          {question.hint ? (
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {question.hint}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-center">
          <FlagImage
            key={`${index}-${question.key}`}
            src={question.imageSrc}
            alt={question.imageAlt ?? dict.game.flagAlt}
            eager
            className="anim-rise max-h-[190px] object-contain sm:max-h-[230px]"
            plateClassName="w-full max-w-[330px] p-2 shadow-[4px_4px_0_0_var(--line)]"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-[5px] w-full overflow-hidden rounded-[1px] bg-canvas-deep"
            aria-hidden="true"
          >
            <div
              className={`h-full transition-[width] duration-100 ease-linear ${
                lowTime ? "bg-danger" : "bg-ink"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span
            className={`tnum w-10 shrink-0 text-right text-sm font-semibold ${
              lowTime ? "text-danger" : "text-ink-soft"
            }`}
            aria-label={dict.game.timeLeft(Math.ceil(secondsLeft))}
          >
            {Math.ceil(secondsLeft)}s
          </span>
        </div>

        {mode === "choice" ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => {
              const isCorrect = option.key === question.answerKey;
              const isPicked = option.key === selected;
              let tone =
                "border-line bg-surface hover:border-line-strong hover:bg-canvas-deep";
              if (answered && isCorrect) {
                tone = "border-success bg-success-soft text-ink";
              } else if (answered && isPicked && !isCorrect) {
                tone = "border-danger bg-danger-soft text-ink";
              } else if (answered) {
                tone = "border-line bg-surface opacity-55";
              }
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={answered}
                  onClick={() => submit(option.key, null)}
                  className={`flex min-h-[60px] items-center gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors ${tone} ${
                    answered && isPicked && !isCorrect ? "anim-nudge" : ""
                  }`}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-[2px] border border-line-strong bg-plate text-[12px] font-semibold text-[#4c4a40]">
                    {optionIndex + 1}
                  </span>
                  <span className="text-[15px] font-medium leading-snug text-ink">
                    {option.label}
                  </span>
                  {answered && isCorrect ? (
                    <CheckIcon className="ml-auto size-5 shrink-0 text-success" />
                  ) : null}
                  {answered && isPicked && !isCorrect ? (
                    <CrossIcon className="ml-auto size-5 shrink-0 text-danger" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                submit(null, typed);
              }}
            >
              <label htmlFor="jawaban-ketik" className="sr-only">
                {dict.game.typeLabel}
              </label>
              <input
                ref={inputRef}
                id="jawaban-ketik"
                type="text"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                disabled={answered}
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="send"
                placeholder={dict.common.answerPlaceholder}
                className="min-h-12 w-full rounded-sm border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/80 transition-colors hover:border-line-strong focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={answered}
                className="min-h-12 shrink-0 rounded-sm bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-45"
              >
                {dict.common.send}
              </button>
            </form>
            {!answered ? (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => submit(null, "")}
                  className="min-h-9 px-1 text-xs font-medium text-muted transition-colors hover:text-ink"
                >
                  {dict.common.skip}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <div aria-live="polite" className="mt-5">
        {answered && latest ? (
          <div
            className={`flex flex-col gap-3 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between ${
              latest.correct
                ? "border-success bg-success-soft"
                : "border-danger bg-danger-soft"
            }`}
          >
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                {latest.correct ? (
                  <CheckIcon className="size-4 text-success" />
                ) : (
                  <CrossIcon className="size-4 text-danger" />
                )}
                {feedbackTitle}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {dict.game.answer}:{" "}
                <span className="font-semibold">{question.answerLabel}</span>
              </p>
              {mode === "typed" && latest.givenText && !latest.correct ? (
                <p className="mt-1 text-xs text-muted">
                  {dict.game.typeLabel}: {latest.givenText}
                </p>
              ) : null}
            </div>
            <button
              ref={nextButtonRef}
              type="button"
              onClick={next}
              className="min-h-11 shrink-0 rounded-sm bg-ink px-5 text-sm font-semibold text-canvas transition-opacity hover:opacity-85"
            >
              {index + 1 >= questions.length
                ? dict.game.seeResult
                : dict.game.nextQuestion}
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-muted">
            {mode === "choice" ? dict.game.choiceHint : dict.game.typedHint}
          </p>
        )}
      </div>
    </div>
  );
}

function ResultView({
  summary,
  questions,
  answers,
  title,
  subtitle,
  bestLabel,
  onRestart,
  onExit,
}: {
  summary: Summary;
  questions: Question[];
  answers: AnswerRecord[];
  title: string;
  subtitle: string;
  bestLabel: string;
  onRestart: () => void;
  onExit: () => void;
}) {
  const { lang, dict } = useLang();

  return (
    <div className="mx-auto w-full max-w-2xl pb-16 pt-10">
      <p className="eyebrow">{title}</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{dict.result.title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>

      <div className="stamp mt-7 p-5 sm:p-7">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="eyebrow">{dict.result.score}</p>
            <p className="tnum display mt-1 text-5xl text-accent sm:text-6xl">
              {formatNumber(summary.score, lang)}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="eyebrow">{dict.result.correct}</p>
              <p className="tnum mt-1 text-2xl font-semibold">
                {summary.correct}/{summary.total}
              </p>
            </div>
            <div>
              <p className="eyebrow">{dict.result.accuracy}</p>
              <p className="tnum mt-1 text-2xl font-semibold">{summary.accuracy}%</p>
            </div>
            <div>
              <p className="eyebrow">{dict.result.streak}</p>
              <p className="tnum mt-1 text-2xl font-semibold">{summary.maxStreak}x</p>
            </div>
          </div>
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          {summary.isRecord ? (
            <span className="font-semibold text-success">
              {dict.result.newRecord(bestLabel)}
            </span>
          ) : summary.previousScore !== null ? (
            <>
              {dict.result.savedRecord}{" "}
              <span className="tnum font-semibold text-ink">
                {formatNumber(summary.previousScore, lang)}
              </span>
            </>
          ) : (
            dict.result.localRecord
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-12 flex-1 rounded-sm bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
        >
          {dict.result.playAgain}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="min-h-12 flex-1 rounded-sm border border-line-strong px-5 text-sm font-semibold text-ink transition-colors hover:bg-canvas-deep"
        >
          {dict.result.changeSettings}
        </button>
      </div>

      <section className="mt-12" aria-labelledby="pembahasan">
        <div className="flex items-baseline justify-between">
          <h2 id="pembahasan" className="display text-2xl">
            {dict.result.review}
          </h2>
          <span className="text-xs text-muted">
            {dict.result.questions(answers.length)}
          </span>
        </div>
        <ol className="mt-4 divide-y divide-line border-y border-line">
          {questions.map((question, i) => {
            const answer = answers[i];
            if (!answer) return null;
            const givenLabel =
              answer.optionKey !== null
                ? question.options.find((o) => o.key === answer.optionKey)?.label
                : answer.givenText;
            return (
              <li key={`${question.key}-${i}`} className="flex gap-3 py-3 sm:gap-4">
                <div className="w-16 shrink-0 sm:w-20">
                  <FlagImage
                    src={question.imageSrc}
                    alt={question.reviewImageAlt ?? question.imageAlt ?? "Flag"}
                    plateClassName="p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-ink">
                    {question.prompt}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    <span className="font-semibold">{question.answerLabel}</span>
                    {!answer.correct ? (
                      <span className="text-muted">
                        {" "}
                        · {dict.result.yourAnswer}{" "}
                        {givenLabel || dict.result.noAnswer}
                      </span>
                    ) : null}
                  </p>
                </div>
                <span
                  className={`mt-1 grid size-6 shrink-0 place-items-center rounded-[2px] ${
                    answer.correct
                      ? "bg-success-soft text-success"
                      : "bg-danger-soft text-danger"
                  }`}
                  aria-label={
                    answer.correct
                      ? dict.result.correct
                      : dict.result.incorrect
                  }
                >
                  {answer.correct ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <CrossIcon className="size-4" />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-6 text-sm text-muted">
        {dict.result.practiceHint}{" "}
        <Link href="/latihan" className="link-underline text-ink">
          {dict.result.practiceLink}
        </Link>
        .
      </p>
    </div>
  );
}
