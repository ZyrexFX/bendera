"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlagImage } from "@/components/flag-image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  SearchIcon,
  SpinnerIcon,
} from "@/components/icons";
import { useLang } from "@/components/lang-provider";
import { DetailDialog } from "@/components/practice/detail-dialog";
import {
  countryByCode,
  countryName,
  formatNumber,
  subdivisionCountries,
  subdivisionTotal,
} from "@/lib/countries";
import { typeLabel } from "@/lib/i18n";
import { subdivisionFlagUrl } from "@/lib/quiz";
import type { SubdivisionItem } from "@/lib/quiz";
import { loadSubdivisionFlags } from "@/lib/subdivisions";

export function PracticeSubdivisions() {
  const { lang, dict } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState<SubdivisionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [openCode, setOpenCode] = useState<string | null>(null);
  const requestRef = useRef(0);

  const country = selected ? countryByCode.get(selected) : null;
  const countryLabel = country ? countryName(country, lang) : "";

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return subdivisionCountries.filter((item) => {
      if (!query) return true;
      const parent = countryByCode.get(item.code);
      return (
        item.name.toLocaleLowerCase("id").includes(query) ||
        (parent?.nameEn ?? "").toLocaleLowerCase("en").includes(query) ||
        item.code.includes(query)
      );
    });
  }, [search]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = itemSearch.trim().toLocaleLowerCase("id");
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLocaleLowerCase("id").includes(query) ||
        item.code.toLocaleLowerCase("id").includes(query) ||
        item.type.toLocaleLowerCase("id").includes(query),
    );
  }, [itemSearch, items]);

  const openIndex = openCode
    ? filteredItems.findIndex((item) => item.code === openCode)
    : -1;
  const openItem = openIndex >= 0 ? filteredItems[openIndex] : null;

  useEffect(() => {
    if (!selected) return;
    setItems(null);
    setError(false);
    setItemSearch("");
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    loadSubdivisionFlags(selected)
      .then((data) => {
        if (requestRef.current !== requestId) return;
        setItems(data);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setError(true);
      })
      .finally(() => {
        if (requestRef.current !== requestId) return;
        setLoading(false);
      });
  }, [selected]);

  function retry() {
    if (!selected) return;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setError(false);
    setLoading(true);
    loadSubdivisionFlags(selected)
      .then((data) => {
        if (requestRef.current !== requestId) return;
        setItems(data);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setError(true);
      })
      .finally(() => {
        if (requestRef.current !== requestId) return;
        setLoading(false);
      });
  }

  function step(direction: 1 | -1) {
    if (openIndex < 0 || filteredItems.length === 0) return;
    const nextIndex =
      (openIndex + direction + filteredItems.length) % filteredItems.length;
    setOpenCode(filteredItems[nextIndex].code);
  }

  if (selected && country) {
    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="min-h-9 text-sm font-medium text-muted hover:text-ink"
            >
              {dict.subdivisions.back}
            </button>
            <h2 className="display mt-2 text-3xl">{countryLabel}</h2>
            <p className="mt-1 text-sm text-muted">
              {items
                ? dict.subdivisions.itemCount(items.length)
                : loading
                  ? dict.subdivisions.loadingList
                  : dict.subdivisions.pageEyebrow}
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="cari-daerah" className="eyebrow">
              {dict.practice.searchSubdivision}
            </label>
            <div className="relative mt-2">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <input
                id="cari-daerah"
                type="search"
                value={itemSearch}
                onChange={(event) => setItemSearch(event.target.value)}
                placeholder={dict.practice.searchSubdivisionPlaceholder}
                className="min-h-11 w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 hover:border-line-strong"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 rounded-sm border border-line bg-surface px-4 py-8 text-sm text-muted">
            <SpinnerIcon className="size-5 animate-spin text-accent" />
            {dict.subdivisions.loadingItems(countryLabel)}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-sm border border-danger bg-danger-soft p-4">
            <p className="text-sm font-semibold text-ink">
              {dict.subdivisions.loadError}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {dict.subdivisions.loadErrorBody}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={retry}
                className="min-h-10 rounded-sm bg-ink px-4 text-sm font-semibold text-canvas"
              >
                {dict.common.retry}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold text-ink"
              >
                {dict.subdivisions.pickOther}
              </button>
            </div>
          </div>
        ) : null}

        {items ? (
          <>
            <p className="mt-4 text-xs text-muted" aria-live="polite">
              {dict.practice.itemsShown(filteredItems.length)}
            </p>
            {filteredItems.length === 0 ? (
              <div className="mt-4 rounded-sm border border-line bg-surface p-6">
                <p className="text-sm font-semibold">{dict.practice.noItems}</p>
                <button
                  type="button"
                  onClick={() => setItemSearch("")}
                  className="mt-3 min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold"
                >
                  {dict.practice.clearSearch}
                </button>
              </div>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredItems.map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      onClick={() => setOpenCode(item.code)}
                      className="group flex h-full w-full flex-col rounded-sm border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent"
                    >
                      <FlagImage
                        src={subdivisionFlagUrl(item)}
                        alt={item.name}
                        plateClassName="p-1"
                      />
                      <span className="mt-2 block text-sm font-semibold leading-snug text-ink">
                        {item.name}
                      </span>
                      <span className="tnum mt-0.5 block text-[11px] text-muted">
                        {item.code}
                        {item.type ? ` · ${typeLabel(item.type, lang)}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

        <DetailDialog
          open={Boolean(openItem)}
          onClose={() => setOpenCode(null)}
          label={
            openItem
              ? `${dict.practice.subdivisionDetail} ${openItem.name}`
              : dict.practice.subdivisionDetail
          }
        >
          {openItem && country ? (
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow">
                  {dict.practice.subdivisionOf(
                    openIndex + 1,
                    filteredItems.length,
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenCode(null)}
                  aria-label={dict.practice.closeDetail}
                  className="grid size-9 place-items-center rounded-sm border border-line text-ink-soft hover:border-line-strong"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-[240px_1fr] sm:items-start">
                <FlagImage
                  src={subdivisionFlagUrl(openItem)}
                  alt={openItem.name}
                  eager
                  plateClassName="mx-auto w-full max-w-[240px] p-1.5 shadow-[4px_4px_0_0_var(--line)] sm:mx-0 sm:max-w-none"
                />
                <div>
                  <h2 className="display text-3xl">{openItem.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {countryLabel}
                    {openItem.type ? ` · ${typeLabel(openItem.type, lang)}` : ""}
                  </p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4 border-b border-line pb-2">
                      <dt className="text-muted">
                        {dict.practice.isoSubdivision}
                      </dt>
                      <dd className="tnum font-medium">{openItem.code}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-line pb-2">
                      <dt className="text-muted">{dict.practice.type}</dt>
                      <dd className="font-medium">
                        {openItem.type
                          ? typeLabel(openItem.type, lang)
                          : dict.common.notRecorded}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{dict.practice.parent}</dt>
                      <dd className="font-medium">{countryLabel}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-line px-3 text-sm font-medium hover:border-line-strong"
                  >
                    <ChevronLeftIcon className="size-4" />
                    {dict.common.previous}
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-line px-3 text-sm font-medium hover:border-line-strong"
                  >
                    {dict.common.next}
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
                <Link
                  href="/negara-bagian"
                  className="min-h-10 text-sm font-semibold text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent"
                >
                  {dict.practice.subdivisionQuizLink}
                </Link>
              </div>
            </div>
          ) : null}
        </DetailDialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="cari-negara-daerah" className="eyebrow">
            {dict.practice.searchCountry}
          </label>
          <div className="relative mt-2">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="cari-negara-daerah"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={dict.practice.searchCountryPlaceholder}
              className="min-h-11 w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 hover:border-line-strong"
            />
          </div>
        </div>
        <p className="text-xs text-muted">
          {dict.practice.countriesMeta(
            subdivisionCountries.length,
            formatNumber(subdivisionTotal, lang),
          )}
        </p>
      </div>

      {filteredCountries.length === 0 ? (
        <div className="mt-6 rounded-sm border border-line bg-surface p-6">
          <p className="text-sm font-semibold">{dict.subdivisions.noMatch}</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-3 min-h-10 rounded-sm border border-line-strong px-4 text-sm font-semibold"
          >
            {dict.practice.clearSearch}
          </button>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCountries.map((item) => {
            const parent = countryByCode.get(item.code);
            const label = parent ? countryName(parent, lang) : item.name;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => setSelected(item.code)}
                  className="group flex h-full w-full flex-col rounded-sm border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent"
                >
                  <FlagImage
                    src={parent ? `/flags/${parent.flag}` : undefined}
                    alt={label}
                    plateClassName="p-1"
                  />
                  <span className="mt-2 block truncate text-sm font-semibold text-ink">
                    {label}
                  </span>
                  <span className="tnum mt-0.5 block text-[11px] text-muted">
                    {dict.subdivisions.flagCount(item.count)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
