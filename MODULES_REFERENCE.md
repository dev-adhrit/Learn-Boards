# Learn Boards - Module Reference Guide

## Overview
This document provides detailed API documentation for each JavaScript module in the restructured Learn Boards application.

---

## Module: i18n.js

**Purpose**: Internationalization and localization system  
**Size**: ~45 lines  
**Dependencies**: None  
**External Files Used**: `locales/[lang]/translations.json`

### Key Functions

#### `loadLanguage(lang)`
Asynchronously loads translation file for specified language.

```javascript
loadLanguage('en'); // Loads English translations
```

**Parameters**:
- `lang` (string): Language code ('en', 'es', 'fr', 'de')

**Behavior**:
- Fetches JSON from `locales/lang/translations.json`
- Updates global `translations` object
- Calls `applyTranslations()` to re-render
- Updates `state.language` and saves

#### `applyTranslations()`
Applies loaded translations to DOM elements.

**Behavior**:
- Finds all elements with `data-i18n` attribute
- Replaces text content with translated strings
- Handles input placeholders
- Handles title and meta tags

#### `getTranslation(key)`
Retrieves translation string using dot notation.

```javascript
getTranslation('app.title')        // Returns app title
getTranslation('buttons.save')     // Returns "Save" text
```

**Returns**: Translated string or key as fallback

#### `t(key)`
Shorthand helper for getting translations.

```javascript
showToast(t('messages.settingsSaved'));
```

---

## Module: app.js

**Purpose**: Core application logic and data management  
**Size**: ~350 lines  
**Dependencies**: i18n.js  
**External Data**: CHAPTERS constant, BOARD_PAPERS constant

### Data Structures

#### `CHAPTERS` Object
Hierarchical chapter data organized by subject.

```javascript
CHAPTERS = {
  physics: [
    { 
      id: 'electricity', 
      name: 'Electricity',
      weight: 8,
      topics: ['Ohm\'s Law', 'Resistance', ...] 
    },
    // ... more chapters
  ],
  chemistry: [...],
  biology: [...]
}
```

**Structure**:
- 3 subjects (physics, chemistry, biology)
- 4-5 chapters per subject
- 3-5 topics per chapter
- Weight indicates importance/marks

#### `state` Object
Global application state.

```javascript
state = {
  examDate: null,           // ISO date string
  maxHours: 1.5,            // Daily limit
  mathsLoad: 'medium',      // 'light', 'medium', 'heavy'
  syllabusComplete: false,  // Boolean
  chapters: {},             // Chapter progress objects
  sessions: [],             // Array of session logs
  streak: 0,                // Consecutive study days
  lastStudyDate: null,      // ISO date string
  todayStats: {             // Today's metrics
    time: 0,                // minutes
    questions: 0,           // count
    correct: 0              // count
  },
  boardPapers: {},          // Paper completion status
  theme: 'default',         // Theme name
  language: 'en'            // Language code
}
```

#### `timerState` Object
Study timer state.

```javascript
timerState = {
  duration: 1500,           // Total seconds
  remaining: 1500,          // Countdown
  running: false,           // Active timer
  interval: null            // Interval ID
}
```

#### `authState` Object
User authentication state.

```javascript
authState = {
  isSignedIn: false,        // Boolean
  user: null,               // { email, name }
  isSignUpMode: false       // Sign-up vs sign-in
}
```

### Initialization Functions

#### `init()`
Master initialization function called on page load.

**Sequence**:
1. Load auth state from localStorage
2. Check for saved subject selection
3. Load app state from localStorage
4. Initialize chapter progress objects
5. Initialize board paper objects
6. Render all UI components
7. Load default language

#### `initChapters()`
Creates initial chapter progress tracking objects.

**Creates**:
- `state.chapters[chapterId]` for each chapter
- Status: 'not-started', 'learning', 'practicing', 'mastered'
- Topic progress trackers
- Saves to localStorage

#### `initBoardPapers()`
Initializes board paper tracking (2016-2025).

**Creates**:
- `state.boardPapers[year]` objects
- Completion status and date tracking
- Saves to localStorage

### State Management

#### `saveState()`
Persists entire application state to localStorage.

```javascript
saveState(); // Saves to 'sciencePrepState' key
```

**Also**:
- Syncs to user account if signed in
- Called after every state change

#### `loadState()`
Loads saved state from localStorage.

**Restores**:
- All chapter progress
- Session history
- User settings
- Theme preference

### Subject Selection

#### `enterSubject(subject)`
Switches to subject view.

```javascript
enterSubject('science');
// Hides selection page, shows science app
```

#### `goToSubjectSelection()`
Returns to subject selection page.

#### `checkSavedSubject()`
Auto-enters subject if previously selected.

### Navigation

#### `showTab(tabName)`
Switches active navigation tab.

```javascript
showTab('dashboard');
showTab('chapters');
showTab('papers');
```

