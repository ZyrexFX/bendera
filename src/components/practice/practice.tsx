"use client";

import { useRef, useState } from "react";
import { useLang } from "@/components/lang-provider";
import { Flashcards } from "@/components/practice/flashcards";
import { PracticeSubdivisions } from "@/components/practice/practice-subdivisions";
import { PracticeWorld } from "@/components/practice/practice-world";

const tabIds = ["dunia", "daerah", "kartu"] as const;
type TabId = (typeof tabIds)[number];

export function Practice() {
  const { dict } = useLang();
  const [tab, setTab] = useState<TabId>("dunia");
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const labels: Record<TabId, string> = {
    dunia: dict.practice.tabWorld,
    daerah: dict.practice.tabSubdivisions,
    kartu: dict.practice.tabCards,
  };

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabIds.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabIds.length) % tabIds.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabIds.length - 1;
    setTab(tabIds[next]);
    refs.current[next]?.focus();
  }

  return (
    <div className="wrap pb-20">
      <div
        role="tablist"
        aria-label={dict.practice.tabsLabel}
        className="mt-8 flex gap-1 overflow-x-auto border-b border-line"
      >
        {tabIds.map((id, index) => {
          const active = tab === id;
          return (
            <button
              key={id}
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={`panel-${id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`relative min-h-11 shrink-0 px-3 text-sm font-medium transition-colors ${
                active
                  ? "text-ink after:absolute after:inset-x-2 after:bottom-[-1px] after:h-[2px] after:bg-accent"
                  : "text-muted hover:text-ink"
              }`}
            >
              {labels[id]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="mt-6 outline-offset-8"
      >
        <h2 className="sr-only">{labels[tab]}</h2>
        {tab === "dunia" ? <PracticeWorld /> : null}
        {tab === "daerah" ? <PracticeSubdivisions /> : null}
        {tab === "kartu" ? <Flashcards /> : null}
      </div>
    </div>
  );
}
