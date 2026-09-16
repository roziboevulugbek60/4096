// ===============================
// 2048 GAME
// Ishlab chiqaruvchi: ULUG'BEK.R
// ===============================

const boardSize = 4;

let board = [];
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let playerName = localStorage.getItem("playerName") || "";

let touchStartX = 0;
let touchStartY = 0;


// ELEMENTLAR

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const playerInput = document.getElementById("playerName");
const playerDisplay = document.getElementById("playerDisplay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const changePlayerBtn = document.getElementById("changePlayerBtn");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");

const tilesContainer = document.getElementById("tiles");
const gameBoard = document.getElementById("gameBoard");

const gameMessage = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

const themeBtn = document.getElementById("themeBtn");


// ===============================
// THEME
// ===============================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode = document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        darkMode ? "dark" : "light"
    );

    themeBtn.textContent = darkMode ? "☀️" : "🌙";
});


// ===============================
// START
// ===============================

if (playerName) {
    playerInput.value = playerName;
}

startBtn.addEventListener("click", startGame);

playerInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        startGame();
    }

});


function startGame() {

    let name = playerInput.value.trim();

    if (!name) {
        playerInput.focus();

        playerInput.style.borderColor = "#ef4444";

        setTimeout(() => {
            playerInput.style.borderColor = "transparent";
        }, 1000);

        return;
    }

    playerName = name;

    localStorage.setItem(
        "playerName",
        playerName
    );

    playerDisplay.textContent = playerName;

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    newGame();
}


// ===============================
// NEW GAME
// ===============================

function newGame() {

    board = createEmptyBoard();

    score = 0;

    hideMessage();

    addRandomTile();
    addRandomTile();

    updateScore();
    renderBoard();

}


// ===============================
// EMPTY BOARD
// ===============================

function createEmptyBoard() {

    return Array.from(
        { length: boardSize },
        () => Array(boardSize).fill(0)
    );

}


// ===============================
// RANDOM TILE
// ===============================

function addRandomTile() {

    const emptyCells = [];

    for (let row = 0; row < boardSize; row++) {

        for (let col = 0; col < boardSize; col++) {

            if (board[row][col] === 0) {

                emptyCells.push({
                    row,
                    col
                });

            }

        }

    }

    if (emptyCells.length === 0) {
        return;
    }

    const random =
        emptyCells[
            Math.floor(
                Math.random() * emptyCells.length
            )
        ];

    board[random.row][random.col] =
        Math.random() < 0.9 ? 2 : 4;
}


// ===============================
// RENDER
// ===============================

function renderBoard() {

    tilesContainer.innerHTML = "";

    const boardRect =
        tilesContainer.getBoundingClientRect();

    const gap = boardRect.width * 0.025;

    const tileSize =
        (boardRect.width - gap * 3) / 4;

    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 4; col++) {

            const value = board[row][col];

            if (value !== 0) {

                const tile =
                    document.createElement("div");

                tile.className =
                    `tile tile-${value}`;

                tile.textContent = value;

                tile.style.left =
                    `${col * (tileSize + gap)}px`;

                tile.style.top =
                    `${row * (tileSize + gap)}px`;

                tilesContainer.appendChild(tile);

            }

        }

    }

}


// ===============================
// MOVE
// ===============================

function move(direction) {

    let moved = false;

    const oldBoard =
        JSON.stringify(board);

    if (direction === "left") {
        board = moveLeft(board);
    }

    if (direction === "right") {
        board = reverseRows(
            moveLeft(
                reverseRows(board)
            )
        );
    }

    if (direction === "up") {
        board = transpose(
            moveLeft(
                transpose(board)
            )
        );
    }

    if (direction === "down") {
        board = transpose(
            reverseRows(
                moveLeft(
                    reverseRows(
                        transpose(board)
                    )
                )
            )
        );
    }

    moved =
        oldBoard !== JSON.stringify(board);

    if (moved) {

        addRandomTile();

        updateScore();
        renderBoard();

        if (hasWon()) {
            showMessage(
                "🎉 2048!",
                `${playerName}, siz 2048 raqamiga yetdingiz!`
            );
            return;
        }

        if (!canMove()) {

            showMessage(
                "😢 Game Over",
                `${playerName}, yurishlar tugadi!`
            );

        }

    }

}


