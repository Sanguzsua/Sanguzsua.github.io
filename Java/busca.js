const boardSize = 10;
const mineCount = 10;
let board = [];
let minePositions = [];

// Initialize the game board
function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    board = [];
    minePositions = [];

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', revealCell);
            cell.addEventListener('contextmenu', flagCell);
            gameBoard.appendChild(cell);
            board[i][j] = { revealed: false, flagged: false, mine: false, element: cell };
        }
    }

    placeMines();
}

// Place mines randomly on the board
function placeMines() {
    let placedMines = 0;
    while (placedMines < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            minePositions.push({ row, col });
            placedMines++;
        }
    }
}

// Reveal a cell
function revealCell(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (board[row][col].flagged || board[row][col].revealed) return;

    if (board[row][col].mine) {
        gameOver();
        return;
    }

    revealCells(row, col);
}

// Reveal adjacent cells
function revealCells(row, col) {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return;
    if (board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;
    board[row][col].element.classList.add('revealed');

    const mineCount = countAdjacentMines(row, col);
    if (mineCount > 0) {
        board[row][col].element.textContent = mineCount;
    } else {
        revealCells(row - 1, col - 1);
        revealCells(row - 1, col);
        revealCells(row - 1, col + 1);
        revealCells(row, col - 1);
        revealCells(row, col + 1);
        revealCells(row + 1, col - 1);
        revealCells(row + 1, col);
        revealCells(row + 1, col + 1);
    }
}

// Count adjacent mines
function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c].mine) {
                count++;
            }
        }
    }
    return count;
}

// Flag or unflag a cell
function flagCell(e) {
    e.preventDefault();
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (board[row][col].revealed) return;

    board[row][col].flagged = !board[row][col].flagged;
    board[row][col].element.classList.toggle('flagged');
}

// Handle game over
function gameOver() {
    minePositions.forEach(pos => {
        const cell = board[pos.row][pos.col].element;
        cell.classList.add('mine');
    });
}

// Initialize the game when the page loads
window.onload = initGame;