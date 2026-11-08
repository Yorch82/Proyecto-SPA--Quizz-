'use strict';

/* =========================================================
   Config
   ========================================================= */

const API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';
const TOTAL_QUESTIONS = 10;
const HISTORY_LIMIT = 60;
const STORAGE_KEYS = {
    history: 'triviaQuiz.history.v1',
    sound: 'triviaQuiz.sound.v1'
};

const SOUND_TRACKS = [
    { min: 10, src: './Assets/Austin.mp3' },
    { min: 8, src: './Assets/Chiquito.mp3' },
    { min: 5, src: './Assets/Kids.mp3' },
    { min: 3, src: './Assets/Retratado.mp3' },
    { min: 0, src: './Assets/Fail.mp3' }
];

const RESULT_COPY = [
    {
        test: (score, total) => score === total && total > 0,
        title: 'Legendary!',
        message: 'A perfect run. Every single answer, flawless. That was a masterclass.'
    },
    {
        test: (score, total) => score / total >= 0.8,
        title: 'Outstanding!',
        message: "You're officially a trivia beast. Keep that streak alive and go for perfection."
    },
    {
        test: (score, total) => score / total >= 0.5,
        title: 'Solid work!',
        message: "A respectable score with plenty of good calls. One more run and you'll top the board."
    },
    {
        test: (score, total) => score / total >= 0.3,
        title: 'Almost there!',
        message: "You're close. A little more luck and those tricky questions won't stand a chance."
    },
    {
        test: () => true,
        title: 'Tough round!',
        message: 'Every expert started somewhere. Jump back in and beat this score.'
    }
];

/* =========================================================
   DOM
   ========================================================= */

const screens = Array.from(document.querySelectorAll('.screen'));

const screenWelcome = document.getElementById('screen-welcome');
const screenLoading = document.getElementById('screen-loading');
const screenError = document.getElementById('screen-error');
const screenQuiz = document.getElementById('screen-quiz');
const screenResults = document.getElementById('screen-results');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const errorHome = document.getElementById('error-home');
const brandHome = document.getElementById('brand-home');
const soundToggle = document.getElementById('sound-toggle');

const welcomeBest = document.getElementById('welcome-best');
const welcomeGames = document.getElementById('welcome-games');

const questionCounter = document.getElementById('question-counter');
const liveScore = document.getElementById('live-score');
const streakBadge = document.getElementById('streak-badge');
const streakCount = document.getElementById('streak-count');
const progressTrack = document.getElementById('progress-track');
const progressBar = document.getElementById('progress-bar');
const categoryBadge = document.getElementById('category-badge');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionText = document.getElementById('question-text');
const answersEl = document.getElementById('answers');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

const errorMessage = document.getElementById('error-message');

const scoreRing = document.getElementById('score-ring');
const finalScore = document.getElementById('final-score');
const finalTotal = document.getElementById('final-total');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const statCorrect = document.getElementById('stat-correct');
const statWrong = document.getElementById('stat-wrong');
const statAccuracy = document.getElementById('stat-accuracy');
const resultsCard = document.querySelector('.results-card');

const statsModal = document.getElementById('stats-modal');
const statsClose = document.getElementById('stats-close');
const statsBest = document.getElementById('stats-best');
const statsAverage = document.getElementById('stats-average');
const statsGames = document.getElementById('stats-games');
const statsChart = document.getElementById('stats-chart');
const statsEmpty = document.getElementById('stats-empty');
const clearStats = document.getElementById('clear-stats');
const viewStats = document.getElementById('view-stats');
const viewStatsWelcome = document.getElementById('view-stats-welcome');

const toast = document.getElementById('toast');
const sfx = document.getElementById('sfx');

/* =========================================================
   State
   ========================================================= */

const state = {
    questions: [],
    index: 0,
    correct: 0,
    streak: 0,
    answered: false,
    isLoading: false,
    resultsShown: false,
    soundOn: loadSoundSetting(),
    history: loadHistory(),
    gameId: 0,
    lastFocused: null,
    clearArmed: false,
    clearTimer: null
};

