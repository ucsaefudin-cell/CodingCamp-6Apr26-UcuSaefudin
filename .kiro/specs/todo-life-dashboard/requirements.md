# Requirements Document

## Introduction

The To-Do List Life Dashboard is a single-page web application built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend, persisting all user data via the Local Storage API. The app helps users organize their day through four core widgets: a live greeting with time/date, a focus timer, a to-do list, and a quick-links panel. It also supports light/dark mode and a custom user name.

## Glossary

- **Dashboard**: The single HTML page that hosts all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a dynamic greeting message.
- **Timer_Widget**: The UI component that implements a 25-minute countdown (Pomodoro-style) focus timer.
- **Todo_Widget**: The UI component that manages the user's task list.
- **Links_Widget**: The UI component that manages and displays quick-access website links.
- **Task**: A single to-do item with a text label and a completion state.
- **Link**: A user-defined entry containing a display label and a URL.
- **Storage**: The browser's Local Storage API used to persist all user data.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.
- **User_Name**: A custom name entered by the user, used in the greeting message.

---

## Requirements

### Requirement 1: Live Greeting and Date/Time Display

**User Story:** As a user, I want to see the current time, date, and a personalized greeting, so that I have an at-a-glance overview of when I am in my day.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time updated every second.
2. THE Greeting_Widget SHALL display the current date including the day of the week, month, day number, and year.
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good afternoon".
5. WHEN the local time is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good evening".
6. WHEN the local time is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good night".
7. WHEN a User_Name has been saved, THE Greeting_Widget SHALL append the User_Name to the greeting message (e.g., "Good morning, Alex").
8. WHEN no User_Name has been saved, THE Greeting_Widget SHALL display the greeting without a name suffix.

---

### Requirement 2: Custom User Name

**User Story:** As a user, I want to set my own name, so that the greeting feels personal.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field and a save control for the User_Name.
2. WHEN the user submits a non-empty User_Name, THE Storage SHALL persist the User_Name under a defined key.
3. WHEN the page loads, THE Dashboard SHALL read the User_Name from Storage and pre-populate the name input field with the stored value.
4. IF the user submits an empty or whitespace-only User_Name, THEN THE Dashboard SHALL clear the stored User_Name and display the greeting without a name suffix.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can work in focused intervals.

#### Acceptance Criteria

1. THE Timer_Widget SHALL initialise the countdown to 25 minutes (1500 seconds) on page load.
2. WHEN the user activates the Start control, THE Timer_Widget SHALL begin counting down one second per real-world second.
3. WHEN the user activates the Stop control while the timer is running, THE Timer_Widget SHALL pause the countdown at the current remaining time.
4. WHEN the user activates the Start control after a pause, THE Timer_Widget SHALL resume the countdown from the paused time.
5. WHEN the user activates the Reset control, THE Timer_Widget SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the countdown reaches 00:00, THE Timer_Widget SHALL stop automatically and display a visual indication that the session has ended.
7. THE Timer_Widget SHALL display the remaining time in MM:SS format at all times.
8. WHILE the timer is running, THE Timer_Widget SHALL disable the Start control and enable the Stop and Reset controls.
9. WHILE the timer is stopped or paused, THE Timer_Widget SHALL enable the Start control.

---

### Requirement 4: To-Do List — Add Tasks

**User Story:** As a user, I want to add tasks to my list, so that I can track what I need to do today.

#### Acceptance Criteria

1. THE Todo_Widget SHALL provide a text input field and an Add control for creating new Tasks.
2. WHEN the user submits a non-empty task label, THE Todo_Widget SHALL append the new Task to the list and persist the updated list to Storage.
3. IF the user submits an empty or whitespace-only task label, THEN THE Todo_Widget SHALL reject the submission and display an inline validation message.
4. IF the submitted task label (case-insensitive, trimmed) matches an existing Task label in the list, THEN THE Todo_Widget SHALL reject the submission and display a duplicate-warning message.
5. WHEN a Task is successfully added, THE Todo_Widget SHALL clear the text input field.

---

### Requirement 5: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit existing tasks, so that I can correct or update task descriptions.

#### Acceptance Criteria

