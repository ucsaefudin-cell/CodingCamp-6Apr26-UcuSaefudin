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
  /** Cached user name read from storage on init. */
  _name: '',

  /**
   * Initialise the greeting widget.
   * Reads the stored user name, starts the 1-second clock interval,
   * and performs an immediate tick so the UI is populated at once.
   * (Req 1.1, 1.7, 1.8)
   */
  init() {
    // Read stored name so tick() can append it to the greeting
    const stored = storage.get(KEYS.USER_NAME);
    this._name = (typeof stored === 'string') ? stored : '';

    // Populate the name input field with the stored value (Req 2.3)
    const nameInput = document.getElementById('name-input');
    if (nameInput) nameInput.value = this._name;

    // Immediate tick so the clock shows the correct time right away
    this.tick();

    // Start the 1-second interval — lives for the page lifetime (Req 1.1)
    setInterval(() => this.tick(), 1000);

    // Wire the Save button for the user name (Req 2.1, 2.2, 2.4)
    const saveBtn = document.getElementById('name-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        const trimmed = input ? input.value.trim() : '';
        if (trimmed) {
          // Non-empty: persist and update cached name
          storage.set(KEYS.USER_NAME, trimmed);
          this._name = trimmed;
        } else {
          // Whitespace-only or empty: clear stored name
          storage.remove(KEYS.USER_NAME);
          this._name = '';
        }
        // Re-render greeting immediately with updated name
        this.tick();
      });
    }
  },

  /**
   * Called every second by the clock interval.
   * Updates the time, date, and greeting DOM elements.
   * (Req 1.1, 1.2, 1.3–1.8)
   */
  tick() {
    const now = new Date();

    // --- Time display (Req 1.1) ---
    // Format as HH:MM:SS using locale-independent zero-padding
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeEl = document.getElementById('greeting-time');
    if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

    // --- Date display (Req 1.2) ---
    const dateEl = document.getElementById('greeting-date');
    if (dateEl) dateEl.textContent = this.formatDate(now);

    // --- Greeting message (Req 1.3–1.8) ---
    const base = this.getGreeting(now.getHours());
    const message = this._name ? `${base}, ${this._name}` : base;
    const msgEl = document.getElementById('greeting-message');
    if (msgEl) msgEl.textContent = message;
  },

  /**
   * Map an hour (0–23) to the appropriate greeting string.
   * 05–11 → "Good morning"  (Req 1.3)
   * 12–17 → "Good afternoon" (Req 1.4)
   * 18–21 → "Good evening"  (Req 1.5)
   * 22–23, 0–4 → "Good night" (Req 1.6)
   *
   * @param {number} hour - Integer hour in [0, 23].
   * @returns {string} One of "Good morning", "Good afternoon",
   *                   "Good evening", or "Good night".
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good morning';
    if (hour >= 12 && hour <= 17) return 'Good afternoon';
    if (hour >= 18 && hour <= 21) return 'Good evening';
    return 'Good night'; // covers 22–23 and 0–4
  },

  /**
   * Format a Date object into a human-readable date string containing
   * the day of the week, month name, day number, and four-digit year.
   * E.g. "Monday, January 1, 2025" (Req 1.2)
   *
   * @param {Date} date - The date to format.
   * @returns {string} E.g. "Monday, January 1, 2025".
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
   TIMER WIDGET
   25-minute (1500-second) Pomodoro countdown.
   State is kept in memory only — not persisted to localStorage.
   ============================================================ */

/**
 * @namespace timerWidget
 */
const timerWidget = {
  /** Seconds remaining in the current session. */
  remaining: 1500,

  /** The id returned by setInterval, or null when not running. */
  intervalId: null,

  /**
   * Initialise the timer widget.
   * Sets remaining to 1500, renders the display, and binds buttons.
   * (Req 3.1, 3.7)
   */
  init() {
    this.remaining = 1500;
    this.intervalId = null;
    this.render();
    this.setButtonStates(false);

    // Hide the completion indicator on init
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = true;

    // Bind Start button (Req 3.2, 3.4)
    const startBtn = document.getElementById('timer-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    // Bind Stop button (Req 3.3)
    const stopBtn = document.getElementById('timer-stop');
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());

    // Bind Reset button (Req 3.5)
    const resetBtn = document.getElementById('timer-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  },

  /**
   * Start the countdown interval.
   * Guards against double-starting if already running.
   * Updates button states to reflect the running state. (Req 3.2, 3.8)
   */
  start() {
    if (this.intervalId !== null) return; // already running
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.setButtonStates(true);
  },

  /**
   * Stop (pause) the countdown interval.
   * Clears the interval and updates button states. (Req 3.3, 3.9)
   */
  stop() {
    if (this.intervalId === null) return; // already stopped
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.setButtonStates(false);
  },

  /**
   * Called every second by the countdown interval.
   * Decrements remaining and re-renders; calls onComplete() at 0. (Req 3.2, 3.6)
   */
  tick() {
    this.remaining -= 1;
    this.render();
    if (this.remaining <= 0) {
      this.onComplete();
    }
  },

  /**
   * Stop any active interval and restore remaining to 1500.
   * Re-renders the display and resets button states. (Req 3.5)
   */
  reset() {
    this.stop();
    this.remaining = 1500;
    this.render();
    this.setButtonStates(false);

    // Hide the completion indicator when resetting
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = true;
  },

  /**
   * Called when the countdown reaches 0.
   * Stops the timer and shows the visual completion indicator. (Req 3.6)
   */
  onComplete() {
    this.stop();
    const completeEl = document.getElementById('timer-complete');
    if (completeEl) completeEl.hidden = false;
  },

  /**
   * Enable or disable the Start, Stop, and Reset buttons based on
   * whether the timer is currently running. (Req 3.8, 3.9)
   *
   * @param {boolean} running - True if the timer is counting down.
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
   * Format a number of seconds as a zero-padded MM:SS string.
   * E.g. formatTime(1500) → "25:00", formatTime(299) → "04:59". (Req 3.7)
   *
   * @param {number} seconds - Integer in [0, 1500].
   * @returns {string} Zero-padded MM:SS string.
   */
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  /**
   * Write the current remaining time to the #timer-display element.
   * Called after every state change that affects the display. (Req 3.7)
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
   * Includes a button that opens the URL in a new tab (Req 8.5)
   * and a delete control.
   *
   * @param {{ id: string, label: string, url: string }} link
   * @returns {HTMLElement} An <li> element for the link.
   */
  renderLink(link) {
    const li = document.createElement('li');
    li.className = 'link-item';
    li.dataset.id = link.id;

    // --- Link button: opens URL in new tab (Req 8.5) ---
    const linkBtn = document.createElement('button');
    linkBtn.className = 'link-item__btn';
    linkBtn.textContent = link.label;
    linkBtn.setAttribute('aria-label', `Open ${link.label}`);
    linkBtn.addEventListener('click', () => {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    // --- Delete button ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--icon';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
    deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

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
