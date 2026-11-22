import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);

  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap grid gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <div>
          <p className="display text-xl text-ink">
            bendera<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {dict.footer.blurb}
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Link href="/tentang" className="link-underline w-fit text-ink-soft">
            {dict.footer.about}
          </Link>
          <a
            href="https://github.com/amckenna41/iso3166-flags"
            target="_blank"
            rel="noreferrer"
            className="link-underline w-fit text-ink-soft"
          >
            {dict.footer.flagsDataset}
          </a>
          <a
            href="https://github.com/mledoze/countries"
            target="_blank"
            rel="noreferrer"
            className="link-underline w-fit text-ink-soft"
          >
            {dict.footer.countriesDataset}
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{dict.footer.copyright}</p>
          <p>{dict.footer.iso}</p>
        </div>
      </div>
    </footer>
  );
}