1. THE Todo_Widget SHALL provide an Edit control for each Task in the list.
2. WHEN the user activates the Edit control for a Task, THE Todo_Widget SHALL replace the task label with an editable input field pre-populated with the current label.
3. WHEN the user confirms the edit with a non-empty label, THE Todo_Widget SHALL update the Task label, persist the updated list to Storage, and return the Task to its read-only display.
4. IF the user confirms the edit with an empty or whitespace-only label, THEN THE Todo_Widget SHALL reject the update and display an inline validation message.
5. IF the confirmed edited label (case-insensitive, trimmed) matches a different existing Task label, THEN THE Todo_Widget SHALL reject the update and display a duplicate-warning message.
6. WHEN the user cancels the edit, THE Todo_Widget SHALL discard changes and return the Task to its read-only display.

---

### Requirement 6: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can maintain an accurate list.

#### Acceptance Criteria

1. THE Todo_Widget SHALL provide a completion toggle (e.g., checkbox) for each Task.
2. WHEN the user toggles the completion control, THE Todo_Widget SHALL update the Task's completion state and persist the updated list to Storage.
3. THE Todo_Widget SHALL visually distinguish completed Tasks from incomplete Tasks (e.g., strikethrough text).
4. THE Todo_Widget SHALL provide a Delete control for each Task.
5. WHEN the user activates the Delete control for a Task, THE Todo_Widget SHALL remove the Task from the list and persist the updated list to Storage.

---

### Requirement 7: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that they are still there when I reopen the app.

#### Acceptance Criteria

1. WHEN the page loads, THE Todo_Widget SHALL read the task list from Storage and render all persisted Tasks.
2. WHEN the task list is empty on page load, THE Todo_Widget SHALL display an empty-state message (e.g., "No tasks yet. Add one above.").
3. THE Storage SHALL serialise the task list as a JSON array and store it under a defined key.

---

### Requirement 8: Quick Links — Add and Display

**User Story:** As a user, I want to save links to my favourite websites, so that I can open them quickly from the dashboard.

#### Acceptance Criteria

1. THE Links_Widget SHALL provide input fields for a display label and a URL, plus an Add control.
2. WHEN the user submits a non-empty label and a valid URL, THE Links_Widget SHALL add the Link to the panel and persist the updated link list to Storage.
3. IF the user submits an empty label or an empty URL, THEN THE Links_Widget SHALL reject the submission and display an inline validation message.
4. IF the submitted URL does not begin with "http://" or "https://", THEN THE Links_Widget SHALL reject the submission and display a URL-format validation message.
5. WHEN the user activates a Link button, THE Links_Widget SHALL open the associated URL in a new browser tab.
6. WHEN the page loads, THE Links_Widget SHALL read the link list from Storage and render all persisted Links.

---

### Requirement 9: Quick Links — Delete

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays relevant.

#### Acceptance Criteria

1. THE Links_Widget SHALL provide a Delete control for each Link.
2. WHEN the user activates the Delete control for a Link, THE Links_Widget SHALL remove the Link from the panel and persist the updated link list to Storage.

---

### Requirement 10: Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark themes, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Theme toggle control visible at all times.
2. WHEN the user activates the Theme toggle, THE Dashboard SHALL switch the active Theme between light and dark.
3. WHEN the Theme changes, THE Dashboard SHALL persist the selected Theme to Storage.
4. WHEN the page loads, THE Dashboard SHALL read the stored Theme from Storage and apply it before rendering content, preventing a flash of the wrong theme.
5. WHEN no Theme has been stored, THE Dashboard SHALL apply the light Theme as the default.

---

### Requirement 11: Code Quality and Maintainability

**User Story:** As a developer learning from this project, I want the code to be clearly commented and structured, so that I can understand the logic and extend it confidently.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file, one CSS file inside a `css/` folder, and one JavaScript file inside a `js/` folder.
2. THE Dashboard SHALL use only HTML, CSS, and Vanilla JavaScript with no external libraries or frameworks.
3. THE JavaScript file SHALL include inline comments explaining the purpose of each function and the logic behind non-obvious operations.
4. THE CSS file SHALL include inline comments identifying each section and describing key style decisions.
5. THE HTML file SHALL include inline comments identifying each widget section.

---

### Requirement 12: Performance and Browser Compatibility

**User Story:** As a user, I want the dashboard to load quickly and work reliably across modern browsers, so that I can use it anywhere without issues.

#### Acceptance Criteria

1. THE Dashboard SHALL load and become interactive within 3 seconds on a standard broadband connection.
2. THE Dashboard SHALL render and function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL use only Web APIs available natively in the browsers listed in criterion 2, with no polyfills required.
4. WHEN the user interacts with any control (add, delete, toggle, timer buttons), THE Dashboard SHALL reflect the updated state within 100 milliseconds.
