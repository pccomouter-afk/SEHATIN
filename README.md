# SEHATIN — Digital Health Companion

Rebuild frontend-only untuk kompetisi "Architecting the Future" (subtema Kesehatan). Tidak ada backend; seluruh state disimpan di localStorage lewat `js/core/storage.js`.

## Menjalankan

Buka `index.html` langsung di browser (tidak butuh server), atau jalankan lewat live server apa pun. Semua halaman aplikasi ada di folder `pages/`. Akun demo: `demo@sehatin.id` / `sehatin123`, tersedia lewat tombol "Coba dengan Akun Demo" di halaman Masuk.

Font Awesome, Google Fonts, dan Leaflet dimuat dari CDN — dibutuhkan koneksi internet agar tampilan dan peta fasilitas tampil sempurna.

## Struktur

```
css/variables   -> warna, tipografi, spacing
css/base        -> reset, layout global, utilities, responsive guard
css/components  -> sidebar, topbar, bottom-nav, drawer, buttons, cards, forms, modal, toast, charts
css/pages       -> gaya khusus tiap halaman
js/core         -> storage.js, auth.js, state.js (health score & data harian), utils.js, mock-data.js
js/components   -> toast.js, modal.js, navbar.js (app shell: sidebar + topbar + bottom nav + drawer + notifikasi + fix keyboard mobile)
js/features     -> logic per fitur (health-check, wellness, journal, facilities, library, hydration, activity, search)
js/pages        -> bootstrap tiap halaman
pages/          -> dashboard, health-check, health (Kesehatan Saya: tidur/hidrasi/aktivitas/ruang tenang), journal, facilities, facility-detail, library, settings, login, register
index.html      -> homepage publik
```

## Perbaikan utama dari versi sebelumnya

- Sidebar desktop benar-benar berfungsi: collapse/expand, active state, tooltip saat collapsed, state tersimpan di localStorage.
- Avatar di topbar maupun sidebar membuka profile drawer (slide-in dari kanan, overlay, ESC, klik luar untuk menutup) — terpisah dari sidebar navigasi.
- Bottom navigation mobile fixed dan disembunyikan otomatis saat keyboard muncul (dideteksi lewat `visualViewport`), sehingga tidak lagi ikut naik ke tengah layar.
- Health Check menjadi assessment 10 pertanyaan multi-step lintas 4 domain (fisik, mental, tidur, gaya hidup) dengan validasi, progress bar, hasil, dan riwayat tersimpan di localStorage.
- Settings digabung menjadi satu halaman dengan section: Profil, Notifikasi, Preferensi Kesehatan, Tampilan, Privasi & Keamanan, Bantuan.
- Semua button primer/sekunder/ghost punya kontras dan state jelas (hover, active, focus, disabled), tinggi minimal 44px.
- Seluruh UI berbahasa Indonesia, tanpa emoji, tanpa eyebrow text, tanpa komentar pada source code.
- Toast dan modal reusable menggantikan `alert()`/`confirm()` browser.
- Data terpusat di `js/core/mock-data.js`, wrapper localStorage terpusat di `js/core/storage.js`.

## Simplifikasi yang disadari

Karena skala permintaan sangat besar, beberapa hal disederhanakan secara sadar dibanding daftar asli:

- Logic sidebar/topbar/bottom-nav/drawer/notifikasi digabung dalam satu file `js/components/navbar.js` (`AppShell`) alih-alih dipisah per file, agar konsisten dan mudah dirawat — bukan berarti fiturnya tidak lengkap.
- Fitur "Kesehatan Saya" (tidur, hidrasi, aktivitas, ruang tenang/wellness) digabung dalam satu halaman bertab `health.html`, mengikuti prinsip progressive disclosure yang diminta, bukan halaman terpisah-pisah.
- Mode tampilan gelap sengaja tidak dibuat penuh (sesuai instruksi untuk tidak membuat dark mode setengah jadi); yang tersedia adalah pilihan "Tampilan Terang" / "Ikuti Sistem" yang tersimpan sebagai preferensi.
- Chart tren kesehatan dibuat dengan SVG native (tanpa library tambahan) sesuai batasan library yang diizinkan.

Project ini sudah diaudit untuk sintaks JS (lolos `node --check` di semua file) dan struktur HTML (tidak ada tag yang tidak tertutup), namun untuk kompetisi disarankan tetap melakukan pengecekan visual manual di breakpoint 390×844, 820×1180, dan 1440×1024 sebelum presentasi.
