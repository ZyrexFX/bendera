"use client";

import { useLang } from "@/components/lang-provider";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle() {
  const { dict } = useLang();

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("flagmint:theme", next);
    } catch {
      // Storage can be blocked. The theme still applies for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-sm border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      aria-label={dict.header.theme}
      title={dict.header.themeTitle}
    >
      <SunIcon className="size-5 dark:hidden" />
      <MoonIcon className="hidden size-5 dark:block" />
    </button>
  );
}