// ===============================
// MOVE LEFT
// ===============================

function moveLeft(currentBoard) {

    return currentBoard.map(row => {

        const numbers =
            row.filter(value => value !== 0);

        const result = [];

        for (let i = 0; i < numbers.length; i++) {

            if (
                numbers[i] === numbers[i + 1]
            ) {

                const merged =
                    numbers[i] * 2;

                result.push(merged);

                score += merged;

                i++;

            } else {

                result.push(numbers[i]);

            }

        }

        while (result.length < 4) {
            result.push(0);
        }

        return result;

    });

}


// ===============================
// REVERSE
// ===============================

function reverseRows(matrix) {

    return matrix.map(row =>
        [...row].reverse()
    );

}


// ===============================
// TRANSPOSE
// ===============================

function transpose(matrix) {

    return matrix[0].map(
        (_, column) =>
            matrix.map(
                row => row[column]
            )
    );

}


// ===============================
// CAN MOVE
// ===============================

function canMove() {

    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 4; col++) {

            if (board[row][col] === 0) {
                return true;
            }

            if (
                col < 3 &&
                board[row][col] ===
                board[row][col + 1]
            ) {
                return true;
            }

            if (
                row < 3 &&
                board[row][col] ===
                board[row + 1][col]
            ) {
                return true;
            }

        }

    }

    return false;
}


// ===============================
// WIN
// ===============================

function hasWon() {

    for (const row of board) {

        if (row.includes(2048)) {
            return true;
        }

    }

    return false;
}


// ===============================
// SCORE
// ===============================

function updateScore() {

    scoreElement.textContent =
        score.toLocaleString();

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );

    }

    bestScoreElement.textContent =
        bestScore.toLocaleString();

}


// ===============================
// KEYBOARD
// ===============================

document.addEventListener(
    "keydown",
    (event) => {

        if (gameScreen.classList.contains("hidden")) {
            return;
        }

        const keys = {

            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowUp: "up",
            ArrowDown: "down",

            a: "left",
            d: "right",
            w: "up",
            s: "down"

        };

        const direction =
            keys[event.key];

        if (direction) {

            event.preventDefault();

            move(direction);

        }

    }
);


// ===============================
// MOBILE SWIPE
// ===============================

gameBoard.addEventListener(
    "touchstart",
    (event) => {

        const touch =
            event.changedTouches[0];

        touchStartX = touch.screenX;
        touchStartY = touch.screenY;

    },
    { passive: true }
);


gameBoard.addEventListener(
    "touchend",
    (event) => {

        const touch =
            event.changedTouches[0];

        const deltaX =
            touch.screenX - touchStartX;

        const deltaY =
            touch.screenY - touchStartY;

        const minSwipe = 30;

        if (
            Math.abs(deltaX) < minSwipe &&
            Math.abs(deltaY) < minSwipe
        ) {
            return;
        }

        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {

            if (deltaX > 0) {
                move("right");
            } else {
                move("left");
            }

        } else {

            if (deltaY > 0) {
                move("down");
            } else {
                move("up");
            }

        }

    },
    { passive: true }
);


// ===============================
// RESTART
// ===============================

restartBtn.addEventListener(
    "click",
    () => {

        if (
            confirm(
                "O'yinni qaytadan boshlaysizmi?"
            )
        ) {

            newGame();

        }

    }
);


tryAgainBtn.addEventListener(
    "click",
    newGame
);


// ===============================
// CHANGE PLAYER
// ===============================

changePlayerBtn.addEventListener(
    "click",
    () => {

        gameScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");

        playerInput.value =
            playerName;

        playerInput.focus();

    }
);


// ===============================
// MESSAGE
// ===============================

function showMessage(title, text) {

    messageTitle.textContent = title;
    messageText.textContent = text;

    gameMessage.classList.remove("hidden");

}


function hideMessage() {

    gameMessage.classList.add("hidden");

}


// ===============================
// RES