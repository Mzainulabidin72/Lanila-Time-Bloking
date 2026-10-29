# Lanila Time Blocking (v0.1 core)
React + Vite + TypeScript + Tailwind 3 + Zustand (IndexedDB persistence via idb-keyval).
## Status - read first
This archive was generated in an environment WITHOUT network access: `npm install`, type check, tests and build were NOT run. No lockfile is included. Run `npm install` first and fix any type errors that appear.
## Commands
npm install, npm run dev, npm run typecheck, npm test, npm run build, npm run preview
## Implemented
Overview (metrics derived from state), Jadwal Saya (day view, validation, conflict warning without overwriting), Tugas, Mode Fokus (timestamp-based), Integrasi (honest status), product switcher from src/registry/products.ts + env URLs, dark mode, IndexedDB persistence, unit tests for validation/overlap/timer math, Supabase cloud mode (login, write-through sync of blocks/tasks/focus sessions) with migration supabase/migrations/001_tb_core.sql.
## Not yet implemented
Week/month/agenda views, drag/resize, recurrence, projects, routines, analytics, category CRUD, settings page, integration event layer, remaining tables, English localization, seed/demo data, favicon/app-icon set beyond a cropped logo mark.
## Env
Copy .env.example to .env. Empty product URLs show "perlu konfigurasi". Never put a service-role key in client code.

## Supabase (shared Lanila project)
Tables use the `tb_` prefix and reference `auth.users`; existing tables (profiles, categories, aset_*, lh_*, ...) are NOT touched.
1. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env` (anon key only).
2. Run `supabase/migrations/001_tb_core.sql` in the SQL Editor (or `supabase db push`).
3. Restart `npm run dev`. Sidebar shows "Cloud" and login is required; without env vars it stays in "Mode lokal".
user_id is set by the database (default auth.uid()) and enforced by RLS; the client never sends it.
Not wired yet: tb_categories (table exists, UI uses fixed categories), offline queue/retry, one-time import of old local data (cloud login replaces local data with remote data).
Verify RLS after applying: sign in as two users and confirm each sees only their own rows.

## Autentikasi (v0.2)
Routes: /login, /register, /forgot-password, /reset-password. Semua route privat dilindungi (redirect ke /login dan kembali ke tujuan semula). Sesi dikelola SDK Supabase (tidak ada token manual di localStorage). Logout membersihkan data aplikasi di memori dan IndexedDB.
Setup: di Supabase Dashboard > Authentication > URL Configuration, tambahkan `http://localhost:5173/reset-password` dan URL produksimu ke Redirect URLs. Jalankan migrasi 001 lalu 002 (`002_tb_task_due.sql`, hanya menambah kolom).
Checkbox "ingat saya" sengaja tidak ada: SDK Supabase menyimpan sesi persisten secara default.
## Audit akun bersama (yang terverifikasi dan tidak)
Terlihat dari screenshot Table Editor: tabel `aset_*`, `lh_*`, `transactions`, `wallets`, `profiles`, dll berada dalam SATU project Supabase, sehingga `auth.users` dipakai bersama. BELUM terverifikasi: apakah frontend Buku Kas/Habits/Asset memakai URL+anon key yang sama, bagaimana `profiles` terhubung ke `auth.users`, dan Wedding Planner (tidak ada tabelnya di screenshot). Halaman Integrasi hanya memeriksa bahwa tabel bisa dibaca; tidak ada sinkronisasi event.
## Belum dikerjakan
Toast, jeda istirahat Pomodoro, kategori kustom, impor data lokal lama ke cloud, antrean offline, dropdown/profil di mobile selain menu akun, uji integrasi RLS otomatis.

## Tema (v0.3)
Satu sistem: `src/lib/theme.tsx` (ThemeProvider) + `src/lib/themeCore.ts` (logika murni, ada tes). Mode: Terang / Gelap / Sistem; kunci tunggal `lanila-theme` di localStorage (preferensi ringan). Skrip kecil di `index.html` memasang kelas `dark` sebelum React dimuat agar tidak berkedip. Mode Sistem mengikuti perubahan OS secara langsung. Warna memakai CSS variables (`--bg`, `--surface`, `--elevated`, `--text`, `--muted`, `--line`, `--accent`) di `src/index.css`, dipetakan ke Tailwind (`bg-surface`, `text-muted`, dst). Flag tema lama di store Zustand sudah dihapus.
Kontrol tema: sidebar/drawer, header mobile, halaman login/daftar/lupa sandi, dan Pengaturan.
## Rute auth
/login, /register, /forgot-password, /reset-password, /auth/callback (verifikasi email). Tambahkan `http://localhost:5173/auth/callback` dan `/reset-password` (serta URL produksi) ke Supabase > Authentication > URL Configuration > Redirect URLs.
Tidak dibuat: opsi "ingat sesi" (SDK menyimpan sesi persisten secara default), persetujuan syarat/privasi (halamannya belum ada), mode mock auth. Belum ada halaman Analitik/Proyek/Kalender bulan, jadi grafik dan kalender penuh belum diuji untuk tema.

