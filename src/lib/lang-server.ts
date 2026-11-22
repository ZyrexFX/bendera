import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/lang-cookie";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "id";
}
