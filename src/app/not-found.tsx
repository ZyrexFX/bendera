"use client";

import Link from "next/link";
import { useLang } from "@/components/lang-provider";

export default function NotFound() {
  const { dict } = useLang();

  return (
    <div className="wrap flex min-h-[50vh] max-w-xl flex-col justify-center py-16">
      <p className="eyebrow">{dict.notFound.eyebrow}</p>
      <h1 className="display mt-3 text-4xl">{dict.notFound.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {dict.notFound.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-sm bg-accent px-5 text-sm font-semibold text-on-accent"
        >
          {dict.notFound.home}
        </Link>
        <Link
          href="/latihan"
          className="inline-flex min-h-11 items-center rounded-sm border border-line-strong px-5 text-sm font-semibold"
        >
          {dict.notFound.practice}
        </Link>
      </div>
    </div>
  );
}
