# CodingCamp-060426-UcuSaefudin
# Personal Life Dashboard

Sebuah *personal dashboard* berbasis web yang dirancang untuk meningkatkan produktivitas harian. Proyek ini dibangun dari nol dengan mematuhi aturan ketat: **murni menggunakan HTML, CSS, dan Vanilla JavaScript** tanpa *framework*, *library* eksternal, maupun API pihak ketiga. Seluruh data pengguna disimpan secara aman di perangkat menggunakan `localStorage`.

## ✨ Fitur Utama
- **Dynamic Greeting & Inline Editing:** Ucapan yang menyesuaikan waktu secara *real-time*. Dilengkapi fitur UX tingkat lanjut (Click-to-Edit) di mana pengguna bisa mengubah Nama dan *Daily Wish* langsung dengan mengkliknya.
- **Focus Timer (Pomodoro):** Penghitung mundur 25 menit untuk sesi kerja yang fokus.
- **Task Management:** *To-Do List* yang fungsional untuk mencatat tugas harian dan dapat digeser ke atas atau bawah sesuai prioritas.
- **Quick Links (Pill Style):** Akses cepat ke situs favorit dengan desain *tag/pill* yang modern dan responsif serta dapat di geser posisi link nya sesuai selera.
- **Motivational Quotes:** Menampilkan kutipan produktivitas kerja yang berganti secara dinamis setiap 1 menit.
- **Theme Toggle:** Mendukung *Dark Mode* dan *Light Mode* (dengan desain latar belakang gradien *pastel*).

## 🚀 Alur Kerja / Development Workflow
Pengembangan aplikasi ini menggunakan metode **Spec-Driven Development** yang terstruktur, dikombinasikan dengan manajemen versi (Git) yang disiplin. Berikut adalah rekam jejak pengerjaannya:

- [x] Melakukan *prompting* untuk membuat struktur *Spec-Driven Development* Web app To-Do List di KIRO.
- [x] Melakukan pengecekan & validasi dokumen spesifikasi (`Requirement.md`, `design.md`, `task.md`) yang dihasilkan.
- [x] Eksekusi Task secara bertahap, mulai dari *Task Group: Add initial dashboard scaffold (HTML, CSS, JS)*.
- [x] Commit di GitHub Desktop dan memberikan pesan *commit* yang relevan untuk menyimpan *history* awal.
- [x] Lanjut eksekusi *Task Group: Implement greeting, timer, todo & links widgets*.
- [x] Commit ke-2 di GitHub Desktop.
- [x] Lanjut eksekusi *Task Group: Add theme vars and refine dashboard styles* untuk penyesuaian visual.
- [x] Commit ke-3 di GitHub Desktop.
- [x] Lanjut eksekusi *Task Group: Mark code-quality done; add CSS comments*.
- [x] Commit ke-4 di GitHub Desktop.
- [x] Melakukan proses QA (*Quality Assurance*): Buka *live preview* file `index.html`, *review* hasil visual, serta *test* seluruh fungsi (Penyimpanan nama ke *local storage*, *toggle Dark/Light mode*, logika *Focus Timer*, *To-Do list*, dan penambahan *Quick Links*). Melakukan evaluasi mendalam terhadap UI & UX.
- [x] Melakukan tahap *Bug Fix and Improvement*: 
      1. Menambahkan rotasi *Quote of the day* setiap 1 menit.
      2. Meningkatkan UX dengan merombak form input tradisional menjadi fitur *Inline Editing* (nama dan *wish* langsung bisa diedit ketika diklik).
- [x] Commit final di GitHub Desktop untuk menyimpan seluruh perubahan penyempurnaan.
- [x] Melakukan *Fetch Origin / Push* melalui GitHub Desktop untuk mendistribusikan dokumentasi *project* ke GitHub Web dan melakukan *deployment* via GitHub Pages.

---
*Dibuat oleh UcuSaefudin untuk submission Mini Project.*
