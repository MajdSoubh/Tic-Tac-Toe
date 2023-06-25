const menu = document.getElementById("menu");
const result = document.getElementById("result");
const board = document.getElementById("board");
const cells = document.getElementsByClassName("cell");
let humanPlayer;
let computerPlayer;
let boardSize = 3;
let finished = false;
let numberOfCalls = 0;
const resultSentences = [
  "Programmed for victory.",
  "Machine: 1, Human: 0.",
  "Tic tac no.",
  "I told you it's impossible.",
  "Beaten by a bot.",
  "The computer has no mercy.",
  "Try hard next time.",
];
let grid = [];

Array.from(cells, (cell) => {
  cell.addEventListener("click", handleRound);
});

function initGrid() {
  grid = [];
  for (let j = 0; j < boardSize; j++) {
    const col = [];
    for (let i = 0; i < boardSize; i++) {
      col.push("-");
    }
    grid.push(col);
  }
}
function getAvailableMoves(state, player) {
  const res = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (state[r][c] == "-") {
        const nextMoveState = JSON.parse(JSON.stringify(state));
        nextMoveState[r][c] = player;
        res.push(nextMoveState);
      }
    }
  }
  return res;
}
function minmax(currentState, depth, isMaxPlayer, alpha, beta) {
  numberOfCalls++;
  const res = evaluate(currentState);
  if (res == "-") return 0;
  if (res == humanPlayer) return -200;
  if (res == computerPlayer) return 200;
  const nextMovePlayer = isMaxPlayer ? computerPlayer : humanPlayer;
  const nextMoves = getAvailableMoves(currentState, nextMovePlayer);

  let best = isMaxPlayer ? -9999 : 9999;

  for (let i = 0; i < nextMoves.length; i++) {
    const val = minmax(nextMoves[i], depth + 1, !isMaxPlayer, alpha, beta);
    if (isMaxPlayer) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
  }
  return best - depth;
}
function computerPlay(grid) {
  let best = -9999;
  let r = -1;
  let c = -1;
  numberOfCalls = 0;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (grid[i][j] == "-") {
        grid[i][j] = computerPlayer;
        const _grid = JSON.parse(JSON.stringify(grid));
        const result = minmax(_grid, 0, false, -999999, 999999);

        if (result > best) {
          best = result;
          r = i;
          c = j;
        }
        grid[i][j] = "-";
      }
    }
  }
  console.log("number of calculated states :", numberOfCalls);

  grid[r][c] = computerPlayer;
  const box = document.querySelector(`[data-cell-id="${r * boardSize + c}"]`);
  const computer = document.createElement("span");
  computer.className = computerPlayer + "-icon";
  box.appendChild(computer);
}
function printResult(res) {
  let message = "";
  if (res == humanPlayer) {
    message = "Human: 1, Machine: 0.";
  } else if (res == computerPlayer) {
    const randomIndex = Math.floor(Math.random() * resultSentences.length);
    message = resultSentences[randomIndex];
  } else if (res == "-") {
    message = "Draw Match !";
  } else {
    return;
  }

  setTimeout(() => {
    result.innerText = message;
    board.classList.toggle("show");
    result.classList.add("show");
    menu.classList.toggle("show");
    Array.from(cells, (cell) => {
      cell.lastChild ? cell.lastChild.remove() : null;
    });
  }, 1000);
}

function humanPlay(target) {
  const human = document.createElement("span");
  human.className = humanPlayer + "-icon";

  const row = Math.floor(target.dataset.cellId / boardSize);
  const col = target.dataset.cellId % boardSize;
  grid[row][col] = humanPlayer;
  target.appendChild(human);
}
function handleRound({ target }) {
  if (target.childElementCount > 0 || target.className != "cell" || finished)
    return;
  humanPlay(target);

  let result = evaluate(grid);
  if (result) {
    printResult(result);
    finished = true;
    return;
  }

  computerPlay(grid);

  result = evaluate(grid);
  if (result) {
    printResult(result);
    finished = true;
    return;
  }
}

function evaluate(grid) {
  let winner = false;
  /* Check rows */
  for (let i = 0; i < boardSize; i++) {
    winner = grid[i][0];
    for (let j = 1; j < boardSize; j++) {
      if (grid[i][j] != grid[i][j - 1] || grid[i][j] == "-") {
        winner = false;
        break;
      }
    }
    if (winner) return winner;
  }
  /* Check cols */
  for (let j = 0; j < boardSize; j++) {
    winner = grid[0][j];
    for (let i = 1; i < boardSize; i++) {
      if (grid[i][j] != grid[i - 1][j] || grid[i][j] == "-") {
        winner = false;
        break;
      }
    }
    if (winner) return winner;
  }
  /* Check left to right diagional*/
  winner = grid[0][0];
  for (let c = 1; c < boardSize; c++) {
    if (grid[c][c] != grid[c - 1][c - 1] || grid[c][c] == "-") {
      winner = false;
      break;
    }
  }
  if (winner) return winner;
  /* Check right to left diagional */
  winner = grid[0][boardSize - 1];
  for (let c = 1; c < boardSize; c++) {
    if (
      grid[c][boardSize - c - 1] != grid[c - 1][boardSize - c] ||
      grid[c][boardSize - c - 1] == "-"
    ) {
      winner = false;
      break;
    }
  }
  if (winner) return winner;

  /* Check draw */
  winner = "-";
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (grid[i][j] == "-") {
        winner = false;
        break;
      }
    }
  }
  return winner;
}
/* Initiate the players and grid  */
function start(humanShape, computerShape) {
  humanPlayer = humanShape;
  computerPlayer = computerShape;
  finished = false;
  initGrid();
  menu.classList.toggle("show");
  board.classList.toggle("show");
}