/* =========================================================
   Storage
   ========================================================= */

function loadHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.history);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((game) => game && Number.isFinite(game.score) && Number.isFinite(game.total) && game.total > 0)
            .slice(-HISTORY_LIMIT);
    } catch (error) {
        return [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
    } catch (error) {
        showToast('Your browser is not letting us save stats.');
    }
}

function loadSoundSetting() {
    try {
        return localStorage.getItem(STORAGE_KEYS.sound) !== 'off';
    } catch (error) {
        return true;
    }
}

function saveSoundSetting() {
    try {
        localStorage.setItem(STORAGE_KEYS.sound, state.soundOn ? 'on' : 'off');
    } catch (error) {
        /* Storage can be unavailable; sound still works for this session. */
    }
}

/* =========================================================
   Helpers
   ========================================================= */

const entityDecoder = document.createElement('textarea');

function decodeEntities(value = '') {
    entityDecoder.innerHTML = String(value);
    return entityDecoder.value;
}

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function capitalize(value = '') {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function showScreen(id) {
    screens.forEach((screen) => {
        screen.hidden = screen.id !== id;
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
}

let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2600);
}

/* =========================================================
   Sound
   ========================================================= */

function renderSoundButton() {
    soundToggle.setAttribute('aria-pressed', String(state.soundOn));
    soundToggle.setAttribute('aria-label', state.soundOn ? 'Mute sound' : 'Enable sound');
    soundToggle.classList.toggle('is-muted', !state.soundOn);
}

function playResultSound(correct) {
    if (!state.soundOn) return;

    const track = SOUND_TRACKS.find((item) => correct >= item.min) || SOUND_TRACKS[SOUND_TRACKS.length - 1];
    sfx.pause();
    sfx.src = track.src;
    sfx.currentTime = 0;
    sfx.volume = 0.65;

    const playPromise = sfx.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
            /* Autoplay can be blocked by the browser; sound is optional. */
        });
    }
}

function stopSound() {
    sfx.pause();
    sfx.currentTime = 0;
}

/* =========================================================
   API
   ========================================================= */

async function fetchQuestions() {
    let lastError = new Error('unknown');

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(API_URL, {
                signal: controller.signal,
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`http-${response.status}`);
            }

            const data = await response.json();

            if (data.response_code === 5) {
                throw new Error('rate-limit');
            }

            if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
                throw new Error('no-results');
            }

            return data.results;
        } catch (error) {
            lastError = error;
            if (attempt === 0) {
                await wait(800);
            }
        } finally {
            window.clearTimeout(timeout);
        }
    }

    throw lastError;
}

function friendlyError(error) {
    if (error && error.name === 'AbortError') {
        return 'The request took too long. Check your connection and try again.';
    }
    if (error && error.message === 'rate-limit') {
        return 'The trivia service is busy right now. Wait a few seconds and try again.';
    }
    if (error && error.message === 'no-results') {
        return 'The trivia service returned no questions. Please try again.';
    }
    return 'We could not reach the trivia service. Check your connection and try again.';
}

function normalizeQuestion(raw) {
    const incorrect = Array.isArray(raw.incorrect_answers) ? raw.incorrect_answers : [];
    const correctAnswer = decodeEntities(raw.correct_answer);

    const answers = shuffle([
        { text: correctAnswer, correct: true },
        ...incorrect.map((answer) => ({ text: decodeEntities(answer), correct: false }))
    ]);

    return {
        category: decodeEntities(raw.category),
        difficulty: String(raw.difficulty || 'unknown').toLowerCase(),
        question: decodeEntities(raw.question),
        answers
    };
}

/* =========================================================
   Game flow
   ========================================================= */

