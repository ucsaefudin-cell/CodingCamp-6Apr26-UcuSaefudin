/**
 * app.js — To-Do Life Dashboard
 *
 * Single JavaScript module for the entire dashboard.
 * Organised into:
 *   1. Storage helpers  — thin wrappers around localStorage
 *   2. Theme Manager    — light/dark theme switching
 *   3. Greeting Widget  — live clock, date, and personalised greeting
 *   4. Timer Widget     — 25-minute Pomodoro countdown
 *   5. Todo Widget      — task list with add / edit / complete / delete
 *   6. Links Widget     — quick-links panel with add / delete
 *   7. init()           — entry point, wires everything together on DOMContentLoaded
 */

'use strict';

/* ============================================================
   STORAGE HELPERS
   All localStorage reads and writes go through these helpers.
   They handle JSON serialisation and catch quota / security
   errors so the rest of the app never has to deal with them.
   ============================================================ */

/**
 * @namespace storage
 */
const storage = {
  /**
   * Read a value from localStorage and parse it as JSON.
   * Returns null if the key is absent or parsing fails.
   *
   * @param {string} key - The localStorage key to read.
   * @returns {*} The parsed value, or null on any error.
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
   * Serialise a value as JSON and write it to localStorage.
   * Silently logs a warning if the write fails (e.g. quota exceeded).
   *
   * @param {string} key   - The localStorage key to write.
   * @param {*}      value - Any JSON-serialisable value.
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage.set] Failed to write key "${key}":`, err);
    }
  },

  /**
   * Remove a key from localStorage.
   * Silently ignores errors.
   *
   * @param {string} key - The localStorage key to remove.
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage.remove] Failed to remove key "${key}":`, err);
    }
  },
};

/* Storage key constants — single source of truth */
const KEYS = {
  USER_NAME: 'tdl_user_name',
  TASKS:     'tdl_tasks',
  LINKS:     'tdl_links',
  THEME:     'tdl_theme',
};

/* ============================================================
   THEME MANAGER
   Reads / writes the theme preference and applies it to <html>.
   The actual flash-prevention script lives inline in <head>.
   ============================================================ */

/**
 * @namespace themeManager
 */
const themeManager = {
  /**
   * Initialise the theme manager.
   * Reads the stored theme (defaulting to 'light') and applies it,
   * then wires the toggle button to themeManager.toggle().
   */
  init() {
    const stored = storage.get(KEYS.THEME);
    // Default to 'light' if no valid theme is stored (Req 10.5)
    const theme = stored === 'dark' ? 'dark' : 'light';
    this.apply(theme);

    // Wire the toggle button (Req 10.1, 10.2)
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },

  /**
   * Toggle between 'light' and 'dark' themes.
   * Persists the new theme to storage (Req 10.2, 10.3).
   */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    storage.set(KEYS.THEME, next);
  },

  /**
   * Apply a theme by setting data-theme on <html> and updating
   * the toggle button label/aria-label.
   *
   * @param {'light'|'dark'} theme - The theme to apply.
   */
  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Update toggle button icon and accessible label
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  },
};

/* ============================================================
   GREETING WIDGET
   Shows the live clock, current date, and a time-based greeting.
   Optionally appends the stored user name to the greeting.
   ============================================================ */

/**
 * @namespace greetingWidget
 */
const greetingWidget = {
  /**
   * Initialise the greeting widget.
   * Reads the stored user name, starts the 1-second clock interval,
   * and performs an immediate tick so the UI is populated at once.
   */
  init() {
    // Placeholder — implemented in Task 3
  },

  /**
   * Called every second by the clock interval.
   * Updates the time, date, and greeting DOM elements.
   */
  tick() {
    // Placeholder — implemented in Task 3
  },

  /**
   * Map an hour (0–23) to the appropriate greeting string.
   *
   * @param {number} hour - Integer hour in [0, 23].
   * @returns {string} One of "Good morning", "Good afternoon",
   *                   "Good evening", or "Good night".
   */
  getGreeting(hour) {
    // Placeholder — implemented in Task 3
    return 'Hello';
  },

  /**
   * Format a Date object into a human-readable date string containing
   * the day of the week, month name, day number, and four-digit year.
   *
   * @param {Date} date - The date to format.
   * @returns {string} E.g. "Monday, January 1, 2025".
   */
  formatDate(date) {
    // Placeholder — implemented in Task 3
    return '';
  },
};

/* ============================================================
   TIMER WIDGET
   25-minute (1500-second) Pomodoro countdown.
   State is kept in memory only — not persisted to localStorage.
   ============================================================ */

/**
 * @namespace timerWidget
 */
