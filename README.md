# bendera.

Bendera adalah kumpulan minigame geografi dalam bahasa Indonesia dan Inggris: tebak bendera negara, tebak ibu kota, tebak bendera negara bagian, dan mode latihan tanpa tekanan waktu. Tanpa akun, tanpa backend, tanpa iklan.

Situs produksi: **https://bendera-inky.vercel.app**  
Kode sumber: **https://github.com/ZyrexFX/bendera**

## Bahasa

Pemilih bahasa di header menyimpan pilihan di cookie `bendera:lang` (`id` atau `en`). Halaman, metadata, dan teks permainan dirender sesuai pilihan itu. Jawaban ketik menerima nama dalam kedua bahasa.

## Isi

- **Tebak bendera.** 250 negara dan wilayah, empat tingkat kesulitan, filter enam kawasan, 10 soal sampai seluruh bendera di tingkat itu. Bisa pilih jawaban atau ketik nama negara.
- **Tebak ibu kota.** 245 negara dengan data ibu kota, tingkat dan kawasan yang sama, juga dengan mode ketik.
- **Bendera negara bagian.** 2.833 bendera daerah dari 128 negara, dimuat per negara.
- **Latihan.** Atlas bendera dunia, atlas bendera daerah, dan kartu kilat. Semua tanpa timer.
- **Papan skor lokal.** Rekor per kombinasi mode, tingkat, kawasan, dan jumlah soal disimpan di `localStorage`.

## Teknologi

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4 dengan token warna di `src/app/globals.css`
- Tanpa database. Seluruh permainan berjalan di browser.
- `next/font` untuk Bricolage Grotesque dan Instrument Sans

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm start        # jalankan hasil build
npm run data     # bangun ulang dataset dan unduh bendera negara
```

`npm run data` membutuhkan koneksi internet. Hasilnya:

- `src/data/countries.json`: 250 negara, ibu kota, kawasan, luas, tingkat kesulitan
- `src/data/subdivision-summary.json`: daftar negara yang punya bendera daerah
- `public/data/subdivisions/*.json`: daftar bendera daerah per negara
- `public/flags/*.svg`: bendera negara, disimpan lokal

Bendera daerah tidak disimpan di repositori ini. Berkasnya dimuat dari CDN jsDelivr saat dibutuhkan.

## Struktur

```
src/app/             halaman: /, /bendera, /ibu-kota, /negara-bagian, /latihan, /tentang
src/components/      UI, mesin kuis, atlas latihan, dialog detail
src/lib/             data negara, pembuat soal, penyimpanan skor, suara
scripts/build-data.mjs  pipeline dataset
```

## Sumber data

- Bendera ISO 3166-1 dan ISO 3166-2: [amckenna41/iso3166-flags](https://github.com/amckenna41/iso3166-flags), lisensi MIT
- Nama negara, ibu kota, kawasan, luas: [mledoze/countries](https://github.com/mledoze/countries), lisensi ODbL
- Nama negara bahasa Indonesia: CLDR lewat [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries), Unicode License, dengan beberapa penyesuaian manual

Tingkat kesulitan disusun editorial, bukan otomatis. Penjelasannya ada di halaman `/tentang`.

## Deploy

Proyek Vercel bernama `bendera` di akun `zyrexfxs-projects`. Deploy manual dari mesin lokal:

```bash
vercel --prod
```

Untuk deploy otomatis setiap push ke `main`, hubungkan repositori GitHub lewat **Project Settings → Git** di Vercel.

## Lisensi

Kode proyek ini dilisensikan MIT. Data mengikuti lisensi masing-masing sumber di atas. Bendera adalah simbol resmi negara dan wilayah; proyek ini mengumpulkan berkasnya, bukan mengklaim hak atas desain bendera.