async function startGame() {
    if (state.isLoading) return;

    state.isLoading = true;
    state.gameId += 1;
    const gameId = state.gameId;

    stopSound();
    showScreen('screen-loading');

    try {
        const rawQuestions = await fetchQuestions();
        if (gameId !== state.gameId) return;

        state.questions = rawQuestions.slice(0, TOTAL_QUESTIONS).map(normalizeQuestion);
        state.index = 0;
        state.correct = 0;
        state.streak = 0;
        state.answered = false;
        state.resultsShown = false;

        renderQuestion();
        showScreen('screen-quiz');
        questionText.focus({ preventScroll: true });
    } catch (error) {
        if (gameId !== state.gameId) return;
        errorMessage.textContent = friendlyError(error);
        showScreen('screen-error');
    } finally {
        if (gameId === state.gameId) {
            state.isLoading = false;
        }
    }
}

function renderQuestion() {
    const question = state.questions[state.index];
    if (!question) return;

    state.answered = false;

    questionText.textContent = question.question;
    categoryBadge.textContent = question.category;
    difficultyBadge.textContent = capitalize(question.difficulty);
    difficultyBadge.dataset.difficulty = question.difficulty;

    feedback.textContent = '';
    feedback.className = 'feedback';

    nextBtn.hidden = true;
    nextBtn.querySelector('span').textContent =
        state.index === state.questions.length - 1 ? 'See results' : 'Next question';

    answersEl.replaceChildren();
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'answer';
        button.dataset.correct = String(answer.correct);
        button.style.setProperty('--i', String(index));
        button.setAttribute('aria-label', `${'ABCD'[index]}. ${answer.text}`);

        const key = document.createElement('span');
        key.className = 'answer-key';
        key.textContent = 'ABCD'[index];
        key.setAttribute('aria-hidden', 'true');

        const text = document.createElement('span');
        text.className = 'answer-text';
        text.textContent = answer.text;

        button.append(key, text);
        button.addEventListener('click', (event) => handleAnswer(button, answer, event));
        answersEl.append(button);
    });

    updateProgress();
    updateLiveScore();
    updateStreak();
}

function handleAnswer(button, answer, event) {
    if (state.answered) return;
    state.answered = true;

    const buttons = Array.from(answersEl.querySelectorAll('.answer'));
    const correctButton = buttons.find((item) => item.dataset.correct === 'true');

    buttons.forEach((item) => {
        item.disabled = true;
    });

    if (correctButton) {
        correctButton.classList.add('is-correct');
        correctButton.querySelector('.answer-key').textContent = '✓';
    }

    if (answer.correct) {
        state.correct += 1;
        state.streak += 1;
        feedback.textContent = state.streak >= 3
            ? `Correct! ${state.streak} in a row — you're on fire.`
            : 'Correct! Nice one.';
        feedback.classList.add('is-correct');
    } else {
        state.streak = 0;
        button.classList.add('is-wrong');
        button.querySelector('.answer-key').textContent = '×';

        buttons.forEach((item) => {
            if (item !== button && item !== correctButton) {
                item.classList.add('is-dimmed');
            }
        });

        const correctText = correctButton
            ? correctButton.querySelector('.answer-text').textContent
            : 'the highlighted option';
        feedback.textContent = `Not quite — the answer was “${correctText}”.`;
        feedback.classList.add('is-wrong');
    }

    updateLiveScore();
    updateStreak();
    updateProgress();

    nextBtn.hidden = false;

    // When the answer came from the keyboard, move focus straight to Next.
    if (event && event.detail === 0) {
        nextBtn.focus({ preventScroll: true });
    }
}

function nextQuestion() {
    if (!state.answered) return;

    if (state.index >= state.questions.length - 1) {
        showResults();
        return;
    }

    state.index += 1;
    renderQuestion();
    questionText.focus({ preventScroll: true });
}

function updateProgress() {
    const total = state.questions.length || TOTAL_QUESTIONS;
    const current = state.index + 1;
    const percent = Math.min(100, (current / total) * 100);

    progressBar.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(current));
    progressTrack.setAttribute('aria-valuemax', String(total));
    questionCounter.textContent = `Question ${current} of ${total}`;
}

function updateLiveScore() {
    liveScore.textContent = String(state.correct);
}

