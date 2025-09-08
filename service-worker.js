const CACHE_NAME = 'tetris-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Save game state to localStorage
function saveGameState() {
    const gameState = {
        board,
        currentPiece,
        score,
        level
    };
    localStorage.setItem('tetrisGameState', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('tetrisGameState');
    if (savedState) {
        const { board: savedBoard, currentPiece: savedPiece, score: savedScore, level: savedLevel } = JSON.parse(savedState);
        board = savedBoard;
        currentPiece = savedPiece;
        score = savedScore;
        level = savedLevel;
    }
}

// Call saveGameState periodically
setInterval(saveGameState, 5000);

// Load game state on start
loadGameState();