**Parameters**:
- `tabName`: 'dashboard', 'chapters', 'session', 'papers', 'performance', 'rules'

**Behavior**:
- Hides all tabs
- Shows specified tab
- Updates tab button styling

### Board Papers Management

#### `renderBoardPapers()`
Renders checkboxes for all 10 board papers.

**Shows**:
- Paper year
- Completion checkbox
- Completion date

**Updates**:
- Progress bar
- Paper count
- Empty state

#### `toggleBoardPaper(year)`
Toggles completion status for a paper.

```javascript
toggleBoardPaper(2023);
```

**Updates**:
- Completion status
- Timestamp
- Re-renders UI

### Chapter Management

#### `renderChapters()`
Renders chapter cards for all subjects.

**Shows**:
- Chapter name
- Status badge
- Accuracy percentage
- Clickable for details

#### `openChapterModal(subject, chapterId)`
Opens detailed chapter editor modal.

**Provides**:
- Status dropdown
- Individual section checkboxes (NCERT/Oswal/PYQs)
- Topic progress buttons
- Accuracy display

#### `closeChapterModal()`
Closes chapter detail modal.

#### `updateChapterStatus(chapterId, status)`
Updates chapter status.

```javascript
updateChapterStatus('electricity', 'practicing');
```

**Valid values**:
- 'not-started'
- 'learning'
- 'practicing'
- 'mastered'

#### `toggleChapterFlag(chapterId, flag)`
Toggles NCERT/Oswal/PYQ completion flags.

```javascript
toggleChapterFlag('electricity', 'ncertDone');
```

#### `cycleTopicStatus(chapterId, topic)`
Cycles topic through: pending → done → weak → pending

```javascript
cycleTopicStatus('electricity', 'Ohm\'s Law');
```

---

## Module: ui.js

**Purpose**: User interface interactions and visual updates  
**Size**: ~400 lines  
**Dependencies**: app.js  
**Uses**: DOM manipulation, setTimeout, event listeners

### Settings Management

#### `openSettings()`
Shows settings modal.

#### `closeSettings()`
Closes settings modal and resets form.

#### `setTheme(themeName)`
Applies color theme to entire application.

```javascript
setTheme('green');    // Nature Green
setTheme('purple');   // Royal Purple
setTheme('orange');   // Sunset Orange
setTheme('default');  // Indigo/Purple
```

**Behavior**:
- Updates DOM classes
- Saves to state
- Persists to localStorage

#### `applyTheme(themeName)`
Internal function that applies theme CSS classes.

**CSS Classes Applied**:
- `theme-green`
- `theme-purple`
- `theme-orange`

#### `switchSubject(subject)`
Handles subject switching (shows error for unavailable).

#### `saveSettings()`
Persists user settings.

**Saves**:
- examDate
- maxHours
- syllabusComplete
- Regenerates daily plan
- Shows success toast

#### `resetAllData()`
Clears all data with confirmation.

### Maths Load System

#### `setMathsLoad(load)`
Adjusts daily workload intensity.

```javascript
setMathsLoad('light');   // 2 hours
setMathsLoad('medium');  // 1.5 hours (default)
setMathsLoad('heavy');   // 45 minutes
```

**Behavior**:
- Updates button styling
- Shows allocation in header
- Triggers daily plan regeneration

### Daily Planning

#### `generateDailyPlan()`
Creates optimized task list for today.

**Generates**:
- Priority chapter selection
- Task sequence based on load
- Time allocations
- Resource recommendations

#### `findPriorityChapter()`
Selects next chapter to study.

**Priority Order**:
1. Not-started chapters
2. Chapters with lowest accuracy
3. Least recently practiced

#### `renderTasks(tasks)`
Displays daily task list.

**Each Task Shows**:
- Type icon (📖📝🔄📜📋)
- Description
- Time allocation
- Resource type
- Checkbox for completion

#### `toggleTask(idx)`
Marks task as complete/incomplete.

```javascript
toggleTask(0); // Toggle first task
```

#### `updateCurrentFocus(chapter)`
Displays current priority chapter details.

### Timer Functionality

#### `setTimer(minutes)`
Sets timer duration.

```javascript
setTimer(25);  // 25 minute Pomodoro
setTimer(45);  // 45 minute session
setTimer(60);  // 60 minute deep work
```

#### `startTimer()`
Begins countdown.

**Behavior**:
- Decrements every second
- Shows pause button
- Plays notification at 0
- Shows completion toast

#### `pauseTimer()`
Pauses active timer.

#### `resetTimer()`
Resets to original duration.

#### `updateTimerDisplay()`
Updates timer display text.

```
Format: MM:SS
```

#### `playNotification()`
Plays alert sound when timer ends (if supported).

### Session Logging

#### `populateChapterSelect()`
Fills chapter dropdown in timer section.

