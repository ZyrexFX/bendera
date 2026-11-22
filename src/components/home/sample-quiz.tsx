"use client";

import Link from "next/link";
import { useState } from "react";
import { FlagImage } from "@/components/flag-image";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { useLang } from "@/components/lang-provider";
import type { Question } from "@/lib/quiz";
import { buildSampleQuestion } from "@/lib/quiz";

export function SampleQuiz({ initial }: { initial: Question }) {
  const { lang, dict } = useLang();
  const [question, setQuestion] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);

  const answered = selected !== null;
  const correct = selected === question.answerKey;

  function choose(key: string) {
    if (answered) return;
    setSelected(key);
  }

  function reset() {
    setSelected(null);
    setQuestion(buildSampleQuestion(lang));
  }

  return (
    <div className="stamp p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{dict.home.sampleEyebrow}</p>
        <span className="text-[11px] text-muted">{dict.home.sampleNoScore}</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <FlagImage
          src={question.imageSrc}
          alt={question.imageAlt ?? dict.game.flagAlt}
          eager
          plateClassName="w-[38%] max-w-[150px] p-1.5"
        />
        <div className="min-w-0 flex-1">
          <p className="display text-xl leading-tight sm:text-2xl">
            {question.prompt}
          </p>
          <p className="mt-2 text-xs text-muted">{dict.home.samplePick}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-1.5">
        {question.options.map((option) => {
          const isCorrect = option.key === question.answerKey;
          const isPicked = option.key === selected;
          let tone = "border-line bg-canvas hover:border-line-strong";
          if (answered && isCorrect) tone = "border-success bg-success-soft";
          else if (answered && isPicked) tone = "border-danger bg-danger-soft";
          else if (answered) tone = "border-line bg-canvas opacity-55";
          return (
            <button
              key={option.key}
              type="button"
              disabled={answered}
              onClick={() => choose(option.key)}
              className={`flex min-h-10 items-center gap-2 rounded-sm border px-3 py-2 text-left text-sm font-medium transition-colors ${tone}`}
            >
              <span className="flex-1">{option.label}</span>
              {answered && isCorrect ? (
                <CheckIcon className="size-4 shrink-0 text-success" />
              ) : null}
              {answered && isPicked && !isCorrect ? (
                <CrossIcon className="size-4 shrink-0 text-danger" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[56px]" aria-live="polite">
        {answered ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              {correct ? (
                <span className="font-semibold text-success">
                  {dict.home.sampleCorrect(question.answerLabel)}
                </span>
              ) : (
                <span className="text-ink-soft">
                  {dict.home.sampleWrong}{" "}
                  <span className="font-semibold text-ink">
                    {question.answerLabel}
                  </span>
                  .
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={reset}
              className="min-h-10 rounded-sm border border-line-strong px-3 text-xs font-semibold text-ink transition-colors hover:bg-canvas-deep"
            >
              {dict.home.sampleOther}
            </button>
          </div>
        ) : (
          <Link
            href="/bendera"
            className="inline-flex text-sm font-semibold text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent"
          >
            {dict.home.sampleFull}
          </Link>
        )}
      </div>
    </div>
  );
}
