/**
 * app.js — Dasbor To-Do Life
 *
 * Modul JavaScript tunggal untuk seluruh dasbor.
 * Diorganisir menjadi:
 *   1. Pembantu penyimpanan  — pembungkus tipis di sekitar localStorage
 *   2. Manajer Tema    — pengalihan tema terang/gelap
 *   3. Widget Salam  — jam tangan langsung, tanggal, dan salam yang dipersonalisasi
 *   4. Widget Timer     — hitung mundur Pomodoro 25 menit
 *   5. Widget Todo      — daftar tugas dengan tambah / edit / selesai / hapus
 *   6. Widget Tautan     — panel tautan cepat dengan tambah / hapus
 *   7. init()           — titik masuk, menghubungkan semuanya pada DOMContentLoaded
 */

'use strict';

/* ============================================================
   PEMBANTU PENYIMPANAN
   Semua pembacaan dan penulisan localStorage melalui pembantu ini.
   Mereka menangani serialisasi JSON dan menangkap kuota / keamanan
   kesalahan sehingga sisa aplikasi tidak perlu menanganinya.
   ============================================================ */

/**
 * @namespace storage
 */
const storage = {
  /**
   * Baca nilai dari localStorage dan parse sebagai JSON.
   * Mengembalikan null jika kunci tidak ada atau parsing gagal.
   *
   * @param {string} key - Kunci localStorage yang akan dibaca.
   * @returns {*} Nilai yang diparse, atau null pada kesalahan apa pun.
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[storage.get] Failed to read key "${key}":`, err);
      return null;
    }
  },

  /**
   * Serialisasi nilai sebagai JSON dan tulis ke localStorage.
   * Secara diam-diam mencatat peringatan jika penulisan gagal (misalnya kuota terlampaui).
   *
   * @param {string} key   - Kunci localStorage yang akan ditulis.
   * @param {*}      value - Nilai apa pun yang dapat diserialisasi JSON.
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage.set] Failed to write key "${key}":`, err);
    }
  },

  /**
   * Hapus kunci dari localStorage.
   * Secara diam-diam mengabaikan kesalahan.
   *
   * @param {string} key - Kunci localStorage yang akan dihapus.
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage.remove] Failed to remove key "${key}":`, err);
    }
  },
};

/* Konstanta kunci penyimpanan — sumber kebenaran tunggal */
const KEYS = {
  USER_NAME: 'tdl_user_name',
  USER_WISH: 'tdl_user_wish',
  TASKS:     'tdl_tasks',
  LINKS:     'tdl_links',
  THEME:     'tdl_theme',
};

/* ============================================================
   MANAJER TEMA
   Membaca / menulis preferensi tema dan menerapkannya ke <html>.
   Skrip flash-prevention aktual tinggal inline di <head>.
   ============================================================ */

/**
 * @namespace themeManager
 */
const themeManager = {
  /**
   * Inisialisasi manajer tema.
   * Membaca tema yang disimpan (default ke 'light') dan menerapkannya,
   * kemudian menghubungkan tombol toggle ke themeManager.toggle().
   */
  init() {
    const stored = storage.get(KEYS.THEME);
    // Default ke 'light' jika tidak ada tema valid yang disimpan (Req 10.5)
    const theme = stored === 'dark' ? 'dark' : 'light';
    this.apply(theme);

    // Hubungkan tombol toggle (Req 10.1, 10.2)
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },

  /**
   * Beralih antara tema 'light' dan 'dark'.
   * Mempertahankan tema baru ke penyimpanan (Req 10.2, 10.3).
   */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    storage.set(KEYS.THEME, next);
  },

  /**
   * Terapkan tema dengan menetapkan data-theme pada <html> dan memperbarui
   * label tombol toggle/aria-label.
   *
   * @param {'light'|'dark'} theme - Tema yang akan diterapkan.
   */
  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Perbarui ikon tombol toggle dan label yang dapat diakses
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  },
};

/* ============================================================
   WIDGET SALAM
   Menampilkan jam tangan langsung, tanggal saat ini, dan salam berbasis waktu.
   Secara opsional menambahkan nama pengguna yang disimpan ke salam.
   ============================================================ */

/**
 * @namespace greetingWidget
 */
