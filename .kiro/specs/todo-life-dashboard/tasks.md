# Implementation Plan

## Task List

- [x] 1. Project scaffold and shared infrastructure
  - [x] 1.1 Create `index.html` with semantic widget sections and inline comments
  - [x] 1.2 Create `css/style.css` with CSS custom properties for light/dark themes and section comments
  - [x] 1.3 Create `js/app.js` with storage helpers (`get`, `set`, `remove`) and the `init()` entry point

- [x] 2. Theme Manager
  - [x] 2.1 Add inline `<script>` in `<head>` that reads `tdl_theme` from localStorage and sets `data-theme` on `<html>` before first paint
  - [x] 2.2 Implement `themeManager.init()`, `themeManager.toggle()`, and `themeManager.apply(theme)` in `app.js`
  - [x] 2.3 Wire the theme toggle button to `themeManager.toggle()`

- [x] 3. Greeting Widget
  - [x] 3.1 Implement `getGreeting(hour)` pure function mapping hour ranges to greeting strings
  - [x] 3.2 Implement `formatDate(date)` pure function returning day-of-week, month, day number, and year
  - [x] 3.3 Implement `greetingWidget.init()` that starts the 1-second clock interval and reads stored name
  - [x] 3.4 Implement `greetingWidget.tick()` that updates time, date, and greeting DOM elements

- [x] 4. Custom User Name
  - [x] 4.1 Add name input field and save button to `index.html` within the greeting section
  - [x] 4.2 Implement save handler: trim input, persist non-empty value to `tdl_user_name`, clear storage on whitespace-only input
  - [x] 4.3 On page load, pre-populate the name input from `tdl_user_name` in storage

- [x] 5. Timer Widget
  - [x] 5.1 Implement `formatTime(seconds)` pure function returning MM:SS string
  - [x] 5.2 Implement `timerWidget.init()` setting remaining to 1500 and rendering the display
  - [x] 5.3 Implement `timerWidget.start()`, `timerWidget.stop()`, and `timerWidget.tick()`
  - [x] 5.4 Implement `timerWidget.reset()` that stops any active interval and restores remaining to 1500
  - [x] 5.5 Implement `timerWidget.onComplete()` that stops the timer and shows a visual completion indicator
  - [x] 5.6 Implement `timerWidget.setButtonStates(running)` to enable/disable Start, Stop, Reset controls

- [x] 6. Todo Widget — Add Tasks
  - [x] 6.1 Add task input field and Add button to `index.html` within the todo section
  - [x] 6.2 Implement `todoWidget.validateLabel(label, excludeId)` returning a `ValidationResult`
  - [x] 6.3 Implement `todoWidget.addTask(label)` that validates, creates a `Task` object, appends to list, persists, and clears input
  - [x] 6.4 Display inline validation message on empty or duplicate submission

- [x] 7. Todo Widget — Render, Edit, Complete, Delete
  - [x] 7.1 Implement `todoWidget.renderTask(task)` returning a DOM element with label, edit button, completion toggle, and delete button
  - [x] 7.2 Implement `todoWidget.renderList()` that re-renders the full task list and shows empty-state message when list is empty
  - [x] 7.3 Implement edit mode: replace label with pre-populated input, confirm/cancel controls
  - [x] 7.4 Implement `todoWidget.editTask(id, newLabel)` with validation, label update, and persist
  - [x] 7.5 Implement `todoWidget.toggleTask(id)` that flips `completed` and persists
  - [x] 7.6 Implement `todoWidget.deleteTask(id)` that removes the task and persists
  - [x] 7.7 Apply completed-task CSS class (e.g., strikethrough) to visually distinguish completed tasks

- [x] 8. Todo Widget — Persistence
  - [x] 8.1 Implement `todoWidget.persist()` serialising the tasks array as JSON to `tdl_tasks`
  - [x] 8.2 Implement `todoWidget.init()` that reads `tdl_tasks` from storage and calls `renderList()`

- [x] 9. Links Widget — Add and Display
  - [x] 9.1 Add label input, URL input, and Add button to `index.html` within the links section
  - [x] 9.2 Implement `linksWidget.validateLink(label, url)` returning a `ValidationResult`
  - [x] 9.3 Implement `linksWidget.addLink(label, url)` that validates, creates a `Link` object, appends to list, and persists
  - [x] 9.4 Display inline validation messages for empty fields and invalid URL scheme
  - [x] 9.5 Implement `linksWidget.renderLink(link)` returning a DOM element with a button (opens URL in new tab) and delete control
  - [x] 9.6 Implement `linksWidget.renderPanel()` that re-renders the full links panel
  - [x] 9.7 Implement `linksWidget.init()` that reads `tdl_links` from storage and calls `renderPanel()`

- [x] 10. Links Widget — Delete
  - [x] 10.1 Implement `linksWidget.deleteLink(id)` that removes the link and persists
  - [x] 10.2 Implement `linksWidget.persist()` serialising the links array as JSON to `tdl_links`

- [x] 11. Styling
  - [x] 11.1 Implement CSS custom properties for light and dark themes (`[data-theme="dark"]` selector)
  - [x] 11.2 Style all four widget cards with consistent layout (grid or flexbox)
  - [x] 11.3 Style completed task items with strikethrough and reduced opacity
  - [x] 11.4 Style inline validation messages (error colour, small text)
  - [x] 11.5 Ensure the theme toggle button and name save control are always visible

- [ ] 12. Code quality
  - [ ] 12.1 Add inline JSDoc comments to every function in `app.js` explaining purpose and non-obvious logic
  - [ ] 12.2 Add section comments to `style.css` identifying each widget's styles and key decisions
  - [ ] 12.3 Add widget-section comments to `index.html`

- [ ] 13. Property-based and unit tests
  - [ ] 13.1 Set up fast-check (or equivalent) test runner for the project
  - [ ] 13.2 Write property tests for Properties 1–3 (greeting and date formatting)
  - [ ] 13.3 Write property tests for Properties 4–5 (user name persistence)
  - [ ] 13.4 Write property tests for Properties 6–7 (timer format and reset)
  - [ ] 13.5 Write property tests for Properties 8–10 (task add validation)
  - [ ] 13.6 Write property tests for Properties 11–13 (task edit validation)
  - [ ] 13.7 Write property tests for Properties 14–16 (toggle, delete, persistence round-trip)
  - [ ] 13.8 Write property tests for Properties 17–22 (links add, validate, delete, persistence, theme toggle)
  - [ ] 13.9 Write unit tests for timer state transitions, button states, and completion indicator
  - [ ] 13.10 Write unit tests for UI behaviors (input cleared after add, edit mode pre-population, empty-state messages, completed CSS class, link opens in new tab)