function updateStreak() {
    const hasStreak = state.streak >= 2;
    streakBadge.hidden = !hasStreak;
    streakCount.textContent = String(state.streak);
}

function getResultCopy(score, total) {
    return RESULT_COPY.find((item) => item.test(score, total)) || RESULT_COPY[RESULT_COPY.length - 1];
}

function showResults() {
    if (!state.questions.length) return;

    const total = state.questions.length;
    const correct = state.correct;
    const wrong = total - correct;
    const percent = Math.round((correct / total) * 100);
    const copy = getResultCopy(correct, total);

    scoreRing.style.setProperty('--score', String(percent));
    finalScore.textContent = String(correct);
    finalTotal.textContent = String(total);
    statCorrect.textContent = String(correct);
    statWrong.textContent = String(wrong);
    statAccuracy.textContent = `${percent}%`;
    resultTitle.textContent = copy.title;
    resultMessage.textContent = copy.message;

    if (!state.resultsShown) {
        state.resultsShown = true;
        state.history.push({ score: correct, total, date: Date.now() });
        state.history = state.history.slice(-HISTORY_LIMIT);
        saveHistory();
        updateWelcomeStats();
    }

    showScreen('screen-results');
    resultTitle.focus({ preventScroll: true });
    playResultSound(correct);

    if (percent >= 80) {
        launchConfetti();
    }
}

function goHome() {
    state.gameId += 1;
    state.isLoading = false;
    state.questions = [];
    state.index = 0;
    state.correct = 0;
    state.streak = 0;
    state.answered = false;
    state.resultsShown = false;
    closeStats();
    showScreen('screen-welcome');
    updateWelcomeStats();
}

/* =========================================================
   Welcome & stats
   ========================================================= */

function updateWelcomeStats() {
    if (!state.history.length) {
        welcomeBest.textContent = '—';
        welcomeGames.textContent = '0';
        return;
    }

    const best = state.history.reduce((top, game) => (
        game.score / game.total > top.score / top.total ? game : top
    ), state.history[0]);

    welcomeBest.textContent = `${best.score}/${best.total}`;
    welcomeGames.textContent = String(state.history.length);
}

function renderStats() {
    const history = state.history;

    if (!history.length) {
        statsBest.textContent = '—';
        statsAverage.textContent = '—';
        statsGames.textContent = '0';
    } else {
        const best = history.reduce((top, game) => (
            game.score / game.total > top.score / top.total ? game : top
        ), history[0]);
        const averagePercent = history.reduce(
            (sum, game) => sum + (game.score / game.total) * 100,
            0
        ) / history.length;

        statsBest.textContent = `${best.score}/${best.total}`;
        statsAverage.textContent = `${Math.round(averagePercent)}%`;
        statsGames.textContent = String(history.length);
    }

    clearStats.disabled = history.length === 0;
    renderChart();
}

function renderChart() {
    const recent = state.history.slice(-12);
    statsChart.replaceChildren();

    if (!recent.length) {
        statsChart.hidden = true;
        statsEmpty.hidden = false;
        statsChart.setAttribute('aria-label', 'No games have been played yet.');
        return;
    }

    statsChart.hidden = false;
    statsEmpty.hidden = true;

    const bestScore = Math.max(...recent.map((game) => game.score / game.total));
    const offset = state.history.length - recent.length;

    recent.forEach((game, index) => {
        const column = document.createElement('div');
        column.className = 'chart-col';
        column.style.setProperty('--i', String(index));

        const score = document.createElement('span');
        score.className = 'chart-score';
        score.textContent = String(game.score);

        const track = document.createElement('div');
        track.className = 'chart-track';

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        if (game.score / game.total === bestScore) {
            bar.classList.add('is-best');
        }
        bar.style.setProperty('--h', `${Math.max((game.score / game.total) * 100, 3)}%`);
        bar.title = `Game ${offset + index + 1}: ${game.score}/${game.total}`;
        track.append(bar);

        const label = document.createElement('span');
        label.className = 'chart-label';
        label.textContent = `#${offset + index + 1}`;

        column.append(score, track, label);
        statsChart.append(column);
    });

    const summary = recent
        .map((game, index) => `game ${offset + index + 1}: ${game.score} out of ${game.total}`)
        .join(', ');
    const gameWord = recent.length === 1 ? 'game' : 'games';
    statsChart.setAttribute('aria-label', `Scores for your last ${recent.length} ${gameWord}. ${summary}.`);
}