const greetingWidget = {
  /** Nama pengguna yang di-cache dibaca dari penyimpanan pada init. */
  _name: '',

  /** Keinginan harian yang di-cache dibaca dari penyimpanan pada init. */
  _wish: '',

  /** Teks placeholder ditampilkan ketika tidak ada nama yang disimpan. */
  _NAME_PLACEHOLDER: 'Click to add your name here',

  /** Teks placeholder ditampilkan ketika tidak ada keinginan yang disimpan. */
  _WISH_PLACEHOLDER: 'Click to add your own wish',

  /**
   * Inisialisasi widget salam.
   * Membaca nama dan keinginan yang disimpan, memulai interval jam 1 detik,
   * dan menghubungkan kedua elemen yang dapat diedit secara inline. (task 22.4)
   */
  init() {
    // Baca nama yang disimpan
    const storedName = storage.get(KEYS.USER_NAME);
    this._name = (typeof storedName === 'string' && storedName.trim()) ? storedName.trim() : '';

    // Baca keinginan yang disimpan
    const storedWish = storage.get(KEYS.USER_WISH);
    this._wish = (typeof storedWish === 'string' && storedWish.trim()) ? storedWish.trim() : '';

    // Tick segera sehingga jam dan salam diisi sekaligus
    this.tick();

    // Mulai interval 1 detik — hidup selama seumur hidup halaman (Req 1.1)
    setInterval(() => this.tick(), 1000);

    // Hubungkan rentang nama untuk klik-ke-edit
    const nameSpan = document.getElementById('userNameDisplay');
    if (nameSpan) {
      nameSpan.addEventListener('click', () => {
        this._enterInlineEdit({
          el:          nameSpan,
          getValue:    () => this._name,
          onSave:      (val) => {
            this._name = val;
            if (val) storage.set(KEYS.USER_NAME, val);
            else     storage.remove(KEYS.USER_NAME);
            this.tick(); // render ulang teks dasar dengan/tanpa koma
          },
          editingClass:     'greeting-name-inline--editing',
          placeholderText:  this._NAME_PLACEHOLDER,
        });
      });
    }

    // Hubungkan div keinginan untuk klik-ke-edit
    const wishEl = document.getElementById('userWishDisplay');
    if (wishEl) {
      wishEl.addEventListener('click', () => {
        this._enterInlineEdit({
          el:          wishEl,
          getValue:    () => this._wish,
          onSave:      (val) => {
            this._wish = val;
            if (val) storage.set(KEYS.USER_WISH, val);
            else     storage.remove(KEYS.USER_WISH);
            this._renderWish(); // render ulang tampilan keinginan
          },
          editingClass:     'greeting-wish--editing',
          placeholderText:  this._WISH_PLACEHOLDER,
        });
      });
    }

    // Render keinginan sekali pada beban (tick jam menangani sisanya)
    this._renderWish();
  },

  /**
   * Render elemen keinginan dengan teks nyata atau placeholder. (task 22.4)
   */
  _renderWish() {
    const wishEl = document.getElementById('userWishDisplay');
    if (!wishEl || wishEl.contentEditable === 'true') return;
    if (this._wish) {
      wishEl.textContent = this._wish;
      wishEl.classList.remove('greeting-wish--placeholder');
    } else {
      wishEl.textContent = this._WISH_PLACEHOLDER;
      wishEl.classList.add('greeting-wish--placeholder');
    }
  },

  /**
   * Dipanggil setiap detik oleh interval jam.
   * Memperbarui waktu, tanggal, dan salam. Render placeholder nama ketika
   * tidak ada nama yang disimpan. (task 22.3)
   */
  tick() {
    const now = new Date();

    // --- Tampilan waktu (Req 1.1) ---
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeEl = document.getElementById('greeting-time');
    if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

    // --- Tampilan tanggal (Req 1.2) ---
    const dateEl = document.getElementById('greeting-date');
    if (dateEl) dateEl.textContent = this.formatDate(now);

    // --- Pesan salam (Req 1.3–1.8) ---
    const base    = this.getGreeting(now.getHours());
    const baseEl  = document.getElementById('greeting-base');
    const nameSpan = document.getElementById('userNameDisplay');

    if (baseEl) {
      // Tampilkan koma+spasi hanya ketika nama nyata ada
      baseEl.textContent = this._name ? `${base}, ` : `${base}, `;
    }

    // Hanya perbarui rentang nama ketika TIDAK sedang diedit
    if (nameSpan && nameSpan.contentEditable !== 'true') {
      if (this._name) {
        nameSpan.textContent = this._name;
        nameSpan.classList.remove('greeting-name-inline--placeholder');
      } else {
        nameSpan.textContent = this._NAME_PLACEHOLDER;
        nameSpan.classList.add('greeting-name-inline--placeholder');
      }
    }
  },

  /**
   * Pembantu edit inline generik yang digunakan oleh rentang nama dan
   * div keinginan. Menerima objek konfigurasi sehingga logika yang sama menangani
   * kedua elemen tanpa duplikasi. (task 22.5)
   *
   * @param {object} cfg
   * @param {HTMLElement} cfg.el             - Elemen yang akan dibuat dapat diedit.
   * @param {function}    cfg.getValue       - Mengembalikan nilai nyata saat ini.
   * @param {function}    cfg.onSave         - Dipanggil dengan nilai yang dipangkas pada commit.
   * @param {string}      cfg.editingClass   - Kelas CSS untuk ditambahkan selama penyuntingan.
   * @param {string}      cfg.placeholderText - Placeholder untuk dihapus pada awal edit.
   */
  _enterInlineEdit({ el, getValue, onSave, editingClass, placeholderText }) {
    // Penjaga: jangan masuk kembali jika sudah diedit
    if (el.contentEditable === 'true') return;

    // Benih dengan nilai nyata (atau kosong) sehingga pengguna mengetik di atas placeholder
    el.textContent = getValue() || '';

    el.contentEditable = 'true';
    el.classList.add(editingClass);
    el.focus();

    // Pilih semua teks sehingga pengguna dapat mengetik segera
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const exitEdit = () => {
      el.contentEditable = 'false';
      el.classList.remove(editingClass);
      el.removeEventListener('keydown', onKeydown);
      el.removeEventListener('blur', onBlur);
    };

    const commit = () => {
      const trimmed = el.textContent.trim();
      // Perlakukan teks placeholder itu sendiri sebagai "tidak ada nilai"
      const value = (trimmed && trimmed !== placeholderText) ? trimmed : '';
      exitEdit();
      onSave(value);
    };

    const onKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // blokir penyisipan <br>
        el.blur();          // memicu onBlur → commit
      }
      if (e.key === 'Escape') {
        el.textContent = getValue(); // pulihkan tanpa menyimpan
        exitEdit();
        // Render ulang untuk menampilkan placeholder jika diperlukan
        if (el.id === 'userNameDisplay') this.tick();
        else this._renderWish();
      }
    };

    const onBlur = () => commit();

    el.addEventListener('keydown', onKeydown);
    el.addEventListener('blur', onBlur);
  },

  /**
   * Petakan jam (0–23) ke string salam yang sesuai.
   * 05–11 → "Good morning"  (Req 1.3)
   * 12–17 → "Good afternoon" (Req 1.4)
   * 18–21 → "Good evening"  (Req 1.5)
   * 22–23, 0–4 → "Good night" (Req 1.6)
   *
   * @param {number} hour - Jam integer dalam [0, 23].
   * @returns {string} Salah satu dari "Good morning", "Good afternoon",
   *                   "Good evening", atau "Good night".
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good morning';
    if (hour >= 12 && hour <= 17) return 'Good afternoon';
    if (hour >= 18 && hour <= 21) return 'Good evening';
    return 'Good night'; // mencakup 22–23 dan 0–4
  },

  /**
   * Format objek Date menjadi string tanggal yang dapat dibaca manusia yang berisi
   * hari dalam seminggu, nama bulan, nomor hari, dan tahun empat digit.
   * Misalnya "Monday, January 1, 2025" (Req 1.2)
   *
   * @param {Date} date - Tanggal yang akan diformat.
   * @returns {string} Misalnya "Monday, January 1, 2025".
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });
  },
};

/* ============================================================
   WIDGET TIMER
   Hitung mundur Pomodoro 25 menit (1500 detik).
   Status disimpan hanya dalam memori — tidak bertahan ke localStorage.
   ============================================================ */

