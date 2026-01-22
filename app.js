// ==================== DATA STRUCTURES ====================

const CHAPTERS = {
    physics: [
        { id: 'electricity', name: 'Electricity', weight: 8, topics: ['Ohm\'s Law', 'Resistance', 'Series & Parallel', 'Power & Energy', 'Numericals'] },
        { id: 'magnetic', name: 'Magnetic Effects of Electric Current', weight: 6, topics: ['Magnetic Field', 'Fleming\'s Rules', 'Electric Motor', 'Electromagnetic Induction', 'Generator'] },
        { id: 'light', name: 'Light – Reflection and Refraction', weight: 8, topics: ['Reflection', 'Spherical Mirrors', 'Refraction', 'Lenses', 'Power of Lens'] },
        { id: 'human-eye', name: 'The Human Eye and Colourful World', weight: 5, topics: ['Human Eye', 'Defects of Vision', 'Atmospheric Refraction', 'Dispersion', 'Scattering'] }
    ],
    chemistry: [
        { id: 'chemical-reactions', name: 'Chemical Reactions and Equations', weight: 5, topics: ['Balancing Equations', 'Types of Reactions', 'Oxidation-Reduction', 'Corrosion', 'Rancidity'] },
        { id: 'acids-bases', name: 'Acids, Bases and Salts', weight: 7, topics: ['Properties', 'pH Scale', 'Indicators', 'Salts', 'Preparation Methods'] },
        { id: 'metals', name: 'Metals and Non-metals', weight: 6, topics: ['Physical Properties', 'Chemical Properties', 'Reactivity Series', 'Extraction', 'Corrosion'] },
        { id: 'carbon', name: 'Carbon and its Compounds', weight: 8, topics: ['Bonding', 'Hydrocarbons', 'Functional Groups', 'Nomenclature', 'Chemical Properties'] }
    ],
    biology: [
        { id: 'life-processes', name: 'Life Processes', weight: 8, topics: ['Nutrition', 'Respiration', 'Transportation', 'Excretion'] },
        { id: 'control', name: 'Control and Coordination', weight: 6, topics: ['Nervous System', 'Reflex Arc', 'Brain', 'Hormones', 'Plant Hormones'] },
        { id: 'reproduction', name: 'How do Organisms Reproduce', weight: 7, topics: ['Asexual', 'Sexual Reproduction', 'Human Reproduction', 'Reproductive Health'] },
        { id: 'heredity', name: 'Heredity and Evolution', weight: 6, topics: ['Mendel\'s Laws', 'Sex Determination', 'Evolution', 'Speciation', 'Human Evolution'] },
        { id: 'environment', name: 'Environment', weight: 4, topics: ['Ecosystem', 'Food Chain', 'Ozone Layer', 'Waste Management'] }
    ]
};

// Board Papers Data
const BOARD_PAPERS = [
    { year: 2016 }, { year: 2017 }, { year: 2018 }, { year: 2019 }, 
    { year: 2020 }, { year: 2021 }, { year: 2022 }, { year: 2023 }, 
    { year: 2024 }, { year: 2025 }
];

// ==================== STATE MANAGEMENT ====================

let state = {
    examDate: null,
    maxHours: 1.5,
    mathsLoad: 'medium',
    syllabusComplete: false,
    chapters: {},
    sessions: [],
    streak: 0,
    lastStudyDate: null,
    todayStats: { time: 0, questions: 0, correct: 0 },
    boardPapers: {},
    theme: 'default',
    language: 'en'
};

// Timer state
let timerState = {
    duration: 25 * 60,
    remaining: 25 * 60,
    running: false,
    interval: null
};

// Auth state
let authState = {
    isSignedIn: false,
    user: null,
    isSignUpMode: false
};

// ==================== INITIALIZATION ====================

function init() {
    loadAuthState();
    checkSavedSubject();
    loadState();
    initChapters();
    initBoardPapers();
    renderChapters();
    renderBoardPapers();
    updateDaysLeft();
    updateProgress();
    updateWeeklyChart();
    updateRecentSessions();
    populateChapterSelect();
    checkStreak();
    
    // Set initial values
    if (state.examDate) {
        document.getElementById('examDate').value = state.examDate;
    }
    document.getElementById('maxHours').value = state.maxHours;
    document.getElementById('syllabusStatus').value = state.syllabusComplete ? 'complete' : 'incomplete';
    
    // Restore maths load
    if (state.mathsLoad) {
        setMathsLoad(state.mathsLoad);
    }
    if (state.theme) {
        applyTheme(state.theme);
    }
    
    // Load translations
    loadLanguage(state.language);
}

