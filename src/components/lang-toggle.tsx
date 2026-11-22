"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/lang-provider";
import { LANG_COOKIE } from "@/lib/lang-cookie";
import { langOptions } from "@/lib/i18n";

export function LangToggle() {
  const { lang, dict } = useLang();
  const router = useRouter();

  function choose(value: string) {
    if (value === lang) return;
    document.cookie = `${LANG_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label={dict.header.language}
      className="flex h-10 items-center rounded-sm border border-line p-0.5"
    >
      {langOptions.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={dict.header.languageTitle}
            onClick={() => choose(option.value)}
            className={`grid h-full min-w-7 place-items-center rounded-[1px] px-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
              active
                ? "bg-accent-soft text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {option.value}
          </button>
        );
      })}
    </div>
  );
}