/**
 * @namespace timerWidget
 */
const timerWidget = {
  /** Detik yang tersisa dalam sesi saat ini. */
  remaining: 1500,

  /** Id yang dikembalikan oleh setInterval, atau null ketika tidak berjalan. */
  intervalId: null,

  /**
   * Instans AudioContext bersama.
   * Dibuat dengan malas pada klik Start pertama sehingga selalu
   * dibuat di dalam gesture pengguna, memuaskan kebijakan autoplay browser.
   * @type {AudioContext|null}
   */
  _audioCtx: null,

  /** GainNode master untuk alarm aktif, atau null ketika senyap. */
  _alarmGain: null,

  /** Id setTimeout untuk fallback auto-mute, atau null. */
  _alarmAutoStopId: null,

  /**
   * Buat (atau lanjutkan) AudioContext pada interaksi pengguna pertama.
   * Harus dipanggil dari dalam penangan klik untuk memuaskan
   * kebijakan autoplay browser dan menjamin alarm akan diputar nanti.
   */
  _unlockAudio() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!this._audioCtx) {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Lanjutkan jika konteks ditangguhkan (misalnya tab di latar belakang)
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
  },

  /**
   * Putar alarm berkelanjutan selama ALARM_DURATION detik menggunakan Web
   * Audio API. Alarm adalah pola berulang dari bip pendek 880 Hz
   * berjarak 400 ms terpisah, dijadwalkan sebelumnya sehingga thread audio browser
   * tidak pernah ada celah. GainNode master disimpan sehingga _muteAlarm() dapat
   * menurunkannya ke senyap secara instan tanpa klik yang terdengar.
   */
  _playAlarm() {
    const ctx = this._audioCtx;
    if (!ctx) return;

    const ALARM_DURATION = 10;    // total detik alarm berjalan
    const BEEP_FREQ      = 880;   // Hz — A5, jelas dan menarik perhatian
    const BEEP_DURATION  = 0.22;  // detik setiap bip terdengar
    const BEEP_SPACING   = 0.4;   // detik antara awal bip
    const VOLUME         = 0.35;

    // Gain master — menurunkan ini ke 0 adalah cara _muteAlarm() membisukan semuanya
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(VOLUME, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this._alarmGain = masterGain;

    // Jadwalkan semua bip untuk jendela alarm penuh
    const beepCount = Math.floor(ALARM_DURATION / BEEP_SPACING);
    for (let i = 0; i < beepCount; i++) {
      const startAt = ctx.currentTime + i * BEEP_SPACING;
      if (startAt >= ctx.currentTime + ALARM_DURATION) break;

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type            = 'sine';
      osc.frequency.value = BEEP_FREQ;

      // Amplop per-bip: serangan → peluruhan eksponensial ke hampir-senyap
      gain.gain.setValueAtTime(1, startAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + BEEP_DURATION);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startAt);
      osc.stop(startAt + BEEP_DURATION + 0.05);
    }

    // Auto-mute setelah ALARM_DURATION detik jika pengguna belum mengklik
    this._alarmAutoStopId = setTimeout(() => this._muteAlarm(), ALARM_DURATION * 1000);
  },

  /**
   * Bisukan alarm segera dan pulihkan keadaan UI normal.
   * Aman untuk dipanggil berkali-kali (idempoten).
   */
  _muteAlarm() {
    // Turunkan gain master ke senyap selama 80 ms untuk menghindari klik
    if (this._alarmGain && this._audioCtx) {
      const ctx = this._audioCtx;
      this._alarmGain.gain.cancelScheduledValues(ctx.currentTime);
      this._alarmGain.gain.setValueAtTime(this._alarmGain.gain.value, ctx.currentTime);
      this._alarmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      this._alarmGain = null;
    }

    // Batalkan timeout auto-stop jika dibisukan lebih awal
    if (this._alarmAutoStopId !== null) {
      clearTimeout(this._alarmAutoStopId);
      this._alarmAutoStopId = null;
    }

    // Pulihkan tombol Stop dan sembunyikan petunjuk
    this._setAlarmUI(false);
  },

  /**
   * Alihkan keadaan UI "MUTE ALARM" pada tombol Stop.
   *
   * @param {boolean} alarming - true saat alarm berbunyi, false sebaliknya.
   */
  _setAlarmUI(alarming) {
    const stopBtn = document.getElementById('timer-stop');

    if (stopBtn) {
      if (alarming) {
        stopBtn.textContent = 'MUTE ALARM';
        stopBtn.disabled    = false;
        stopBtn.classList.add('btn--mute');
        stopBtn.classList.remove('btn--secondary');
      } else {
        stopBtn.textContent = 'Stop';
        stopBtn.classList.remove('btn--mute');
        stopBtn.classList.add('btn--secondary');
        stopBtn.disabled = true;
      }
    }
  },

  /**
   * Inisialisasi widget timer.
   * Menetapkan sisa ke 1500, merender tampilan, dan mengikat tombol.
   * (Req 3.1, 3.7)
   */
  init() {
    this.remaining = 1500;
    this.intervalId = null;
    this._alarmGain = null;
    this._alarmAutoStopId = null;
    this.render();
    this.setButtonStates(false);

    // Sembunyikan indikator penyelesaian pada init
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = true;

    // Hubungkan tombol Start (Req 3.2, 3.4)
    const startBtn = document.getElementById('timer-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    // Tombol Stop berlipat ganda sebagai MUTE ALARM ketika alarm berbunyi
    const stopBtn = document.getElementById('timer-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (this._alarmGain !== null) {
          this._muteAlarm();   // alarm aktif — bisukan
        } else {
          this.stop();         // perilaku jeda normal
        }
      });
    }

    // Hubungkan tombol Reset (Req 3.5)
    const resetBtn = document.getElementById('timer-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  },

  /**
   * Mulai interval hitung mundur.
   * Menjaga terhadap double-starting jika sudah berjalan.
   * Memperbarui keadaan tombol untuk mencerminkan keadaan berjalan. (Req 3.2, 3.8)
   */
  start() {
    if (this.intervalId !== null) return; // sudah berjalan
    // Buka kunci / lanjutkan AudioContext di dalam gesture pengguna ini sehingga
    // alarm dijamin akan diputar ketika sesi berakhir.
    this._unlockAudio();
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.setButtonStates(true);
  },

  /**
   * Hentikan (jeda) interval hitung mundur.
   * Menghapus interval dan memperbarui keadaan tombol. (Req 3.3, 3.9)
   */
  stop() {
    if (this.intervalId === null) return; // sudah berhenti
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.setButtonStates(false);
  },

  /**
   * Dipanggil setiap detik oleh interval hitung mundur.
   * Mengurangi sisa dan merender ulang; memanggil onComplete() pada 0. (Req 3.2, 3.6)
   */
  tick() {
    this.remaining -= 1;
    // Jepit ke 0 sehingga tidak pernah menjadi negatif
    if (this.remaining < 0) this.remaining = 0;
    this.render();
    if (this.remaining <= 0) {
      this.onComplete();
    }
  },

  /**
   * Hentikan interval aktif apa pun dan pulihkan sisa ke 1500.
   * Render ulang tampilan dan atur ulang keadaan tombol. (Req 3.5)
   */
  reset() {
    // Bunuh alarm aktif terlebih dahulu (juga memulihkan tombol Stop)
    this._muteAlarm();
    this.stop();
    this.remaining = 1500;
    this.render();
    this.setButtonStates(false);

    // Sembunyikan indikator penyelesaian saat mengatur ulang
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = true;
  },

  /**
   * Dipanggil ketika hitung mundur mencapai 0.
   * Menghentikan timer dan menampilkan indikator penyelesaian visual. (Req 3.6)
   */
  onComplete() {
    this.stop();
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = false;
    // Tampilkan tombol MUTE ALARM + petunjuk, kemudian mulai alarm 10 detik
    this._setAlarmUI(true);
    this._playAlarm();
  },

  /**
   * Aktifkan atau nonaktifkan tombol Start, Stop, dan Reset berdasarkan
   * apakah timer saat ini berjalan. (Req 3.8, 3.9)
   *
   * @param {boolean} running - True jika timer sedang hitung mundur.
   */
  setButtonStates(running) {
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) startBtn.disabled = running;
    if (stopBtn)  stopBtn.disabled  = !running;
    if (resetBtn) resetBtn.disabled = !running;
  },

  /**
   * Format sejumlah detik sebagai string MM:SS yang diisi nol.
   * Misalnya formatTime(1500) → "25:00", formatTime(299) → "04:59". (Req 3.7)
   *
   * @param {number} seconds - Integer dalam [0, 1500].
   * @returns {string} String MM:SS yang diisi nol.
   */
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  /**
   * Tulis waktu sisa saat ini ke elemen #timer-display.
   * Dipanggil setelah setiap perubahan keadaan yang mempengaruhi tampilan. (Req 3.7)
   */
  render() {
    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = this.formatTime(this.remaining);
  },
};