## Jadwal Saya (v0.4)
Timeline harian dan grid mingguan (blok diposisikan menurut jam & durasi; blok tumpang tindih berdampingan; penanda waktu sekarang), ringkasan, filter (kategori/tugas/status/cari), dialog tambah/ubah (bottom sheet di mobile), dialog detail (selesai, ubah, duplikat, hapus dengan konfirmasi; tugas terkait tidak ikut terhapus), toast. Klik area kosong di grid untuk menambah blok pada jam itu.
Perhitungan (`src/lib/schedule.ts`): Total Terjadwal = gabungan durasi blok (tumpang tindih dihitung sekali); Waktu Kosong = (jam kerja x jumlah hari) - gabungan durasi dalam jam kerja; Konflik = jumlah pasangan blok yang bertabrakan. Ringkasan mengikuti filter. Jam kerja diatur di Pengaturan (disimpan lokal, bukan di Supabase). Rentang timeline otomatis melebar bila ada blok di luar jam kerja.
Persistensi: sama seperti sebelumnya (IndexedDB + Supabase bila dikonfigurasi). Jalankan `003_tb_block_details.sql` agar deskripsi, catatan, dan prioritas blok ikut tersimpan di cloud (hanya menambah kolom).
Batasan: tanggal memakai zona waktu browser (belum ada pengaturan zona waktu); status "dibatalkan" dan filter proyek belum ada (proyek belum dibuat); tidak ada drag/resize; klik-area-kosong hanya untuk mouse/sentuh (lewat keyboard gunakan tombol Tambah Blok).

## Tugas (v0.5)
Ringkasan (Aktif / Jatuh tempo hari ini / Terlambat / Selesai; dihitung dari SEMUA tugas, bukan daftar terfilter; tugas selesai tidak pernah dianggap terlambat), tambah cepat + dialog tambah/ubah, cari (judul/deskripsi/catatan), filter status/prioritas/tenggat, urutan, pengelompokan (prioritas/tenggat), pesan kosong sesuai filter, detail tugas dengan blok terkait, duplikat, hapus dengan konfirmasi.
Jadwalkan: dialog tanggal/mulai/durasi (default = estimasi), deteksi bentrok (harus disetujui eksplisit), membuat blok dengan `taskId`. Satu tugas boleh punya banyak blok. Menjadwalkan atau menyelesaikan blok TIDAK menyelesaikan tugas. Id blok dibuat sekali per dialog dan `addBlock` idempoten, jadi percobaan ulang tidak menggandakan blok. Status "terjadwal" diturunkan dari blok yang ada (tidak disimpan di tugas).
Kebijakan hapus tugas: blok terkait DIPERTAHANKAN dan hanya dilepas dari tugas (di DB: FK `on delete set null`). Hapus blok tidak menghapus tugas.
Skema: jalankan `004_tb_task_details.sql` (hanya menambah kolom description dan notes). Tugas lama tetap utuh; status `inbox` lama ditampilkan sebagai "Belum selesai".
Batasan: belum ada proyek/tag (jadi tidak ada filter proyek); urutan "terbaru" memakai waktu dibuat (tugas lama tanpa waktu dianggap paling lama).

## Mode Fokus (v0.6)
Engine: `src/lib/focusTimer.ts` (fungsi murni + tes) dan `src/lib/useFocusEngine.ts` (dipasang SEKALI di Shell, jadi sesi selesai di halaman mana pun). Sisa waktu SELALU dihitung dari cap waktu (`endsAt`) atau sisa tersimpan saat dijeda; tab tidak aktif tidak menambah waktu. Sesi aktif disimpan (IndexedDB) dan pulih setelah refresh; sesi yang sudah lewat saat aplikasi ditutup diselesaikan dengan waktu akhir sesuai rencana. Penyelesaian idempoten (id sesi unik; upsert ke Supabase berdasarkan id).
Aturan: Selesai = penuh. Akhiri Sesi = tercatat "Terputus" dengan durasi nyata; di bawah 60 detik TIDAK dicatat. Reset membuang sesi tanpa mencatat. Ganti mode saat berjalan meminta konfirmasi (sesi lama diakhiri sebagai terputus). Tugas tidak pernah otomatis selesai; ada tombol eksplisit + konfirmasi di ringkasan.
Statistik (dari riwayat nyata): Fokus Hari Ini = durasi nyata sesi fokus (selesai + terputus >=1 mnt, tanpa istirahat); Sesi Selesai = sesi fokus penuh; Target Harian dapat diatur; Streak = hari berturut-turut dengan >=1 sesi fokus selesai (hari ini atau kemarin sebagai ujung).
Notifikasi/suara: opsional, izin notifikasi HANYA diminta saat toggle diklik. Suara dibuka lewat klik pengguna (aturan autoplay); bila izin ditolak, pemberitahuan tetap muncul di dalam aplikasi. Pintasan: Spasi jeda/lanjut (tidak aktif saat mengetik atau dialog terbuka).
Skema: jalankan `005_tb_focus_sessions.sql` (hanya menambah kolom). Sesi lama tetap utuh (dianggap fokus selesai). `project_id` belum ada karena belum ada tabel proyek. Sesi lokal format lama dimigrasikan otomatis; sesi yang sedang berjalan di versi lama tidak dipulihkan.
Sidebar: bagian "Ekosistem Lanila" kini bisa dilipat dan sidebar bisa digulir agar kontrol bawah tidak terpotong.
Batasan: waktu bergantung pada jam sistem perangkat; belum ada integrasi Habits; notifikasi tidak muncul bila browser benar-benar ditutup.
