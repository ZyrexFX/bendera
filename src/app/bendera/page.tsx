import type { Metadata } from "next";
import { WorldQuiz } from "@/components/quiz/world-quiz";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const dict = getDictionary(lang);
  return {
    title: dict.meta.pageTitles.flags,
    description: dict.setup.flags.description,
  };
}

function parseLevel(value?: string) {
  const level = Number(value);
  return level >= 1 && level <= 4 ? (level as 1 | 2 | 3 | 4) : 1;
}

export default async function FlagQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const params = await searchParams;
  return <WorldQuiz kind="flags" initialLevel={parseLevel(params.level)} />;
}