function initChapters() {
    if (Object.keys(state.chapters).length === 0) {
        Object.keys(CHAPTERS).forEach(subject => {
            CHAPTERS[subject].forEach(ch => {
                state.chapters[ch.id] = {
                    status: 'not-started',
                    ncertDone: false,
                    oswalDone: false,
                    pyqsDone: false,
                    lastPracticed: null,
                    accuracy: null,
                    topicProgress: {}
                };
                ch.topics.forEach(t => {
                    state.chapters[ch.id].topicProgress[t] = 'pending';
                });
            });
        });
        saveState();
    }
}

function initBoardPapers() {
    if (!state.boardPapers || Object.keys(state.boardPapers).length === 0) {
        state.boardPapers = {};
        BOARD_PAPERS.forEach(paper => {
            state.boardPapers[paper.year] = {
                completed: false,
                completedDate: null
            };
        });
        saveState();
    }
}

// ==================== LOCAL STORAGE ====================

function saveState() {
    localStorage.setItem('sciencePrepState', JSON.stringify(state));
    if (authState.isSignedIn) {
        saveUserData(authState.user.email);
    }
}

function loadState() {
    const saved = localStorage.getItem('sciencePrepState');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    }
    if (state.theme) {
        applyTheme(state.theme);
    }
}

// ==================== SUBJECT SELECTION ====================

function enterSubject(subject) {
    if (subject === 'science') {
        document.getElementById('subjectSelectionPage').classList.add('hidden');
        document.getElementById('scienceApp').classList.remove('hidden');
        localStorage.setItem('selectedSubject', 'science');
    }
}

function goToSubjectSelection() {
    document.getElementById('scienceApp').classList.add('hidden');
    document.getElementById('subjectSelectionPage').classList.remove('hidden');
    localStorage.removeItem('selectedSubject');
}

function checkSavedSubject() {
    const saved = localStorage.getItem('selectedSubject');
    if (saved === 'science') {
        enterSubject('science');
    }
}

// ==================== NAVIGATION ====================

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-indigo-100', 'text-indigo-700');
        b.classList.add('text-slate-600', 'hover:bg-slate-100');
    });
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-slate-600', 'hover:bg-slate-100');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('bg-indigo-100', 'text-indigo-700');
}

// ==================== BOARD PAPERS TRACKER ====================