/* ============================================================
   TODO WIDGET
   Task list with add, edit, complete, and delete operations.
   Persists to localStorage under KEYS.TASKS.
   ============================================================ */

/**
 * @namespace todoWidget
 */
const todoWidget = {
  /** In-memory array of Task objects. Populated by init(). */
  tasks: [],

  /** Tracks the id of the task currently being dragged. */
  _dragId: null,

  /**
   * Initialise the todo widget.
   * Reads persisted tasks from storage, renders the list, and wires
   * the Add button and Enter-key handler on the input. (Req 4.1)
   */
  init() {
    // Load persisted tasks (populated fully in Task 8; safe to call now)
    const stored = storage.get(KEYS.TASKS);
    this.tasks = Array.isArray(stored) ? stored : [];

    // Render the list (renderList implemented in Task 7; no-op placeholder is fine)
    this.renderList();

    // Wire Add button (Req 4.1)
    const addBtn = document.getElementById('todo-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = document.getElementById('todo-input');
        const result = this.addTask(input ? input.value : '');
        this._showValidation(result.ok ? '' : result.error || '');
      });
    }

    // Allow submitting with Enter key from the input field
    const input = document.getElementById('todo-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const result = this.addTask(input.value);
          this._showValidation(result.ok ? '' : result.error || '');
        }
      });
    }
  },

  /**
   * Show or clear the inline validation message. (Req 4.3, 4.4)
   *
   * @param {string} message - The message to display, or '' to clear.
   */
  _showValidation(message) {
    const el = document.getElementById('todo-validation');
    if (el) el.textContent = message;
  },

  /**
   * Validate a task label before adding or editing.
   * Trims the label, checks for empty/whitespace (EMPTY) and
   * case-insensitive duplicate against existing tasks (DUPLICATE).
   *
   * @param {string}  label      - The label to validate (will be trimmed).
   * @param {string} [excludeId] - Task id to exclude from duplicate check (for edits).
   * @returns {{ valid: boolean, error?: 'EMPTY'|'DUPLICATE' }}
   */
  validateLabel(label, excludeId) {
    const trimmed = (label || '').trim();

    // Reject empty or whitespace-only labels (Req 4.3)
    if (trimmed.length === 0) {
      return { valid: false, error: 'EMPTY' };
    }

    // Reject case-insensitive duplicates (Req 4.4)
    const lower = trimmed.toLowerCase();
    const isDuplicate = this.tasks.some(
      (t) => t.id !== excludeId && t.label.toLowerCase() === lower
    );
    if (isDuplicate) {
      return { valid: false, error: 'DUPLICATE' };
    }

    return { valid: true };
  },

  /**
   * Add a new task to the list.
   * Validates the label, creates a Task object, appends it, persists,
   * and clears the input field. (Req 4.2, 4.3, 4.4, 4.5)
   *
   * @param {string} label - The task label entered by the user.
   * @returns {{ ok: boolean, error?: string }}
   */
  addTask(label) {
    const trimmed = (label || '').trim();
    const validation = this.validateLabel(trimmed);

    if (!validation.valid) {
      // Map error codes to human-readable messages (Req 4.3, 4.4)
      const message = validation.error === 'DUPLICATE'
        ? 'A task with that name already exists.'
        : 'Task label cannot be empty.';
      return { ok: false, error: message };
    }

    // Create the Task object (Req 4.2)
    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    this.tasks.push(task);
    this.persist();
    this.renderList();

    // Clear the input field (Req 4.5)
    const input = document.getElementById('todo-input');
    if (input) input.value = '';

    return { ok: true };
  },

  /**
   * Edit an existing task's label.
   * Validates the new label (excluding the task being edited from
   * duplicate checks), updates the task, persists, and re-renders.
   * (Req 5.3, 5.4, 5.5)
   *
   * @param {string} id       - The id of the task to edit.
   * @param {string} newLabel - The replacement label.
   * @returns {{ ok: boolean, error?: string }}
   */
  editTask(id, newLabel) {
    const trimmed = (newLabel || '').trim();
    const validation = this.validateLabel(trimmed, id);

    if (!validation.valid) {
      // Map error codes to human-readable messages (Req 5.4, 5.5)
      const message = validation.error === 'DUPLICATE'
        ? 'A task with that name already exists.'
        : 'Task label cannot be empty.';
      return { ok: false, error: message };
    }

    // Find and update the task (Req 5.3)
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { ok: false, error: 'Task not found.' };

    task.label = trimmed;
    this.persist();
    this.renderList();

    return { ok: true };
  },

  /**
   * Toggle the completed state of a task and persist.
   * (Req 6.2)
   *
   * @param {string} id - The id of the task to toggle.
   */
  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this.persist();
    this.renderList();
  },

  /**
   * Remove a task from the list and persist.
   * (Req 6.5)
   *
   * @param {string} id - The id of the task to delete.
   */
  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persist();
    this.renderList();
  },

  /**
   * Re-render the full task list DOM.
   * Clears the #todo-list element, appends a rendered item for each
   * task, and toggles the empty-state message. (Req 7.2)
   */
  renderList() {
    const listEl = document.getElementById('todo-list');
    const emptyEl = document.getElementById('todo-empty');
    if (!listEl) return;

    // Clear existing items
    listEl.innerHTML = '';

    if (this.tasks.length === 0) {
      // Show empty-state message (Req 7.2)
      if (emptyEl) emptyEl.hidden = false;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      this.tasks.forEach((task) => {
        listEl.appendChild(this.renderTask(task));
      });
    }
  },

  /**
   * Build and return a DOM element representing a single task.
   * Includes a completion checkbox, label, edit button, and delete button.
   * Applies the `task--completed` CSS class when the task is completed.
   * Supports HTML5 drag-and-drop for reordering.
   * (Req 5.1, 6.1, 6.3, 6.4)
   *
   * @param {{ id: string, label: string, completed: boolean }} task
   * @returns {HTMLElement} An <li> element for the task.
   */
  renderTask(task) {
    const li = document.createElement('li');
    // Apply completed class for strikethrough styling (Req 6.3, 7.7)
    li.className = 'todo-item' + (task.completed ? ' todo-item--completed task--completed' : '');
    li.dataset.id = task.id;
    li.draggable = true;

    // --- Completion checkbox (Req 6.1) ---
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.label}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => this.toggleTask(task.id));

    // --- Label span ---
    const labelSpan = document.createElement('span');
    labelSpan.className = 'todo-item__label';
    labelSpan.textContent = task.label;

    // --- Actions container ---
    const actions = document.createElement('div');
    actions.className = 'todo-item__actions';

    // --- Edit button (Req 5.1) ---
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--icon';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit task: ${task.label}`);
    editBtn.addEventListener('click', () => this._enterEditMode(li, task));

    // --- Delete button (Req 6.4) ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--icon';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.label}`);
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(labelSpan);
    li.appendChild(actions);

    // --- Drag-and-drop events ---
    li.addEventListener('dragstart', (e) => {
      this._dragId = task.id;
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => li.classList.add('dragging'));
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      document.querySelectorAll('#todo-list .drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (task.id !== this._dragId) li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      if (!this._dragId || this._dragId === task.id) return;

      const fromIdx = this.tasks.findIndex(t => t.id === this._dragId);
      const toIdx   = this.tasks.findIndex(t => t.id === task.id);
      if (fromIdx === -1 || toIdx === -1) return;

      // Reorder in-memory array
      const [moved] = this.tasks.splice(fromIdx, 1);
      this.tasks.splice(toIdx, 0, moved);

      this.persist();
      this.renderList();
    });

    return li;
  },

  /**
   * Replace the task label with an editable input and confirm/cancel controls.
   * Called when the user clicks the Edit button on a task item. (Req 5.2, 5.6)
   *
   * @param {HTMLElement} li   - The <li> element for the task.
   * @param {Task}        task - The task data object.
   */
  _enterEditMode(li, task) {
    // Swap label span for an input pre-populated with the current label (Req 5.2)
    const labelSpan = li.querySelector('.todo-item__label');
    const actionsDiv = li.querySelector('.todo-item__actions');

    // Build the edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'input';
    editInput.value = task.label;
    editInput.setAttribute('aria-label', 'Edit task label');
    editInput.style.flex = '1';

    // Inline validation message for edit errors
    const editValidation = document.createElement('span');
    editValidation.className = 'validation-message';
    editValidation.setAttribute('role', 'alert');
    editValidation.style.fontSize = 'var(--font-size-sm)';

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary';
    confirmBtn.textContent = '✓';
    confirmBtn.setAttribute('aria-label', 'Confirm edit');

    // Cancel button (Req 5.6)
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--secondary';
    cancelBtn.textContent = '✕';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');

    // Replace label with input
    li.replaceChild(editInput, labelSpan);

    // Replace actions with confirm/cancel
    const editActions = document.createElement('div');
    editActions.className = 'todo-item__actions';
    editActions.appendChild(confirmBtn);
    editActions.appendChild(cancelBtn);
    li.replaceChild(editActions, actionsDiv);

    // Insert validation message after the input
    editInput.insertAdjacentElement('afterend', editValidation);

    // Focus the input
    editInput.focus();
    editInput.select();

    // Confirm handler (Req 5.3, 5.4, 5.5)
    const confirm = () => {
      const result = this.editTask(task.id, editInput.value);
      if (!result.ok) {
        // Show inline validation error (Req 5.4, 5.5)
        editValidation.textContent = result.error || 'Invalid label.';
      }
      // On success, renderList() called inside editTask() re-renders the whole list
    };

    // Cancel handler (Req 5.6)
    const cancel = () => {
      this.renderList(); // discard changes, restore read-only view
    };

    confirmBtn.addEventListener('click', confirm);
    cancelBtn.addEventListener('click', cancel);

    // Allow Enter to confirm and Escape to cancel
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
      if (e.key === 'Escape') cancel();
    });
  },

  /**
   * Serialise the tasks array as JSON and write it to localStorage.
   * (Req 4.2, 7.3)
   */
  persist() {
    storage.set(KEYS.TASKS, this.tasks);
  },
};

