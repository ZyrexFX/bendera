"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/components/lang-provider";
import { LangToggle } from "@/components/lang-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { CloseIcon, MenuIcon } from "@/components/icons";

export function SiteHeader() {
  const pathname = usePathname();
  const { dict } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/bendera", label: dict.nav.flags },
    { href: "/ibu-kota", label: dict.nav.capitals },
    { href: "/negara-bagian", label: dict.nav.subdivisions },
    { href: "/latihan", label: dict.nav.practice },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="display text-2xl font-semibold tracking-[-0.05em] text-ink"
          aria-label={dict.header.home}
        >
          bendera<span className="text-accent">.</span>
        </Link>

        <nav aria-label={dict.header.menu} className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-ink after:absolute after:inset-x-3 after:-bottom-[9px] after:h-[2px] after:bg-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-sm border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? dict.header.closeMenu : dict.header.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className="border-t border-line bg-canvas md:hidden"
      >
        <nav aria-label={dict.header.menuMobile} className="wrap flex flex-col py-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-between border-b border-line py-3 text-base last:border-b-0 ${
                  active ? "font-semibold text-accent" : "text-ink"
                }`}
              >
                {link.label}
                {active ? (
                  <span className="text-xs text-muted">{dict.nav.active}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
