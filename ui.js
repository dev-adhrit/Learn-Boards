// ==================== SETTINGS & THEME ====================

function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('subjectSwitchError').classList.add('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function setTheme(themeName) {
    state.theme = themeName;
    applyTheme(themeName);
    saveState();
}

function applyTheme(themeName) {
    const body = document.body;
    body.classList.remove('theme-green', 'theme-purple', 'theme-orange');
    if (themeName !== 'default') {
        body.classList.add(`theme-${themeName}`);
    }
}

function switchSubject(subject) {
    if (subject === 'science') {
        document.getElementById('subjectSwitchError').classList.add('hidden');
    } else {
        document.getElementById('subjectSwitchError').classList.remove('hidden');
    }
}

function saveSettings() {
    state.examDate = document.getElementById('examDate').value;
    state.maxHours = parseFloat(document.getElementById('maxHours').value);
    state.syllabusComplete = document.getElementById('syllabusStatus').value === 'complete';
    saveState();
    closeSettings();
    updateDaysLeft();
    generateDailyPlan();
    showToast('Settings saved!');
}

function resetAllData() {
    if (confirm('This will delete all your progress. Are you sure?')) {
        localStorage.removeItem('sciencePrepState');
        localStorage.removeItem('selectedSubject');
        if (authState.isSignedIn) {
            localStorage.removeItem('learnBoardsData_' + authState.user.email);
        }
        location.reload();
    }
}

// ==================== MATHS LOAD ====================