function renderBoardPapers() {
    const container = document.getElementById('boardPapersList');
    let completedCount = 0;

    container.innerHTML = BOARD_PAPERS.map(paper => {
        const paperState = state.boardPapers[paper.year] || { completed: false, completedDate: null };
        if (paperState.completed) completedCount++;

        return `
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border ${paperState.completed ? 'border-green-200 bg-green-50' : 'border-slate-200'}">
                <div class="flex items-center gap-4">
                    <input 
                        type="checkbox" 
                        ${paperState.completed ? 'checked' : ''} 
                        onchange="toggleBoardPaper(${paper.year})" 
                        class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    >
                    <div>
                        <span class="font-medium text-slate-800">CBSE ${paper.year}</span>
                        <span class="text-sm text-slate-500 ml-2">Science Board Paper</span>
                    </div>
                </div>
                <div class="text-right">
                    ${paperState.completed && paperState.completedDate ? 
                        `<span class="text-xs text-green-600">Completed ${new Date(paperState.completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>` : 
                        '<span class="text-xs text-slate-400">Not done</span>'
                    }
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('papersCompleted').textContent = `${completedCount} / ${BOARD_PAPERS.length}`;
    document.getElementById('papersProgressBar').style.width = `${(completedCount / BOARD_PAPERS.length) * 100}%`;

    if (completedCount === 0) {
        document.getElementById('papersEmptyHint').classList.remove('hidden');
    } else {
        document.getElementById('papersEmptyHint').classList.add('hidden');
    }
}

function toggleBoardPaper(year) {
    if (!state.boardPapers[year]) {
        state.boardPapers[year] = { completed: false, completedDate: null };
    }

    state.boardPapers[year].completed = !state.boardPapers[year].completed;
    state.boardPapers[year].completedDate = state.boardPapers[year].completed ? new Date().toISOString() : null;

    saveState();
    renderBoardPapers();
}

// ==================== CHAPTER MANAGEMENT ====================

function renderChapters() {
    Object.keys(CHAPTERS).forEach(subject => {
        const container = document.getElementById(`${subject}Chapters`);
        container.innerHTML = CHAPTERS[subject].map(ch => {
            const chState = state.chapters[ch.id];
            const statusColors = {
                'not-started': 'bg-slate-100 text-slate-600',
                'learning': 'bg-amber-100 text-amber-700',
                'practicing': 'bg-blue-100 text-blue-700',
                'mastered': 'bg-green-100 text-green-700'
            };
            const statusLabels = {
                'not-started': 'Not Started',
                'learning': 'Learning',
                'practicing': 'Practicing',
                'mastered': 'Mastered'
            };
            return `
                <div onclick="openChapterModal('${subject}', '${ch.id}')" class="p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition border">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-sm text-slate-800">${ch.name}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-0.5 rounded-full ${statusColors[chState.status]}">${statusLabels[chState.status]}</span>
                        ${chState.accuracy !== null ? `<span class="text-xs text-slate-500">${chState.accuracy}% acc</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    });
}

function openChapterModal(subject, chapterId) {
    const chapter = CHAPTERS[subject].find(c => c.id === chapterId);
    const chState = state.chapters[chapterId];
    const subjectColors = { physics: 'blue', chemistry: 'green', biology: 'purple' };
    const color = subjectColors[subject];
    
    const modal = document.getElementById('chapterModal');
    const content = document.getElementById('chapterModalContent');
    
    content.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <span class="text-xs px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full">${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                    <h3 class="font-bold text-xl text-slate-800 mt-2">${chapter.name}</h3>
                </div>
                <button onclick="closeChapterModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Chapter Status</label>
                    <select onchange="updateChapterStatus('${chapterId}', this.value)" class="w-full p-3 border rounded-xl">
                        <option value="not-started" ${chState.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                        <option value="learning" ${chState.status === 'learning' ? 'selected' : ''}>Learning (NCERT phase)</option>
                        <option value="practicing" ${chState.status === 'practicing' ? 'selected' : ''}>Practicing (Oswal phase)</option>
                        <option value="mastered" ${chState.status === 'mastered' ? 'selected' : ''}>Mastered</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-3 gap-3">
                    <label class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <input type="checkbox" ${chState.ncertDone ? 'checked' : ''} onchange="toggleChapterFlag('${chapterId}', 'ncertDone')" class="w-4 h-4 text-indigo-600 rounded">
                        <span class="text-sm">NCERT Done</span>
                    </label>
                    <label class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <input type="checkbox" ${chState.oswalDone ? 'checked' : ''} onchange="toggleChapterFlag('${chapterId}', 'oswalDone')" class="w-4 h-4 text-indigo-600 rounded">
                        <span class="text-sm">Oswal Done</span>
                    </label>
                    <label class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <input type="checkbox" ${chState.pyqsDone ? 'checked' : ''} onchange="toggleChapterFlag('${chapterId}', 'pyqsDone')" class="w-4 h-4 text-indigo-600 rounded">
                        <span class="text-sm">PYQs Done</span>
                    </label>
                </div>
                
                <div>
                    <h4 class="text-sm font-medium text-slate-600 mb-2">Topics</h4>
                    <div class="flex flex-wrap gap-2">
                        ${chapter.topics.map(t => {
                            const topicState = chState.topicProgress[t] || 'pending';
                            const topicColors = { pending: 'bg-slate-100 text-slate-600', done: 'bg-green-100 text-green-700', weak: 'bg-red-100 text-red-700' };
                            return `
                                <button onclick="cycleTopicStatus('${chapterId}', '${t}')" class="text-xs px-3 py-1.5 rounded-full ${topicColors[topicState]} hover:opacity-80 transition">
                                    ${topicState === 'done' ? '✓' : topicState === 'weak' ? '!' : '○'} ${t}
                                </button>
                            `;
                        }).join('')}
                    </div>
                    <p class="text-xs text-slate-400 mt-2">Click to cycle: pending → done → weak → pending</p>
                </div>
                
                ${chState.accuracy !== null ? `
                    <div class="p-4 bg-slate-50 rounded-xl">
                        <div class="flex justify-between">
                            <span class="text-sm text-slate-600">Last Accuracy</span>
                            <span class="font-bold text-slate-800">${chState.accuracy}%</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeChapterModal() {
    document.getElementById('chapterModal').classList.add('hidden');
}

function updateChapterStatus(chapterId, status) {
    state.chapters[chapterId].status = status;
    saveState();
    renderChapters();
    updateProgress();
}

function toggleChapterFlag(chapterId, flag) {
    state.chapters[chapterId][flag] = !state.chapters[chapterId][flag];
    saveState();
    renderChapters();
}

function cycleTopicStatus(chapterId, topic) {
    const current = state.chapters[chapterId].topicProgress[topic];
    const cycle = { pending: 'done', done: 'weak', weak: 'pending' };
    state.chapters[chapterId].topicProgress[topic] = cycle[current];
    saveState();
    let subject = '';
    Object.keys(CHAPTERS).forEach(s => {
        if (CHAPTERS[s].find(c => c.id === chapterId)) subject = s;
    });
    openChapterModal(subject, chapterId);
    updateWeakTopics();
}
