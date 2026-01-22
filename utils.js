// ==================== PROGRESS TRACKING ====================

function updateProgress() {
    let completed = 0;
    Object.keys(state.chapters).forEach(id => {
        if (state.chapters[id].status === 'mastered') completed++;
    });

    const percent = Math.round((completed / 13) * 100);
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('chaptersComplete').textContent = completed;
    
    const ring = document.getElementById('progressRing');
    const offset = 251.2 - (251.2 * percent / 100);
    ring.style.strokeDashoffset = offset;

    Object.keys(CHAPTERS).forEach(subject => {
        let subjectComplete = 0;
        CHAPTERS[subject].forEach(ch => {
            if (state.chapters[ch.id].status === 'mastered') subjectComplete++;
        });
        const subjectPercent = Math.round((subjectComplete / CHAPTERS[subject].length) * 100);
        document.getElementById(`${subject}Progress`).textContent = subjectPercent + '%';
        document.getElementById(`${subject}Bar`).style.width = subjectPercent + '%';
    });
}

function updateDaysLeft() {
    if (!state.examDate) {
        document.getElementById('daysLeft').textContent = '--';
        return;
    }
    const days = Math.ceil((new Date(state.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('daysLeft').textContent = days > 0 ? days : 0;
}

function updateTodayStats() {
    const today = new Date().toDateString();
    if (state.lastStudyDate === today) {
        document.getElementById('todayStudyTime').textContent = state.todayStats.time + ' min';
        document.getElementById('todayQuestions').textContent = state.todayStats.questions;
        const acc = state.todayStats.questions > 0 ? 
            Math.round((state.todayStats.correct / state.todayStats.questions) * 100) : 0;
        document.getElementById('todayAccuracy').textContent = acc + '%';
    }
}

function updateWeeklyChart() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const container = document.getElementById('weeklyChart');
    const today = new Date();
    
    container.innerHTML = '';
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const daySessions = state.sessions.filter(s => 
            new Date(s.date).toDateString() === dateStr
        );
        const totalTime = daySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
        const height = Math.min(100, (totalTime / 120) * 100);
        
        container.innerHTML += `
            <div class="text-center">
                <div class="h-24 bg-slate-100 rounded-lg relative overflow-hidden">
                    <div class="absolute bottom-0 w-full bg-indigo-500 rounded-lg transition-all" style="height: ${height}%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-1">${days[date.getDay()]}</p>
                <p class="text-xs font-medium text-slate-700">${totalTime}m</p>
            </div>
        `;
    }
}

function updateRecentSessions() {
    const container = document.getElementById('recentSessions');
    const recent = state.sessions.slice(-10).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm">No sessions logged yet</p>';
        return;
    }

    container.innerHTML = recent.map(s => {
        const chapter = Object.keys(CHAPTERS).flatMap(sub => 
            CHAPTERS[sub].map(c => ({ ...c, subject: sub }))
        ).find(c => c.id === s.chapter);
        
        const activityLabels = { ncert: '📖 NCERT', oswal: '✏️ Oswal', pyq: '📜 PYQ', revision: '🔄 Revision', sample: '📋 Sample' };
        const date = new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        
        return `
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                    <span class="font-medium text-slate-800">${chapter?.name || s.chapter}</span>
                    <div class="text-sm text-slate-500">${activityLabels[s.activity] || s.activity} • ${date}</div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-slate-800">${s.accuracy !== null ? s.accuracy + '%' : '-'}</span>
                    <div class="text-xs text-slate-500">${s.attempted} Q • ${s.timeSpent}m</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateWeakTopics() {
    const container = document.getElementById('weakTopics');
    let weakAreas = [];

    Object.keys(state.chapters).forEach(chId => {
        const ch = state.chapters[chId];
        Object.keys(ch.topicProgress).forEach(topic => {
            if (ch.topicProgress[topic] === 'weak') {
                const chapterData = Object.keys(CHAPTERS).flatMap(s => CHAPTERS[s]).find(c => c.id === chId);
                weakAreas.push({ chapter: chapterData?.name || chId, topic });
            }
        });
        
        if (ch.accuracy !== null && ch.accuracy < 60) {
            const chapterData = Object.keys(CHAPTERS).flatMap(s => CHAPTERS[s]).find(c => c.id === chId);
            if (!weakAreas.find(w => w.chapter === chapterData?.name)) {
                weakAreas.push({ chapter: chapterData?.name || chId, topic: 'Overall (low accuracy)' });
            }
        }
    });

    if (weakAreas.length === 0) {
        container.innerHTML = '<p class="text-red-600 text-sm">No weak areas identified yet. Keep practicing!</p>';
        return;
    }

    container.innerHTML = weakAreas.map(w => `
        <div class="p-3 bg-white rounded-lg border border-red-200">
            <span class="font-medium text-red-800">${w.chapter}</span>
            <p class="text-sm text-red-600">${w.topic}</p>
        </div>
    `).join('');
}

function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (state.lastStudyDate === today) {
    } else if (state.lastStudyDate === yesterday) {
    } else if (state.lastStudyDate) {
        state.streak = 0;
    }
    
    if (state.lastStudyDate === today && state.streak === 0) {
        state.streak = 1;
    }
    
    let streak = 0;
    let checkDate = new Date();
    while (true) {
        const dateStr = checkDate.toDateString();
        const hasSession = state.sessions.some(s => new Date(s.date).toDateString() === dateStr);
        if (hasSession) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (checkDate.toDateString() === today) {
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    state.streak = streak;
    document.getElementById('streakCount').textContent = streak + ' day' + (streak !== 1 ? 's' : '');
    saveState();
}

// ==================== AUTHENTICATION ====================

function loadAuthState() {
    const savedAuth = localStorage.getItem('learnBoardsAuth');
    if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        authState.isSignedIn = true;
        authState.user = parsed;
        loadUserData(parsed.email);
    }
    updateAuthUI();
}

function updateAuthUI() {
    const headerArea = document.getElementById('authHeaderArea');
    
    if (authState.isSignedIn) {
        headerArea.innerHTML = `
            <button onclick="openAccountModal()" class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-sm">${authState.user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span class="text-sm font-medium text-slate-700">${authState.user.name}</span>
            </button>
        `;
        document.getElementById('authNotSignedIn').classList.add('hidden');
        document.getElementById('authSignedIn').classList.remove('hidden');
        document.getElementById('userName').textContent = authState.user.name;
        document.getElementById('userEmail').textContent = authState.user.email;
        document.getElementById('userInitial').textContent = authState.user.name.charAt(0).toUpperCase();
    } else {
        headerArea.innerHTML = `
            <button onclick="openAccountModal()" class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-sm font-medium text-slate-700">Sign In</span>
            </button>
        `;
        document.getElementById('authNotSignedIn').classList.remove('hidden');
        document.getElementById('authSignedIn').classList.add('hidden');
    }
}

function openAccountModal() {
    document.getElementById('accountModal').classList.remove('hidden');
    updateAuthUI();
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.add('hidden');
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('authName').value = '';
    document.getElementById('authError').classList.add('hidden');
    authState.isSignUpMode = false;
    updateAuthFormUI();
}

function toggleAuthMode() {
    authState.isSignUpMode = !authState.isSignUpMode;
    updateAuthFormUI();
}

function updateAuthFormUI() {
    const nameField = document.getElementById('authNameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.getElementById('authToggleBtn');
    
    if (authState.isSignUpMode) {
        nameField.classList.remove('hidden');
        submitBtn.textContent = 'Create Account';
        toggleBtn.textContent = 'Already have an account? Sign In';
    } else {
        nameField.classList.add('hidden');
        submitBtn.textContent = 'Sign In';
        toggleBtn.textContent = "Don't have an account? Sign Up";
    }
}

function handleAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value.trim();
    const errorEl = document.getElementById('authError');
    
    if (!email || !password) {
        errorEl.textContent = 'Please fill in all fields';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!email.includes('@')) {
        errorEl.textContent = 'Please enter a valid email';
        errorEl.classList.remove('hidden');
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        errorEl.classList.remove('hidden');
        return;
    }

    const accounts = JSON.parse(localStorage.getItem('learnBoardsAccounts') || '{}');

    if (authState.isSignUpMode) {
        if (!name) {
            errorEl.textContent = 'Please enter your name';
            errorEl.classList.remove('hidden');
            return;
        }

        if (accounts[email]) {
            errorEl.textContent = 'An account with this email already exists';
            errorEl.classList.remove('hidden');
            return;
        }

        accounts[email] = {
            name: name,
            password: btoa(password),
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('learnBoardsAccounts', JSON.stringify(accounts));
        saveUserData(email);

        authState.isSignedIn = true;
        authState.user = { email, name };
        localStorage.setItem('learnBoardsAuth', JSON.stringify({ email, name }));
        
        showToast('Account created successfully! 🎉');
    } else {
        if (!accounts[email]) {
            errorEl.textContent = 'No account found with this email';
            errorEl.classList.remove('hidden');
            return;
        }

        if (accounts[email].password !== btoa(password)) {
            errorEl.textContent = 'Incorrect password';
            errorEl.classList.remove('hidden');
            return;
        }

        loadUserData(email);

        authState.isSignedIn = true;
        authState.user = { email, name: accounts[email].name };
        localStorage.setItem('learnBoardsAuth', JSON.stringify({ email, name: accounts[email].name }));
        
        showToast('Welcome back! 👋');
    }

    updateAuthUI();
    closeAccountModal();
}

function saveUserData(email) {
    const key = 'learnBoardsData_' + email;
    localStorage.setItem(key, JSON.stringify(state));
}

function loadUserData(email) {
    const key = 'learnBoardsData_' + email;
    const savedData = localStorage.getItem(key);
    if (savedData) {
        state = { ...state, ...JSON.parse(savedData) };
        initChapters();
        initBoardPapers();
        renderChapters();
        renderBoardPapers();
        updateDaysLeft();
        updateProgress();
        updateWeeklyChart();
        updateRecentSessions();
        updateTodayStats();
        checkStreak();
        if (state.mathsLoad) {
            setMathsLoad(state.mathsLoad);
        }
        if (state.theme) {
            applyTheme(state.theme);
        }
    }
}

function syncData() {
    if (authState.isSignedIn) {
        saveUserData(authState.user.email);
        showToast('Progress synced! ☁️');
    }
}

function signOut() {
    if (authState.isSignedIn) {
        saveUserData(authState.user.email);
    }
    
    authState.isSignedIn = false;
    authState.user = null;
    localStorage.removeItem('learnBoardsAuth');
    
    updateAuthUI();
    closeAccountModal();
    showToast('Signed out successfully');
}