function setMathsLoad(load) {
    state.mathsLoad = load;
    saveState();
    
    document.querySelectorAll('.maths-btn').forEach(b => {
        b.classList.remove('bg-white', 'text-indigo-700');
        b.classList.add('bg-white/20');
    });
    document.querySelector(`[data-load="${load}"]`).classList.remove('bg-white/20');
    document.querySelector(`[data-load="${load}"]`).classList.add('bg-white', 'text-indigo-700');
    
    const allocations = {
        light: { time: '2 hours', desc: 'Full Science mode: NCERT + Heavy Oswal practice' },
        medium: { time: '1.5 hours', desc: 'Balanced mode: Focused practice + quick revision' },
        heavy: { time: '45 min', desc: 'Light mode: Quick topic review + 10-15 questions only' }
    };
    
    const alloc = allocations[load];
    document.getElementById('scienceAllocation').innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-3xl font-bold">${alloc.time}</span>
            <span class="text-sm text-white/80">→ ${alloc.desc}</span>
        </div>
    `;
    
    generateDailyPlan();
}

// ==================== DAILY PLANNING ====================

function generateDailyPlan() {
    if (!state.examDate) {
        document.getElementById('dailyTasks').innerHTML = `
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <strong>⚠️ Set your exam date first!</strong><br>
                <span class="text-sm">Click the settings icon in the header.</span>
            </div>
        `;
        return;
    }

    const daysLeft = Math.ceil((new Date(state.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    const timeAllocations = { light: 120, medium: 90, heavy: 45 };
    const availableTime = timeAllocations[state.mathsLoad];
    
    let priorityChapter = findPriorityChapter();
    let tasks = [];
    
    if (state.mathsLoad === 'heavy') {
        tasks.push({
            type: 'revision',
            desc: `Quick revision: ${priorityChapter.name}`,
            time: '15 min',
            resource: 'Personal Notes'
        });
        tasks.push({
            type: 'practice',
            desc: '10-15 MCQs from Oswal',
            time: '25 min',
            resource: 'Oswal Question Bank'
        });
    } else if (state.mathsLoad === 'medium') {
        const chapterState = state.chapters[priorityChapter.id];
        if (!chapterState.ncertDone) {
            tasks.push({
                type: 'learn',
                desc: `NCERT reading: ${priorityChapter.name}`,
                time: '30 min',
                resource: 'NCERT Textbook'
            });
        }
        tasks.push({
            type: 'practice',
            desc: 'Topic-wise questions from Oswal',
            time: '40 min',
            resource: 'Oswal Question Bank'
        });
        tasks.push({
            type: 'review',
            desc: 'Mark weak areas, make notes',
            time: '20 min',
            resource: 'Personal Notes'
        });
    } else {
        const chapterState = state.chapters[priorityChapter.id];
        if (!chapterState.ncertDone) {
            tasks.push({
                type: 'learn',
                desc: `Complete NCERT: ${priorityChapter.name}`,
                time: '45 min',
                resource: 'NCERT Textbook'
            });
        }
        tasks.push({
            type: 'practice',
            desc: 'Chapter-wise practice (20+ questions)',
            time: '50 min',
            resource: 'Oswal Question Bank'
        });
        tasks.push({
            type: 'pyq',
            desc: 'PYQs from this chapter (2020-2024)',
            time: '35 min',
            resource: 'Oswal PYQ Section'
        });
    }

    if (state.syllabusComplete && daysLeft <= 14 && state.mathsLoad !== 'heavy') {
        tasks.push({
            type: 'exam',
            desc: 'Timed sample paper section',
            time: '30 min',
            resource: 'Sample Papers (Exam Mode)'
        });
    }

    renderTasks(tasks);
    updateCurrentFocus(priorityChapter);
}

function findPriorityChapter() {
    let allChapters = [];
    Object.keys(CHAPTERS).forEach(subject => {
        CHAPTERS[subject].forEach(ch => {
            allChapters.push({ ...ch, subject, state: state.chapters[ch.id] });
        });
    });

    allChapters.sort((a, b) => {
        const statusPriority = { 'not-started': 0, 'learning': 1, 'practicing': 2, 'mastered': 3 };
        const aPriority = statusPriority[a.state.status];
        const bPriority = statusPriority[b.state.status];
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        if (a.state.accuracy !== b.state.accuracy) {
            return (a.state.accuracy || 0) - (b.state.accuracy || 0);
        }
        return (a.state.lastPracticed || 0) - (b.state.lastPracticed || 0);
    });

    return allChapters[0];
}

function renderTasks(tasks) {
    const container = document.getElementById('dailyTasks');
    const todayKey = new Date().toDateString();
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks_' + todayKey) || '[]');
    
    container.innerHTML = tasks.map((task, idx) => {
        const isComplete = completedTasks.includes(idx);
        const typeIcons = { learn: '📖', practice: '✏️', revision: '🔄', review: '📝', pyq: '📜', exam: '📋' };
        return `
            <div class="flex items-start gap-3 p-4 ${isComplete ? 'bg-green-50 border-green-200' : 'bg-slate-50'} border rounded-xl ${isComplete ? 'task-complete' : ''}">
                <input type="checkbox" ${isComplete ? 'checked' : ''} onchange="toggleTask(${idx})" class="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span>${typeIcons[task.type] || '📌'}</span>
                        <span class="font-medium text-slate-800">${task.desc}</span>
                    </div>
                    <div class="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>⏱️ ${task.time}</span>
                        <span>📚 ${task.resource}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleTask(idx) {
    const todayKey = new Date().toDateString();
    let completedTasks = JSON.parse(localStorage.getItem('completedTasks_' + todayKey) || '[]');
    
    if (completedTasks.includes(idx)) {
        completedTasks = completedTasks.filter(i => i !== idx);
    } else {
        completedTasks.push(idx);
    }
    
    localStorage.setItem('completedTasks_' + todayKey, JSON.stringify(completedTasks));
    generateDailyPlan();
}

function updateCurrentFocus(chapter) {
    const subjectColors = {
        physics: 'blue',
        chemistry: 'green',
        biology: 'purple'
    };
    const color = subjectColors[chapter.subject];
    const chState = state.chapters[chapter.id];
    
    document.getElementById('currentFocus').innerHTML = `
        <div class="p-4 bg-${color}-50 border-2 border-${color}-200 rounded-xl">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-${color}-800">${chapter.name}</h4>
                <span class="text-xs px-2 py-1 bg-${color}-200 text-${color}-800 rounded-full">${chapter.subject.charAt(0).toUpperCase() + chapter.subject.slice(1)}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="text-xs px-2 py-1 ${chState.ncertDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'} rounded-full">
                    ${chState.ncertDone ? '✓' : '○'} NCERT
                </span>
                <span class="text-xs px-2 py-1 ${chState.oswalDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'} rounded-full">
                    ${chState.oswalDone ? '✓' : '○'} Oswal
                </span>
                <span class="text-xs px-2 py-1 ${chState.pyqsDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'} rounded-full">
                    ${chState.pyqsDone ? '✓' : '○'} PYQs
                </span>
            </div>
            <div class="text-sm text-${color}-700">
                <strong>Topics:</strong> ${chapter.topics.join(', ')}
            </div>
        </div>
    `;
}

// ==================== TIMER ====================

function setTimer(minutes) {
    timerState.duration = minutes * 60;
    timerState.remaining = minutes * 60;
    updateTimerDisplay();
}

function startTimer() {
    if (timerState.running) return;
    timerState.running = true;
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    
    timerState.interval = setInterval(() => {
        timerState.remaining--;
        updateTimerDisplay();
        
        if (timerState.remaining <= 0) {
            pauseTimer();
            playNotification();
            showToast('⏰ Time\'s up! Log your session.');
        }
    }, 1000);
}

function pauseTimer() {
    timerState.running = false;
    clearInterval(timerState.interval);
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    timerState.remaining = timerState.duration;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(timerState.remaining / 60);
    const secs = timerState.remaining % 60;
    document.getElementById('timerDisplay').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function playNotification() {
    try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        oscillator.connect(audio.destination);
        oscillator.frequency.value = 800;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    } catch (e) {}
}

// ==================== SESSION LOGGING ====================

function populateChapterSelect() {
    const select = document.getElementById('sessionChapter');
    select.innerHTML = '<option value="">Select Chapter</option>';
    
    Object.keys(CHAPTERS).forEach(subject => {
        const group = document.createElement('optgroup');
        group.label = subject.charAt(0).toUpperCase() + subject.slice(1);
        CHAPTERS[subject].forEach(ch => {
            const opt = document.createElement('option');
            opt.value = ch.id;
            opt.textContent = ch.name;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const activitySelect = document.getElementById('sessionActivity');
    if (activitySelect) {
        activitySelect.addEventListener('change', function() {
            const tips = {
                ncert: { 
                    tip: '📖 NCERT is for first-time learning only. Read actively with a pen. Make margin notes.',
                    warning: state.chapters[document.getElementById('sessionChapter').value]?.ncertDone ? 
                        '⚠️ You\'ve already completed NCERT for this chapter. Use Oswal for practice instead.' : null
                },
                oswal: { 
                    tip: '✏️ Focus on understanding solutions, not just answers. Mark questions you got wrong.',
                    warning: null 
                },
                pyq: { 
                    tip: '📜 Treat these like real exams. Time yourself. Check marking scheme from SuperCoP.',
                    warning: null 
                },
                revision: { 
                    tip: '🔄 Quick review only. If a concept is unclear, go back to Oswal practice, not NCERT.',
                    warning: !state.chapters[document.getElementById('sessionChapter').value]?.ncertDone ? 
                        '⚠️ Complete NCERT first before revision. Notes are not for first-time learning.' : null
                },
                sample: { 
                    tip: '📋 Exam mode only! No references. Time strictly. This is for self-evaluation.',
                    warning: !state.syllabusComplete ? 
                        '⚠️ Sample papers should only be used after completing the full syllabus once.' : null
                }
            };
            
            const selected = tips[this.value];
            document.getElementById('resourceTip').innerHTML = `<strong>💡 Tip:</strong> ${selected.tip}`;
            
            if (selected.warning) {
                document.getElementById('resourceWarning').innerHTML = selected.warning;
                document.getElementById('resourceWarning').classList.remove('hidden');
            } else {
                document.getElementById('resourceWarning').classList.add('hidden');
            }
        });
    }
});

function logSession() {
    const chapter = document.getElementById('sessionChapter').value;
    const activity = document.getElementById('sessionActivity').value;
    const attempted = parseInt(document.getElementById('questionsAttempted').value) || 0;
    const correct = parseInt(document.getElementById('questionsCorrect').value) || 0;
    const difficulty = document.getElementById('difficultyLevel').value;
    
    if (!chapter) {
        showToast('Please select a chapter');
        return;
    }

    const timeSpent = timerState.duration - timerState.remaining;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

    const session = {
        date: new Date().toISOString(),
        chapter,
        activity,
        attempted,
        correct,
        accuracy,
        difficulty,
        timeSpent: Math.round(timeSpent / 60)
    };

    state.sessions.push(session);
    
    if (activity === 'ncert') state.chapters[chapter].ncertDone = true;
    if (activity === 'oswal') state.chapters[chapter].oswalDone = true;
    if (activity === 'pyq') state.chapters[chapter].pyqsDone = true;
    
    if (accuracy !== null) {
        state.chapters[chapter].accuracy = accuracy;
    }
    state.chapters[chapter].lastPracticed = Date.now();

    if (state.chapters[chapter].ncertDone && state.chapters[chapter].status === 'not-started') {
        state.chapters[chapter].status = 'learning';
    }
    if (state.chapters[chapter].oswalDone) {
        state.chapters[chapter].status = 'practicing';
    }
    if (state.chapters[chapter].ncertDone && state.chapters[chapter].oswalDone && state.chapters[chapter].pyqsDone && accuracy >= 80) {
        state.chapters[chapter].status = 'mastered';
    }

    const today = new Date().toDateString();
    if (state.lastStudyDate !== today) {
        state.todayStats = { time: 0, questions: 0, correct: 0 };
    }
    state.todayStats.time += Math.round(timeSpent / 60);
    state.todayStats.questions += attempted;
    state.todayStats.correct += correct;
    state.lastStudyDate = today;

    saveState();
    resetTimer();
    document.getElementById('questionsAttempted').value = 0;
    document.getElementById('questionsCorrect').value = 0;
    
    updateProgress();
    updateRecentSessions();
    updateWeeklyChart();
    updateTodayStats();
    updateWeakTopics();
    renderChapters();
    checkStreak();
    
    showToast('Session logged successfully! 🎉');
}

// ==================== UTILITIES ====================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
