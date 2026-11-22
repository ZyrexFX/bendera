"use client";

import { createContext, useContext } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary, Lang } from "@/lib/i18n";

type LangContextValue = {
  lang: Lang;
  dict: Dictionary;
};

const LangContext = createContext<LangContextValue>({
  lang: "id",
  dict: getDictionary("id"),
});

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <LangContext.Provider value={{ lang, dict: getDictionary(lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
