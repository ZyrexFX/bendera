import type { Metadata } from "next";
import { SubdivisionGame } from "@/components/subdivisions/subdivision-game";
import { formatNumber, subdivisionCountries, subdivisionTotal } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const dict = getDictionary(lang);
  return {
    title: dict.meta.pageTitles.subdivisions,
    description: dict.subdivisions.pageDescription(
      formatNumber(subdivisionTotal, lang),
      subdivisionCountries.length,
    ),
  };
}

export default function SubdivisionPage() {
  return <SubdivisionGame />;
}
