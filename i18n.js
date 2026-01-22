// ==================== INTERNATIONALIZATION ====================

let translations = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}/translations.json`);
        translations = await response.json();
        state.language = lang;
        applyTranslations();
        saveState();
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

function applyTranslations() {
    // Apply translations to all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Apply translations to title and meta tags
    if (translations.app?.title) {
        document.title = translations.app.title;
    }
}

function getTranslation(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value[k] !== undefined) {
            value = value[k];
        } else {
            return key; // Fallback to key if translation not found
        }
    }
    
    return value;
}

function setLanguage(lang) {
    loadLanguage(lang);
}

// Helper function for inline translations
function t(key) {
    return getTranslation(key);
}
