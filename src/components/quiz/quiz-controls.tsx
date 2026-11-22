"use client";

import { useLang } from "@/components/lang-provider";
import { difficultyLevels } from "@/lib/countries";
import type { DifficultyLevel } from "@/lib/countries";

export function LevelSelect({
  value,
  onChange,
  counts,
}: {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  counts: Record<number, number>;
}) {
  const { dict } = useLang();

  return (
    <fieldset>
      <legend className="eyebrow">{dict.setup.level}</legend>
      <div className="mt-3 flex flex-col gap-2">
        {difficultyLevels.map((level) => {
          const available = counts[level.level] ?? 0;
          const copy = dict.levels[level.level];
          return (
            <label
              key={level.level}
              className="group relative flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-surface px-3 py-3 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent hover:border-line-strong"
            >
              <input
                type="radio"
                name="level"
                value={level.level}
                checked={value === level.level}
                onChange={() => onChange(level.level)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-sm font-semibold text-ink">
                    {copy.label}
                    <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                      {copy.short}
                    </span>
                  </span>
                  <span className="tnum text-xs text-muted">
                    {dict.setup.levelMeta(available)}
                  </span>
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-muted">
                  {copy.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function RegionSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (region: string) => void;
  options: Array<{ value: string; label: string; count: number }>;
}) {
  const { dict } = useLang();

  return (
    <div>
      <label htmlFor="region" className="eyebrow">
        {dict.setup.region}
      </label>
      <div className="relative mt-3">
        <select
          id="region"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-sm border border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink transition-colors hover:border-line-strong"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function CountSelect({
  value,
  onChange,
  options,
  available,
}: {
  value: number | "all";
  onChange: (count: number | "all") => void;
  options: number[];
  available: number;
}) {
  const { dict } = useLang();
  const visible = options.filter((count) => count < available);

  return (
    <div>
      <span className="eyebrow">{dict.setup.count}</span>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.map((count) => (
          <button
            key={count}
            type="button"
            aria-pressed={value === count}
            onClick={() => onChange(count)}
            className={`tnum min-h-11 flex-1 rounded-sm border px-3 text-sm font-semibold transition-colors ${
              value === count
                ? "border-accent bg-accent-soft text-ink"
                : "border-line bg-surface text-ink-soft hover:border-line-strong"
            }`}
          >
            {count}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={value === "all"}
          onClick={() => onChange("all")}
          className={`min-h-11 flex-1 rounded-sm border px-3 text-sm font-semibold transition-colors ${
            value === "all"
              ? "border-accent bg-accent-soft text-ink"
              : "border-line bg-surface text-ink-soft hover:border-line-strong"
          }`}
        >
          {dict.common.all}
          <span className="tnum ml-1 text-xs font-normal text-muted">
            {available}
          </span>
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {dict.setup.available(available)}
      </p>
    </div>
  );
}

export function ModeSelect({
  value,
  onChange,
}: {
  value: "choice" | "typed";
  onChange: (mode: "choice" | "typed") => void;
}) {
  const { dict } = useLang();
  const modes = [
    {
      id: "choice" as const,
      label: dict.setup.modeChoice,
      hint: dict.setup.modeChoiceHint,
    },
    {
      id: "typed" as const,
      label: dict.setup.modeTyped,
      hint: dict.setup.modeTypedHint,
    },
  ];

  return (
    <fieldset>
      <legend className="eyebrow">{dict.setup.mode}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {modes.map((mode) => {
          const active = value === mode.id;
          return (
            <label
              key={mode.id}
              className={`relative flex cursor-pointer flex-col rounded-sm border px-3 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={mode.id}
                checked={active}
                onChange={() => onChange(mode.id)}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-ink">{mode.label}</span>
              <span className="mt-1 text-[12px] leading-snug text-muted">
                {mode.hint}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