/* =========================================================
   Stats modal
   ========================================================= */

function openStats() {
    if (!statsModal.hidden) return;

    state.lastFocused = document.activeElement;
    renderStats();

    statsModal.hidden = false;
    document.body.classList.add('modal-open');
    statsClose.focus({ preventScroll: true });
}

function closeStats() {
    if (statsModal.hidden) return;

    statsModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetClearButton();

    if (state.lastFocused && state.lastFocused.isConnected && state.lastFocused.offsetParent !== null) {
        state.lastFocused.focus({ preventScroll: true });
    }
}

function resetClearButton() {
    state.clearArmed = false;
    window.clearTimeout(state.clearTimer);
    clearStats.textContent = 'Clear history';
    clearStats.classList.remove('is-danger');
}

function handleClearHistory() {
    if (!state.history.length) return;

    if (!state.clearArmed) {
        state.clearArmed = true;
        clearStats.textContent = 'Click again to confirm';
        clearStats.classList.add('is-danger');
        window.clearTimeout(state.clearTimer);
        state.clearTimer = window.setTimeout(resetClearButton, 3000);
        return;
    }

    state.history = [];
    saveHistory();
    renderStats();
    updateWelcomeStats();
    resetClearButton();
    showToast('Stats history cleared.');
}

/* =========================================================
   Confetti
   ========================================================= */

function launchConfetti() {
    if (!resultsCard || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const colors = ['#7c5cff', '#27d7f5', '#d7f75b', '#ff5c8a', '#ffd166'];

    for (let i = 0; i < 28; i += 1) {
        const piece = document.createElement('span');
        piece.className = 'confetti';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.setProperty('--x', `${(Math.random() - 0.5) * 180}px`);
        piece.style.setProperty('--r', `${Math.random() * 720}deg`);
        piece.style.animationDelay = `${Math.random() * 0.4}s`;

        resultsCard.append(piece);
        window.setTimeout(() => piece.remove(), 2800);
    }
}

/* =========================================================
   Events
   ========================================================= */

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextQuestion);

homeBtn.addEventListener('click', goHome);
errorHome.addEventListener('click', goHome);

brandHome.addEventListener('click', (event) => {
    event.preventDefault();
    goHome();
});

viewStats.addEventListener('click', openStats);
viewStatsWelcome.addEventListener('click', openStats);

statsClose.addEventListener('click', closeStats);

statsModal.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) {
        closeStats();
    }
});

clearStats.addEventListener('click', handleClearHistory);

statsModal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
        statsModal.querySelectorAll('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

soundToggle.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    saveSoundSetting();
    renderSoundButton();
    if (!state.soundOn) {
        stopSound();
    }
    showToast(state.soundOn ? 'Sound on' : 'Sound muted');
});

document.addEventListener('keydown', (event) => {
    if (!statsModal.hidden) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeStats();
        }
        return;
    }

    if (screenQuiz.hidden) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;

    if (!state.answered) {
        const keyMap = {
            '1': 0, '2': 1, '3': 2, '4': 3,
            a: 0, b: 1, c: 2, d: 3
        };
        const index = keyMap[event.key.toLowerCase()];

        if (typeof index === 'number') {
            const button = answersEl.children[index];
            if (button) {
                event.preventDefault();
                button.click();
            }
        }
    }

    if (event.key === 'Enter' && !nextBtn.hidden && !event.target.closest('button')) {
        event.preventDefault();
        nextBtn.click();
    }
});

/* =========================================================
   Init
   ========================================================= */

renderSoundButton();
updateWelcomeStats();
