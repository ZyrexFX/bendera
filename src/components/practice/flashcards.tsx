"use client";

import { useEffect, useMemo, useState } from "react";
import { DifficultyLabel, FlagImage } from "@/components/flag-image";
import { useLang } from "@/components/lang-provider";
import {
  countries,
  countryName,
  difficultyLevels,
  regions,
} from "@/lib/countries";
import { regionLabel, subregionLabel } from "@/lib/i18n";
import { shuffle } from "@/lib/quiz";

export function Flashcards() {
  const { lang, dict } = useLang();
  const [region, setRegion] = useState("");
  const [level, setLevel] = useState("");
  const [deck, setDeck] = useState<typeof countries>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const pool = useMemo(
    () =>
      countries.filter((country) => {
        if (region && country.region !== region) return false;
        if (level && country.difficulty !== Number(level)) return false;
        return true;
      }),
    [level, region],
  );

  useEffect(() => {
    setDeck(shuffle(pool));
    setPos(0);
    setRevealed(false);
  }, [pool]);

  const card = deck[pos];

  function nextCard() {
    if (!deck.length) return;
    if (pos + 1 >= deck.length) {
      setDeck(shuffle(deck));
      setPos(0);
    } else {
      setPos((value) => value + 1);
    }
    setRevealed(false);
  }

  function reshuffle() {
    setDeck(shuffle(pool));
    setPos(0);
    setRevealed(false);
  }

  return (
    <div>
      <div className="grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="kartu-kawasan" className="eyebrow">
            {dict.practice.cardsRegion}
          </label>
          <select
            id="kartu-kawasan"
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
          <label htmlFor="kartu-tingkat" className="eyebrow">
            {dict.practice.cardsLevel}
          </label>
          <select
            id="kartu-tingkat"
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
        <button
          type="button"
          onClick={reshuffle}
          className="min-h-11 rounded-sm border border-line-strong px-4 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
        >
          {dict.practice.shuffle}
        </button>
      </div>

      {!card ? (
        <div className="mt-6 rounded-sm border border-line bg-surface p-8 text-center">
          <p className="text-sm font-semibold">{dict.practice.emptyCards}</p>
          <p className="mt-1 text-sm text-muted">
            {dict.practice.emptyCardsBody}
          </p>
          <button
            type="button"
            onClick={() => {
              setRegion("");
              setLevel("");
            }}
            className="mt-4 min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold"
          >
            {dict.practice.resetChoice}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-muted" aria-live="polite">
              {dict.practice.cardPosition(pos + 1, deck.length)}
            </p>
            <p className="text-xs text-muted">{dict.practice.cardHint}</p>
          </div>

          <div className="stamp mt-3 p-5 sm:p-8">
            <div className="mx-auto max-w-md">
              <FlagImage
                key={card.code}
                src={`/flags/${card.flag}`}
                alt={revealed ? countryName(card, lang) : dict.practice.memoryAlt}
                eager
                className="anim-pop"
                plateClassName="p-2"
              />
            </div>

            <div className="mt-6 min-h-[132px] text-center" aria-live="polite">
              {revealed ? (
                <div className="anim-rise">
                  <h3 className="display text-3xl sm:text-4xl">
                    {countryName(card, lang)}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {dict.practice.capitalInline}{" "}
                    <span className="font-medium text-ink">
                      {card.capital.join(", ") || dict.common.notRecorded}
                    </span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted">
                    <span>{regionLabel(card.region, lang)}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {card.subregion
                        ? subregionLabel(card.subregion, lang)
                        : "-"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <DifficultyLabel level={card.difficulty} />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="display text-2xl sm:text-3xl">
                    {dict.practice.cardQuestion}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {dict.practice.cardInstruction}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              {revealed ? (
                <button
                  type="button"
                  onClick={nextCard}
                  className="min-h-12 rounded-sm bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
                >
                  {dict.practice.nextCard}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="min-h-12 rounded-sm bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
                  >
                    {dict.practice.reveal}
                  </button>
                  <button
                    type="button"
                    onClick={nextCard}
                    className="min-h-12 rounded-sm border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                  >
                    {dict.common.skip}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
