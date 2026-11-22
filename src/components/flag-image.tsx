"use client";

import { useState } from "react";
import { useLang } from "@/components/lang-provider";

export function FlagImage({
  src,
  alt,
  className = "",
  plateClassName = "",
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  plateClassName?: string;
  eager?: boolean;
}) {
  const { dict } = useLang();
  const [failed, setFailed] = useState(false);

  return (
    <div className={`flag-plate aspect-[4/3] ${plateClassName}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          width={640}
          height={480}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-contain ${className}`}
        />
      ) : (
        <div
          role="img"
          aria-label={dict.common.imageFailed(alt)}
          className="grid h-full w-full place-items-center bg-plate text-2xl text-[#8b8474]"
        >
          ?
        </div>
      )}
    </div>
  );
}

const dotColor: Record<number, string> = {
  1: "bg-success",
  2: "bg-marker",
  3: "bg-accent",
  4: "bg-ink",
};

export function DifficultyLabel({
  level,
  className = "",
}: {
  level: number;
  className?: string;
}) {
  const { dict } = useLang();
  const label = dict.levels[level as 1 | 2 | 3 | 4]?.label ?? "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-[1px] ${dotColor[level] ?? dotColor[1]}`}
      />
      {label}
    </span>
  );
}