/* ============================================================
   LINKS WIDGET
   Quick-links panel with add and delete operations.
   Persists to localStorage under KEYS.LINKS.
   ============================================================ */

/**
 * @namespace linksWidget
 */
const linksWidget = {
  /** In-memory array of Link objects. Populated by init(). */
  links: [],

  /** Tracks the id of the link currently being dragged. */
  _dragId: null,

  /**
   * Initialise the links widget.
   * Reads persisted links from storage, renders the panel, and wires
   * the Add button. (Req 8.1, 8.6)
   */
  init() {
    // Load persisted links from storage (Req 8.6)
    const stored = storage.get(KEYS.LINKS);
    this.links = Array.isArray(stored) ? stored : [];

    // Render the panel with any persisted links
    this.renderPanel();

    // Wire the Add button (Req 8.1)
    const addBtn = document.getElementById('links-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const labelInput = document.getElementById('link-label-input');
        const urlInput   = document.getElementById('link-url-input');
        const label = labelInput ? labelInput.value : '';
        const url   = urlInput   ? urlInput.value   : '';
        const result = this.addLink(label, url);
        if (!result.ok) {
          this._showValidation(result.error || '');
        }
      });
    }
  },

  /**
   * Show or clear the inline validation message. (Req 8.3, 8.4)
   *
   * @param {string} message - The message to display, or '' to clear.
   */
  _showValidation(message) {
    const el = document.getElementById('links-validation');
    if (el) el.textContent = message;
  },

  /**
   * Validate a link label and URL before adding.
   * Trims both values; rejects empty label or URL (EMPTY) and URLs
   * that don't start with http:// or https:// (INVALID_URL). (Req 8.3, 8.4)
   *
   * @param {string} label - The display label (will be trimmed).
   * @param {string} url   - The URL (must start with http:// or https://).
   * @returns {{ valid: boolean, error?: 'EMPTY'|'INVALID_URL' }}
   */
  validateLink(label, url) {
    const trimmedLabel = (label || '').trim();
    const trimmedUrl   = (url   || '').trim();

    // Reject empty label or URL (Req 8.3)
    if (trimmedLabel.length === 0 || trimmedUrl.length === 0) {
      return { valid: false, error: 'EMPTY' };
    }

    // Reject URLs that don't start with http:// or https:// (Req 8.4)
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { valid: false, error: 'INVALID_URL' };
    }

    return { valid: true };
  },

  /**
   * Add a new link to the panel.
   * Validates inputs, creates a Link object, appends it, persists,
   * and clears the input fields. (Req 8.2, 8.3, 8.4)
   *
   * @param {string} label - The display label.
   * @param {string} url   - The URL.
   * @returns {{ ok: boolean, error?: string }}
   */
  addLink(label, url) {
    const trimmedLabel = (label || '').trim();
    const trimmedUrl   = (url   || '').trim();
    const validation   = this.validateLink(trimmedLabel, trimmedUrl);

    if (!validation.valid) {
      // Map error codes to human-readable messages (Req 8.3, 8.4)
      const message = validation.error === 'INVALID_URL'
        ? 'URL must start with http:// or https://'
        : 'Label and URL cannot be empty.';
      return { ok: false, error: message };
    }

    // Create the Link object (Req 8.2)
    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: trimmedLabel,
      url:   trimmedUrl,
      createdAt: Date.now(),
    };

    this.links.push(link);
    this.persist();
    this.renderPanel();

    // Clear the input fields on success
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';

    // Clear any previous validation message
    this._showValidation('');

    return { ok: true };
  },

  /**
   * Remove a link from the panel and persist.
   * (Req 9.2 — implemented in Task 10, stub kept here for completeness)
   *
   * @param {string} id - The id of the link to delete.
   */
  deleteLink(id) {
    this.links = this.links.filter((l) => l.id !== id);
    this.persist();
    this.renderPanel();
  },

  /**
   * Re-render the full links panel DOM.
   * Clears #links-list, appends a rendered item for each link,
   * and toggles the empty-state message. (Req 8.6)
   */
  renderPanel() {
    const listEl  = document.getElementById('links-list');
    const emptyEl = document.getElementById('links-empty');
    if (!listEl) return;

    // Clear existing items
    listEl.innerHTML = '';

    if (this.links.length === 0) {
      // Show empty-state message
      if (emptyEl) emptyEl.hidden = false;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      this.links.forEach((link) => {
        listEl.appendChild(this.renderLink(link));
      });
    }
  },

  /**
   * Build and return a DOM element representing a single link.
   * Rendered as a horizontal pill: label button on the left,
   * compact × delete button on the right. (task 21.4, Req 8.5)
   * Supports HTML5 drag-and-drop for reordering.
   *
   * @param {{ id: string, label: string, url: string }} link
   * @returns {HTMLElement} An <li> element for the link.
   */
  renderLink(link) {
    const li = document.createElement('li');
    li.className = 'link-item';
    li.dataset.id = link.id;
    li.draggable = true;

    // --- Favicon icon: extracted domain used only for the icon src ---
    const favicon = document.createElement('img');
    favicon.className = 'link-item__favicon';
    favicon.width  = 16;
    favicon.height = 16;
    favicon.alt    = '';          // decorative — label already describes the link
    favicon.setAttribute('aria-hidden', 'true');
    try {
      const domain = new URL(link.url).hostname;
      favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch (_) {
      // Malformed URL — leave src empty so the CSS fallback kicks in
      favicon.src = '';
    }
    // Hide broken-image icon; CSS fallback background takes over
    favicon.addEventListener('error', () => favicon.classList.add('link-item__favicon--error'));

    // --- Link button: opens URL in new tab (Req 8.5) ---
    const linkBtn = document.createElement('button');
    linkBtn.className = 'link-item__btn';
    linkBtn.setAttribute('aria-label', `Open ${link.label}`);

    // Icon goes BEFORE the label text inside the button
    linkBtn.appendChild(favicon);
    linkBtn.appendChild(document.createTextNode(link.label));
    linkBtn.addEventListener('click', () => {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    // --- × delete button: compact, inline inside the pill (task 21.4) ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'link-item__delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
    deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

    // --- Drag-and-drop events ---
    li.addEventListener('dragstart', (e) => {
      this._dragId = link.id;
      e.dataTransfer.effectAllowed = 'move';
      // Slight delay so the ghost image renders before opacity drops
      requestAnimationFrame(() => li.classList.add('dragging'));
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      // Clean up any lingering drag-over highlights
      document.querySelectorAll('#links-list .drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (link.id !== this._dragId) li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      if (!this._dragId || this._dragId === link.id) return;

      const fromIdx = this.links.findIndex(l => l.id === this._dragId);
      const toIdx   = this.links.findIndex(l => l.id === link.id);
      if (fromIdx === -1 || toIdx === -1) return;

      // Reorder in-memory array
      const [moved] = this.links.splice(fromIdx, 1);
      this.links.splice(toIdx, 0, moved);

      this.persist();
      this.renderPanel();
    });

    li.appendChild(linkBtn);
    li.appendChild(deleteBtn);

    return li;
  },

  /**
   * Serialise the links array as JSON and write it to localStorage.
   * (Req 8.2, 9.2)
   */
  persist() {
    storage.set(KEYS.LINKS, this.links);
  },
};

/* ============================================================
   QUOTES WIDGET
   Displays a random motivational quote (English) related to
   office work and professional productivity.
   Quotes are hardcoded — no external API is used.
   A new quote is shown on page load and then rotated every
   1 minute via setInterval. (task 18)
   ============================================================ */

/**
 * @namespace quotesWidget
 */
const quotesWidget = {
  /**
   * Hardcoded array of English motivational quotes about
   * office work, workplace productivity, and professional motivation.
   *
   * @type {string[]}
   */
  quotes: [
    '"Hard work today is the best investment for your future."',
    '"Productivity isn\'t about how busy you are, but how effectively you work."',
    '"Every completed task is one step closer to your goals."',
    '"Professionalism is doing your best work even when no one is watching."',
    '"Focus on the process, and the results will take care of themselves."',
    '"Good collaboration in the workplace is the key to shared success."',
    '"Don\'t delay today\'s work — time is an asset that can never be recovered."',
    '"The secret of getting ahead is getting started."',
    '"Success is the sum of small efforts, repeated day in and day out."',
    '"Great things are not done by impulse, but by a series of small things brought together."',
    '"Don\'t watch the clock; do what it does. Keep going."',
    '"The only way to do great work is to love what you do."',
  ],

  /**
   * Return a random quote from the quotes array.
   *
   * How the randomizer works:
   *   Math.random() returns a float in [0, 1).
   *   Multiplying by the array length gives a float in [0, length).
   *   Math.floor() truncates it to a valid integer index. (task 15.3)
   *
   * @returns {string} A randomly selected quote.
   */
  getRandomQuote() {
    // Math.floor(Math.random() * n) gives a uniform random integer in [0, n-1]
    const index = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[index];
  },

  /**
   * Initialise the quotes widget.
   * Displays a random quote immediately on page load, then uses
   * setInterval to swap to a new random quote every 1 minute.
   *
   * Why setInterval?
   *   setInterval(fn, ms) calls fn repeatedly every ms milliseconds
   *   for the lifetime of the page — perfect for periodic UI updates
   *   that don't need to be cancelled. 60,000 ms = 1 minute. (task 18.2)
   */
  init() {
    const el = document.getElementById('quotes-text');
    if (!el) return;

    // Show a random quote immediately on load
    el.textContent = this.getRandomQuote();

    // Rotate to a new random quote every 1 minute (60,000 ms).
    // setInterval keeps firing at the given interval until the page
    // is closed or the interval is explicitly cleared with clearInterval().
    setInterval(() => {
      el.textContent = this.getRandomQuote();
    }, 60_000); // 60,000 ms = 1 minute
  },
};

/* ============================================================
   ENTRY POINT
   Called once the DOM is fully parsed.
   Initialises all widgets in dependency order.
   ============================================================ */

/**
 * Main entry point for the dashboard.
 * Initialises the theme manager first (so the correct theme is
 * applied before any widget renders), then initialises each widget.
 */
function init() {
  themeManager.init();
  greetingWidget.init();
  timerWidget.init();
  todoWidget.init();
  linksWidget.init();
  quotesWidget.init();
}

document.addEventListener('DOMContentLoaded', init);