const timerWidget = {
  /**
   * Initialise the timer widget.
   * Sets remaining to 1500, renders the display, and binds buttons.
   */
  init() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Start the countdown interval.
   * Updates button states to reflect the running state.
   */
  start() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Stop (pause) the countdown interval.
   * Updates button states to reflect the paused state.
   */
  stop() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Called every second by the countdown interval.
   * Decrements remaining; calls onComplete() when it reaches 0.
   */
  tick() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Stop any active interval and restore remaining to 1500.
   * Re-renders the display and resets button states.
   */
  reset() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Called when the countdown reaches 0.
   * Stops the timer and shows the visual completion indicator.
   */
  onComplete() {
    // Placeholder — implemented in Task 5
  },

  /**
   * Enable or disable the Start, Stop, and Reset buttons based on
   * whether the timer is currently running.
   *
   * @param {boolean} running - True if the timer is counting down.
   */
  setButtonStates(running) {
    // Placeholder — implemented in Task 5
  },

  /**
   * Format a number of seconds as a zero-padded MM:SS string.
   *
   * @param {number} seconds - Integer in [0, 1500].
   * @returns {string} E.g. "25:00" or "04:59".
   */
  formatTime(seconds) {
    // Placeholder — implemented in Task 5
    return '25:00';
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
  /**
   * Initialise the todo widget.
   * Reads persisted tasks from storage and renders the list.
   */
  init() {
    // Placeholder — implemented in Tasks 6–8
  },

  /**
   * Validate a task label before adding or editing.
   *
   * @param {string}  label     - The label to validate (will be trimmed).
   * @param {string} [excludeId] - Task id to exclude from duplicate check (for edits).
   * @returns {{ valid: boolean, error?: 'EMPTY'|'DUPLICATE' }}
   */
  validateLabel(label, excludeId) {
    // Placeholder — implemented in Task 6
    return { valid: true };
  },

  /**
   * Add a new task to the list.
   * Validates the label, creates a Task object, appends it, persists,
   * and clears the input field.
   *
   * @param {string} label - The task label entered by the user.
   * @returns {{ ok: boolean, error?: string }}
   */
  addTask(label) {
    // Placeholder — implemented in Task 6
    return { ok: false };
  },

  /**
   * Edit an existing task's label.
   * Validates the new label (excluding the task being edited from
   * duplicate checks), updates the task, and persists.
   *
   * @param {string} id       - The id of the task to edit.
   * @param {string} newLabel - The replacement label.
   * @returns {{ ok: boolean, error?: string }}
   */
  editTask(id, newLabel) {
    // Placeholder — implemented in Task 7
    return { ok: false };
  },

  /**
   * Toggle the completed state of a task and persist.
   *
   * @param {string} id - The id of the task to toggle.
   */
  toggleTask(id) {
    // Placeholder — implemented in Task 7
  },

  /**
   * Remove a task from the list and persist.
   *
   * @param {string} id - The id of the task to delete.
   */
  deleteTask(id) {
    // Placeholder — implemented in Task 7
  },

  /**
   * Re-render the full task list DOM.
   * Shows the empty-state message when the list is empty.
   */
  renderList() {
    // Placeholder — implemented in Task 7
  },

  /**
   * Build and return a DOM element representing a single task.
   *
   * @param {{ id: string, label: string, completed: boolean }} task
   * @returns {HTMLElement}
   */
  renderTask(task) {
    // Placeholder — implemented in Task 7
    return document.createElement('li');
  },

  /**
   * Serialise the tasks array as JSON and write it to localStorage.
   */
  persist() {
    // Placeholder — implemented in Task 8
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
  /**
   * Initialise the links widget.
   * Reads persisted links from storage and renders the panel.
   */
  init() {
    // Placeholder — implemented in Tasks 9–10
  },

  /**
   * Validate a link label and URL before adding.
   *
   * @param {string} label - The display label (will be trimmed).
   * @param {string} url   - The URL (must start with http:// or https://).
   * @returns {{ valid: boolean, error?: 'EMPTY'|'INVALID_URL' }}
   */
  validateLink(label, url) {
    // Placeholder — implemented in Task 9
    return { valid: true };
  },

  /**
   * Add a new link to the panel.
   * Validates inputs, creates a Link object, appends it, and persists.
   *
   * @param {string} label - The display label.
   * @param {string} url   - The URL.
   * @returns {{ ok: boolean, error?: string }}
   */
  addLink(label, url) {
    // Placeholder — implemented in Task 9
    return { ok: false };
  },

  /**
   * Remove a link from the panel and persist.
   *
   * @param {string} id - The id of the link to delete.
   */
  deleteLink(id) {
    // Placeholder — implemented in Task 10
  },

  /**
   * Re-render the full links panel DOM.
   * Shows the empty-state message when the panel is empty.
   */
  renderPanel() {
    // Placeholder — implemented in Task 9
  },

  /**
   * Build and return a DOM element representing a single link.
   * The link button opens the URL in a new tab.
   *
   * @param {{ id: string, label: string, url: string }} link
   * @returns {HTMLElement}
   */
  renderLink(link) {
    // Placeholder — implemented in Task 9
    return document.createElement('li');
  },

  /**
   * Serialise the links array as JSON and write it to localStorage.
   */
  persist() {
    // Placeholder — implemented in Task 10
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
}

document.addEventListener('DOMContentLoaded', init);
