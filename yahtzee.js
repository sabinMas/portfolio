let players = [];
let scores = [];
let currentPlayer = 0;
let round = 1;
let dice = [0, 0, 0, 0, 0];
let rollCount = 0;
const maxRounds = 13;
const categories = [
  "Aces",
  "Twos",
  "Threes",
  "Fours",
  "Fives",
  "Sixes",
  "Three of a Kind",
  "Four of a Kind",
  "Full House",
  "Small Straight",
  "Large Straight",
  "Yahtzee",
  "Chance",
];

function showAddPlayers() {
  document.querySelector(".menu").classList.remove("active");
  document.getElementById("add-players").classList.add("active");
  const playerNames = document.getElementById("player-names");
  playerNames.innerHTML = "";
  const num = parseInt(document.getElementById("numPlayers").value);
  if (!isNaN(num)) {
    for (let i = 0; i < num; i++) {
      const input = document.createElement("input");
      input.placeholder = `Player ${i + 1} name`;
      input.id = `player-${i}`;
      playerNames.appendChild(input);
    }
  }
}

function submitPlayers() {
  const num = parseInt(document.getElementById("numPlayers").value);
  players = [];
  scores = Array(num)
    .fill()
    .map(() => Array(13).fill(null));
  for (let i = 0; i < num; i++) {
    const name = document.getElementById(`player-${i}`).value;
    if (name.trim()) players.push(name);
  }
  if (players.length > 0) {
    backToMenu();
  }
}

function displayRules() {
  fetch("yahtzee_rules-1.txt")
    .then((response) => response.text())
    .then((text) => {
      document.querySelector(".menu").classList.remove("active");
      document.getElementById("rules").classList.add("active");
      document.getElementById("rules-text").textContent = text;
    });
}

function backToMenu() {
  document
    .querySelectorAll(".active")
    .forEach((el) => el.classList.remove("active"));
  document.querySelector(".menu").classList.add("active");
}

function startGame() {
  if (players.length === 0) {
    alert("Please add players first.");
    return;
  }
  document.querySelector(".menu").classList.remove("active");
  document.getElementById("game-area").classList.add("active");
  currentPlayer = 0;
  round = 1;
  startTurn();
}

function exitGame() {
  window.location.reload();
}

function startTurn() {
  rollCount = 0;
  updateRoundDisplay();
  document.getElementById(
    "players-turn"
  ).textContent = `${players[currentPlayer]}'s turn`;
  displayDice();
  displayScore();
}

function rollDice() {
  if (rollCount >= 3) return alert("No more rolls left!");
  for (let i = 0; i < dice.length; i++) {
    if (!dice[i] || rollCount === 0) {
      dice[i] = Math.floor(Math.random() * 6) + 1;
    }
  }
  rollCount++;
  displayDice();
}

function reRollDice() {
  if (rollCount >= 3) return alert("No more rolls left!");
  const keep = prompt(
    "Enter dice positions to keep (1-5) separated by spaces:"
  );
  if (!keep) return; // prevent empty input errors

  const keepIndices = keep.split(" ").map((n) => parseInt(n) - 1);
  for (let i = 0; i < dice.length; i++) {
    if (!keepIndices.includes(i)) {
      dice[i] = Math.floor(Math.random() * 6) + 1;
    }
  }
  rollCount++;
  displayDice();
}

function displayDice() {
  document.getElementById("dice-area").textContent = `Dice: ${dice.join(" ")}`;
}

function displayScore() {
  const playerScores = scores[currentPlayer];
  let html = `<h3>${players[currentPlayer]}'s Score</h3>`;
  categories.forEach((cat, i) => {
    html += `<div>${cat}: ${
      playerScores[i] !== null ? playerScores[i] : "Not scored"
    }</div>`;
  });
  document.getElementById("score-area").innerHTML = html;
}

function viewScore() {
  displayScore();
}

function viewCategories() {
  const playerScores = scores[currentPlayer];
  const available = categories.filter((_, i) => playerScores[i] === null);
  alert(`Available Categories:\n${available.join("\n")}`);
}

function selectCategory() {
  const available = categories
    .map((cat, i) =>
      scores[currentPlayer][i] === null ? `${i + 1}: ${cat}` : null
    )
    .filter(Boolean)
    .join("\n");
  const choice = prompt(`Choose a category:\n${available}`);
  const index = parseInt(choice) - 1;
  if (
    index >= 0 &&
    index < categories.length &&
    scores[currentPlayer][index] === null
  ) {
    scores[currentPlayer][index] = calculateScore(index);
    nextPlayer();
  } else {
    alert("Invalid choice or already scored.");
  }
}

function calculateScore(category) {
  const counts = Array(7).fill(0);
  dice.forEach((d) => counts[d]++);
  switch (category) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return dice.filter((d) => d === category + 1).reduce((a, b) => a + b, 0);
    case 6:
      return counts.some((c) => c >= 3) ? sumDice() : 0;
    case 7:
      return counts.some((c) => c >= 4) ? sumDice() : 0;
    case 8:
      return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case 9:
      return hasStraight(4) ? 30 : 0;
    case 10:
      return hasStraight(5) ? 40 : 0;
    case 11:
      return counts.includes(5) ? 50 : 0;
    case 12:
      return sumDice();
    default:
      return 0;
  }
}

function hasStraight(length) {
  const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
  let max = 1,
    curr = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      curr++;
      max = Math.max(max, curr);
    } else {
      curr = 1;
    }
  }
  return max >= length;
}

function sumDice() {
  return dice.reduce((a, b) => a + b, 0);
}

function updateRoundDisplay() {
  document.getElementById("round-display").textContent = `Round ${round}`;
}

function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
    round++;
    if (round > maxRounds) {
      endGame();
      return;
    }
  }
  startTurn();
}

function endGame() {
  let results = players.map((p, i) => ({
    name: p,
    score: scores[i].reduce((a, b) => a + (b || 0), 0),
  }));
  results.sort((a, b) => b.score - a.score);
  let resultText = "Game Over!\nFinal Scores:\n";
  results.forEach((res, i) => {
    resultText += `${i + 1}. ${res.name} - ${res.score}\n`;
  });
  alert(resultText);
  exitGame();
}
