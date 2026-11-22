# flagmint.

A small pile of geography games in Indonesian and English. Guess a country from its flag, guess capitals, try your luck with subdivision flags, or just browse the atlas when you don't feel like being scored.

No accounts, no backend, no ads.

Live site: **https://flagmint.vercel.app**  
Source: **https://github.com/ZyrexFX/bendera**

## Language

The switch in the header stores your pick in the `flagmint:lang` cookie (`id` or `en`). Pages, metadata, and game text all follow it. Typed answers accept country names in either language.

## What's inside

- **Flag quiz.** 250 countries and territories, four difficulty tiers, six regions. Pick 10 questions or go through every flag in a tier. Answer by choice or by typing the name.
- **Capital quiz.** 245 countries with capital data, same tiers and regions, typed mode included.
- **Subdivision flags.** 2,833 regional flags from 128 countries, loaded one country at a time.
- **Practice.** A world flag atlas, a subdivision atlas, and flash cards. No timer anywhere.
- **Local scores.** Best runs are kept per mode, tier, region, and question count in `localStorage`.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4, with colour tokens in `src/app/globals.css`
- No database. Everything runs in the browser.
- `next/font` for Bricolage Grotesque and Instrument Sans

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
npm run data     # rebuild the dataset and download country flags
```

`npm run data` needs an internet connection. It writes:

- `src/data/countries.json`: 250 countries, capitals, regions, area, difficulty tier
- `src/data/subdivision-summary.json`: which countries have subdivision flags
- `public/data/subdivisions/*.json`: subdivision flag lists per country
- `public/flags/*.svg`: country flags, stored locally

Subdivision flags are not kept in this repo. They load from the jsDelivr CDN when needed.

## Layout

```
src/app/                pages: /, /bendera, /ibu-kota, /negara-bagian, /latihan, /tentang
src/components/         UI, quiz engine, practice atlas, detail dialogs
src/lib/                country data, question builders, score storage, sound
scripts/build-data.mjs  dataset pipeline
```

## Data sources

- ISO 3166-1 and ISO 3166-2 flags: [amckenna41/iso3166-flags](https://github.com/amckenna41/iso3166-flags), MIT
- Country names, capitals, regions, area: [mledoze/countries](https://github.com/mledoze/countries), ODbL
- Indonesian country names: CLDR via [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries), Unicode License, plus a few manual tweaks

Difficulty tiers are set by hand, not by a formula. The reasoning is on `/tentang`.

## Deploy

The `flagmint` Vercel project is connected to this repo. Every push to `main` rebuilds and publishes production. You can still deploy by hand with `vercel --prod`.

## License

The code is MIT. The data follows each source's license above. Flags are official symbols of countries and territories; this project collects the files, it doesn't claim the designs.