**Organizes by**:
- Physics
- Chemistry
- Biology

#### `logSession()`
Records practice session with all metrics.

**Validates**:
- Chapter selected
- Questions attempted ≥ 0
- Correct answers ≤ attempted

**Calculates**:
- Accuracy percentage
- Time spent
- Chapter status updates

**Updates**:
- Chapter progress
- Today's stats
- Weak topics
- Streak counter

**Shows**: Success toast

---

## Module: utils.js

**Purpose**: Data processing, analytics, and authentication  
**Size**: ~350 lines  
**Dependencies**: app.js, ui.js  
**Uses**: localStorage, Date objects, Array methods

### Progress Tracking

#### `updateProgress()`
Calculates and displays overall progress.

**Calculates**:
- Overall completion percentage
- Subject-wise percentages
- Updates progress ring animation

#### `updateDaysLeft()`
Shows days remaining until exam.

```javascript
// If no exam date set: "--"
// If date past: "0"
// Otherwise: day count
```

#### `updateTodayStats()`
Displays today's study metrics.

**Shows**:
- Study time (minutes)
- Questions practiced
- Accuracy percentage

#### `updateWeeklyChart()`
Renders 7-day study time chart.

**Shows**:
- Bar height represents study time
- Labels for each day
- Total minutes per day

#### `updateRecentSessions()`
Lists last 10 practice sessions.

**Shows**:
- Chapter name
- Activity type
- Completion date
- Accuracy percentage
- Session metrics

#### `updateWeakTopics()`
Identifies and lists weak areas.

**Criteria**:
- Topics marked as 'weak'
- Chapters with <60% accuracy

#### `checkStreak()`
Calculates study streak days.

**Logic**:
- Counts consecutive study days
- Resets if gap found
- Updates streak display

### Authentication System

#### `loadAuthState()`
Loads saved user from localStorage.

**Behavior**:
- Checks 'learnBoardsAuth' key
- Auto-logs in if found
- Updates auth UI

#### `updateAuthUI()`
Renders correct auth UI based on state.

**Shows**:
- Sign-in button (logged out)
- User profile button (logged in)

#### `openAccountModal()`
Shows account/sign-in modal.

#### `closeAccountModal()`
Closes modal and resets form.

#### `toggleAuthMode()`
Switches between sign-in and sign-up.

#### `updateAuthFormUI()`
Updates form based on mode.

**Toggles**:
- Name field visibility
- Button text
- Instructions

#### `handleAuth()`
Processes sign-in or sign-up.

**Validates**:
- Email format
- Password length (6+ chars)
- Name for sign-up
- Email uniqueness for sign-up

**On Success**:
- Creates account (sign-up)
- Logs in user
- Shows success toast
- Updates UI

**On Error**:
- Shows error message in modal
- Allows retry

#### `saveUserData(email)`
Saves user's state to localStorage.

```javascript
// Key: 'learnBoardsData_' + email
```

#### `loadUserData(email)`
Loads and restores user's saved state.

**Restores**:
- All chapters
- Sessions
- Settings
- Theme preference

**Re-renders**:
- All UI components
- Progress displays
- Chapter list

#### `syncData()`
Manually syncs data to account.

```javascript
syncData();
// Shows: "Progress synced! ☁️"
```

#### `signOut()`
Logs out current user.

**Behavior**:
- Saves final state
- Clears auth
- Updates UI
- Shows goodbye toast

### Utility Functions

#### `showToast(message)`
Shows temporary notification.

```javascript
showToast('Settings saved!');
showToast('⏰ Time\'s up!');
```

**Duration**: 3 seconds

---

## Data Flow Example: Session Logging

```
User clicks "Log Session"
    ↓
logSession() [ui.js]
    ↓
Validate inputs
    ↓
Create session object { date, chapter, activity, accuracy, ... }
    ↓
Update state.sessions array
Update state.chapters[chapterId] flags
Update state.todayStats
Update chapter status
    ↓
saveState() [app.js]
    ↓
localStorage.setItem('sciencePrepState', ...)
    ↓
if (authState.isSignedIn) saveUserData() [utils.js]
    ↓
updateProgress() [utils.js]
updateRecentSessions() [utils.js]
updateWeakTopics() [utils.js]
checkStreak() [utils.js]
    ↓
UI updates rendered
    ↓
showToast('Session logged successfully! 🎉')
```

---

## Best Practices

### Adding New Functions
1. Place in appropriate module (app/ui/utils)
2. Add JSDoc comments
3. Call `saveState()` if modifying `state`
4. Update UI immediately for feedback

### Modifying State
```javascript
// Always follow this pattern:
state.propertyName = newValue;
saveState();
updateRelevantUI();
```

### Error Handling
```javascript
try {
  // operation
  saveState();
} catch (error) {
  console.error('Operation failed:', error);
  showToast('An error occurred');
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026
