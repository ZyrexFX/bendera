import type { Metadata } from "next";
import { Practice } from "@/components/practice/practice";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const dict = getDictionary(lang);
  return {
    title: dict.meta.pageTitles.practice,
    description: dict.practice.description,
  };
}

export default async function PracticePage() {
  const lang = await getLang();
  const dict = getDictionary(lang);

  return (
    <div>
      <div className="wrap">
        <header className="max-w-3xl pt-10 sm:pt-14">
          <p className="eyebrow">{dict.practice.eyebrow}</p>
          <h1 className="display mt-3 text-[clamp(2.4rem,7vw,4rem)]">
            {dict.practice.title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            {dict.practice.description}
          </p>
        </header>
      </div>
      <Practice />
    </div>
  );
}
