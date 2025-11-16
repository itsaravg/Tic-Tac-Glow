const board = document.getElementById("board");
const restartBtn = document.getElementById("restart");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const closePopup = document.getElementById("close-popup");
const difficultySelect = document.getElementById("difficulty");

let cells = [];
let boardState = Array(9).fill(null);
let gameOver = false;

let playerSymbol = "X";
let aiSymbol = "O";
let currentTurn = "X";

let wins = 0, losses = 0, draws = 0;

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard() {
  board.innerHTML = "";
  boardState = Array(9).fill(null);
  cells = [];
  gameOver = false;

  // Randomly assign who is X or O
  if (Math.random() < 0.5) {
    playerSymbol = "X";
    aiSymbol = "O";
  } else {
    playerSymbol = "O";
    aiSymbol = "X";
  }

  currentTurn = "X";

  // Display player info above board
  let infoBar = document.getElementById("player-info");
  if (!infoBar) {
    infoBar = document.createElement("div");
    infoBar.id = "player-info";
    infoBar.style.marginBottom = "10px";
    infoBar.style.fontSize = "1.1rem";
    infoBar.style.textShadow = "0 0 8px #ffe600";
    board.parentNode.insertBefore(infoBar, board);
  }
  infoBar.innerHTML = `You are <strong style="color:${playerSymbol === "X" ? "#ff004c" : "#ffe600"};">${playerSymbol}</strong>`;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => handleMove(i));
    board.appendChild(cell);
    cells.push(cell);
  }

  // If AI is X, let it start
  if (aiSymbol === "X") {
    aiTurn();
  }
}

function handleMove(index) {
  if (gameOver || boardState[index] !== null) return;

  if (currentTurn === playerSymbol) {
    boardState[index] = playerSymbol;
    renderMove(index, playerSymbol);
    checkWinner();
    if (!gameOver) {
      currentTurn = aiSymbol;
      setTimeout(aiTurn, 500);
    }
  }
}

function aiTurn() {
  if (gameOver) return;

  let move;
  const diff = difficultySelect.value;
  if (diff === "easy") move = easyMove();
  else if (diff === "medium") move = mediumMove();
  else move = minimaxMove();

  if (move != null) {
    boardState[move] = aiSymbol;
    renderMove(move, aiSymbol);
  }

  checkWinner();
  if (!gameOver) currentTurn = playerSymbol;
}

function renderMove(index, symbol) {
  cells[index].textContent = symbol;
  cells[index].classList.add(symbol);
}

function easyMove() {
  const empty = boardState.map((v, i) => v === null ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove() {
  const winMove = findBestMove(aiSymbol);
  if (winMove != null) return winMove;
  if (Math.random() < 0.6) {
    const blockMove = findBestMove(playerSymbol);
    if (blockMove != null) return blockMove;
  }
  return easyMove();
}

function minimaxMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === null) {
      boardState[i] = aiSymbol;
      let score = minimax(boardState, 0, false);
      boardState[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  const winner = checkWin(state);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === playerSymbol) return depth - 10;
  if (state.every(v => v !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === null) {
        state[i] = aiSymbol;
        best = Math.max(best, minimax(state, depth + 1, false));
        state[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === null) {
        state[i] = playerSymbol;
        best = Math.min(best, minimax(state, depth + 1, true));
        state[i] = null;
      }
    }
    return best;
  }
}

function findBestMove(player) {
  for (const [a, b, c] of winningCombos) {
    if (boardState[a] === player && boardState[b] === player && boardState[c] === null) return c;
    if (boardState[a] === player && boardState[c] === player && boardState[b] === null) return b;
    if (boardState[b] === player && boardState[c] === player && boardState[a] === null) return a;
  }
  return null;
}

function checkWin(state) {
  for (const [a,b,c] of winningCombos) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) return state[a];
  }
  return null;
}

function checkWinner() {
  const winner = checkWin(boardState);
  if (winner) {
    gameOver = true;
    if (winner === playerSymbol) {
      wins++;
      showPopup("You Win! 🎉");
    } else {
      losses++;
      showPopup("You Lose 😢");
    }
    updateScoreboard();
    return;
  }

  if (boardState.every(v => v !== null)) {
    gameOver = true;
    draws++;
    showPopup("It’s a Draw 🤝");
    updateScoreboard();
  }
}

function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
}

function updateScoreboard() {
  document.getElementById("wins").textContent = wins;
  document.getElementById("losses").textContent = losses;
  document.getElementById("draws").textContent = draws;
}

restartBtn.addEventListener("click", createBoard);
closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
  createBoard();
});

createBoard();
