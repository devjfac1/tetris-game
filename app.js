document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');

    canvas.width = 300;
    canvas.height = 600;

    // Game variables
    const rows = 20;
    const cols = 10;
    const blockSize = canvas.width / cols;

    // Initialize game board
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Tetris pieces and their rotations
    const pieces = [
        { shape: [[1, 1, 1, 1]], color: 'cyan' }, // I piece
        { shape: [[1, 1], [1, 1]], color: 'yellow' }, // O piece
        { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T piece
        { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' }, // J piece
        { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' }, // L piece
        { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // S piece
        { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' } // Z piece
    ];

    let currentPiece = null;
    let currentPosition = { x: 0, y: 0 };
    let score = 0;
    let level = 1;
    let gameStarted = false; // Variable para controlar el estado del juego

    function generatePiece() {
        const randomIndex = Math.floor(Math.random() * pieces.length);
        currentPiece = { ...pieces[randomIndex], x: Math.floor(cols / 2) - 1, y: 0 };
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (board[row][col]) {
                    ctx.fillStyle = 'cyan';
                    ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
                }
            }
        }
    }

    function drawPiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    ctx.fillStyle = currentPiece.color;
                    ctx.fillRect((currentPiece.x + x) * blockSize, (currentPiece.y + y) * blockSize, blockSize, blockSize);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect((currentPiece.x + x) * blockSize, (currentPiece.y + y) * blockSize, blockSize, blockSize);
                }
            });
        });
    }

    function movePiece(dx, dy) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        if (checkCollision()) {
            currentPiece.x -= dx;
            currentPiece.y -= dy;
        }
    }

    function rotatePiece() {
        const rotatedShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
        const originalShape = currentPiece.shape;
        currentPiece.shape = rotatedShape;
        if (checkCollision()) {
            currentPiece.shape = originalShape;
        }
    }

    function checkCollision() {
        return currentPiece.shape.some((row, y) => {
            return row.some((cell, x) => {
                if (cell) {
                    const newX = currentPiece.x + x;
                    const newY = currentPiece.y + y;
                    return (
                        newX < 0 ||
                        newX >= cols ||
                        newY >= rows ||
                        (newY >= 0 && board[newY][newX])
                    );
                }
                return false;
            });
        });
    }

    function placePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newX = currentPiece.x + x;
                    const newY = currentPiece.y + y;
                    if (newY >= 0) {
                        board[newY][newX] = currentPiece.color;
                    }
                }
            });
        });
        clearLines();
        generatePiece();
        if (checkCollision()) {
            alert('Game Over!');
            resetGame();
        }
    }

    function clearLines() {
        let linesCleared = 0;
        for (let row = rows - 1; row >= 0; row--) {
            if (board[row].every(cell => cell)) {
                board.splice(row, 1);
                board.unshift(Array(cols).fill(0));
                linesCleared++;
            }
        }
        score += linesCleared * 10;
        if (linesCleared > 0 && score >= level * 100) {
            level++;
        }
    }

    function resetGame() {
        board.forEach(row => row.fill(0));
        score = 0;
        level = 1;
        generatePiece();
    }

    // Update game loop
    function gameLoop() {
        drawBoard();
        drawPiece();
        requestAnimationFrame(gameLoop);
    }

    // Initialize game
    resetGame();
    generatePiece();

    // Keyboard controls
    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'a': // Move left
                movePiece(-1, 0);
                break;
            case 'd': // Move right
                movePiece(1, 0);
                break;
            case 's': // Rotate
                rotatePiece();
                break;
            case 'f': // Soft drop
                movePiece(0, 1);
                break;
            case ' ': // Hard drop
                let moved = false;
                while (!checkCollision()) {
                    movePiece(0, 1);
                    moved = true;
                }
                if (moved) {
                    movePiece(0, -1);
                }
                placePiece();
                break;
        }
    });

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    canvas.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                movePiece(1, 0); // Move right
            } else {
                movePiece(-1, 0); // Move left
            }
        } else {
            if (deltaY > 0) {
                movePiece(0, 1); // Soft drop
            } else {
                rotatePiece(); // Rotate
            }
        }

        // Long press for hard drop
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            while (!checkCollision()) {
                movePiece(0, 1);
            }
            movePiece(0, -1);
            placePiece();
        }
    });

    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            gameLoop();
        }
    }

    function showTutorial() {
        const tutorialSteps = [
            'Bienvenido a Tetris. Usa las teclas A y D para mover las piezas a la izquierda y derecha.',
            'Presiona S para rotar las piezas y F para hacerlas descender rápidamente.',
            'Presiona ESPACIO para una caída instantánea.',
            'En dispositivos táctiles, desliza horizontalmente para mover, hacia abajo para descender y toca para rotar.',
            '¡Buena suerte y diviértete jugando Tetris!'
        ];

        let currentStep = 0;
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.id = 'tutorial-overlay';
        tutorialOverlay.style.position = 'absolute';
        tutorialOverlay.style.top = '0';
        tutorialOverlay.style.left = '0';
        tutorialOverlay.style.width = '100%';
        tutorialOverlay.style.height = '100%';
        tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tutorialOverlay.style.color = 'white';
        tutorialOverlay.style.display = 'flex';
        tutorialOverlay.style.justifyContent = 'center';
        tutorialOverlay.style.alignItems = 'center';
        tutorialOverlay.style.flexDirection = 'column';
        tutorialOverlay.style.zIndex = '1000';

        const tutorialText = document.createElement('p');
        tutorialText.textContent = tutorialSteps[currentStep];
        tutorialOverlay.appendChild(tutorialText);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.style.marginTop = '20px';
        nextButton.addEventListener('click', () => {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                tutorialText.textContent = tutorialSteps[currentStep];
            } else {
                document.body.removeChild(tutorialOverlay);
                startGame(); // Iniciar el juego después del tutorial
            }
        });
        tutorialOverlay.appendChild(nextButton);

        document.body.appendChild(tutorialOverlay);
    }

    // Call the tutorial on game start
    showTutorial();
});
