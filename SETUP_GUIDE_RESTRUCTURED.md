# Learn Boards - Restructured Setup Guide

## Overview
Learn Boards has been restructured into a modular, multi-language architecture for better maintainability and scalability. The embedded CSS and JavaScript have been separated into individual files organized by functionality.

## Project Structure

```
Learn Boards/
├── assets/
│   ├── css/
│   │   ├── main.css          # Base styles, typography, layout
│   │   └── animations.css    # Keyframes and transitions
│   └── js/
│       ├── app.js            # Core app logic, data structures, initialization
│       ├── ui.js             # UI interactions, timers, session logging
│       ├── utils.js          # Progress tracking, authentication
│       └── i18n.js           # Internationalization system
├── locales/
│   ├── en/
│   │   └── translations.json # English translations
│   ├── es/
│   │   └── translations.json # Spanish translations
│   ├── fr/
│   │   └── translations.json # French translations
│   └── de/
│       └── translations.json # German translations
├── structure/
│   ├── index-new.html        # New modular HTML file
│   └── index.html            # Original monolithic file (backup)
└── README.md                 # Project documentation
```

## File Organization

### CSS Files

**main.css** (1,200+ lines)
- Base styles and resets
- Theme variables and theming system
- Component styles (cards, buttons, forms, modals)
- Typography and spacing utilities
- Responsive design rules

**animations.css** (80+ lines)
- CSS keyframe animations
- Transition utilities
- Transform effects for cards and UI elements

### JavaScript Files

**i18n.js** (45 lines)
- Language loading system
- Translation string retrieval
- Multi-language support infrastructure
- Uses locale JSON files

**app.js** (350+ lines)
- Data structures (CHAPTERS, BOARD_PAPERS)
- State management system
- Initialization logic
- Chapter management functions
- Subject selection and navigation

**ui.js** (400+ lines)
- Settings and theme management
- Maths load allocation
- Daily planning system
- Study timer implementation
- Session logging functionality
- Task management
- Toast notifications

**utils.js** (350+ lines)
- Progress tracking calculations
- Weekly chart generation
- Session analytics
- Weak topic identification
- Streak calculation
- Complete authentication system (sign-up, sign-in, sync)
- User data persistence

### Locale Files

**translations.json** (200+ keys each language)
- Navigation labels
- Subject names
- Button text
- Settings labels
- Timer and session labels
- Form placeholders
- Message strings
- Supports: English, Spanish, French, German

### HTML Structure

**index-new.html**
- Responsive, semantic HTML5
- Uses data-i18n attributes for translations
- Modular sections for each feature
- External CSS and JS references
- Modal systems for account and settings
- Tab-based navigation

## Key Features Maintained

✓ Complete dashboard with daily task planning
✓ Chapter tracking across Physics, Chemistry, Biology
✓ Study timer with preset durations (25/45/60 min)
✓ Session logging with accuracy tracking
✓ Board paper progress tracker (2016-2025)
✓ Performance analytics and weekly charts
✓ Weak topic identification system
✓ Study streak counter
✓ Theme customization (4 color schemes)
✓ Authentication with sign-up/sign-in
✓ Cross-device progress syncing
✓ Maths load allocation system
✓ Multi-language support

## Module Communication

### State Management Flow
```
app.js (state object)
    ↓
ui.js (user interactions)
    ↓
utils.js (data processing)
    ↓
localStorage (persistence)
    ↓
i18n.js (language rendering)
```

### Authentication Flow
```
handleAuth() → validateInput() → createAccount() 
    ↓
localStorage.setItem('learnBoardsAuth')
    ↓
loadUserData() → renderUI()
    ↓
saveUserData() (on every change)
```

## Multi-Language Implementation

### Adding a New Language

1. Create locale file: `locales/xx/translations.json`
2. Copy structure from existing language file
3. Translate all keys
4. Add language option to UI

```javascript
// In translations.json structure:
{
  "app": { "title": "..." },
  "navigation": { "today": "..." },
  "subjects": { "science": "..." },
  // ... more sections
}
```

### Translation Rendering

- Elements with `data-i18n="key"` attributes auto-translate
- JS can use `t('key')` function for dynamic strings
- `loadLanguage(lang)` switches language at runtime

## Deployment Instructions

### 1. Backup Original
```bash
cp index.html index-old.html
```

### 2. Use New Structure
```bash
cp structure/index-new.html index.html
# Update relative paths if deploying to subdirectory
```

### 3. Set Default Language
```javascript
// In app.js, modify:
state.language = 'en'; // Change to your default
```

### 4. Optional: Minify for Production
```bash
# CSS and JS files can be minified for deployment
# Update file references in index.html accordingly
```

## Performance Considerations

### Current Setup
- Modular files enable better caching
- Animations CSS is separate (~2 KB)
- Main CSS is ~8 KB
- Total JS across 4 files: ~22 KB
- No build step required (pure vanilla JS)

### Optimization Tips
1. Gzip compression reduces file sizes 60-70%
2. Consider lazy-loading language packs
3. CSS and JS can be concatenated for HTTP/1.1
4. Use service workers for offline support

## Maintenance Notes

### Adding New Features

1. **UI Component**: Add HTML in index.html, CSS in main.css
2. **Logic**: Implement in appropriate JS file (app/ui/utils)
3. **Translations**: Add keys to all locale JSON files
4. **Authentication**: Update utils.js auth functions

### Debugging
- Open DevTools Console for error messages
- Check localStorage for saved state
- Verify locale file format (valid JSON)
- Ensure file paths are correct (relative to index.html)

### Testing Checklist
- [ ] All tabs function correctly
- [ ] Settings save and persist
- [ ] Authentication works (sign-up, sign-in, sign-out)
- [ ] Timer functionality works
- [ ] Session logging calculates accuracy
- [ ] Progress tracking shows correct percentages
- [ ] All languages render properly
- [ ] Responsive design works on mobile
- [ ] Streak calculation is accurate
- [ ] Board paper tracking works

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires ES6+ support
- LocalStorage must be enabled

## Future Enhancements

Possible improvements with this modular structure:
- Real backend API integration
- Advanced analytics dashboard
- AI-powered study recommendations
- Collaborative features
- Mobile app conversion
- Offline-first PWA
- Database integration (Firebase, etc.)

## Support & Questions

For questions about the modular structure:
1. Check MODULES_REFERENCE.md for detailed module docs
2. Review inline code comments
3. Test features individually
4. Check browser console for errors

---
**Last Updated**: January 2026  
**Version**: 2.0 (Restructured)  
**Status**: Ready for deployment
