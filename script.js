const timerText = document.getElementById("timer");
const clicksText = document.getElementById("clicks");
const cpsText = document.getElementById("cps");
const historyBody = document.getElementById("historyBody");
const timeInput = document.getElementById("timeInput");

let clicks = 0;
let totalTime = 10;
let timeLeft = 10;

let running = false;
let started = false;

let interval = null;
let historyCount = 0;

/*
  Prevent hold spam
*/
const heldKeys = new Set();

/*
  Prevent V+N same-frame doubles
*/
let lastAcceptedPress = 0;
const MERGE_WINDOW = 25;

function updateUI() {
  clicksText.textContent = clicks;
  timerText.textContent = timeLeft;

  let elapsed = totalTime - timeLeft;

  if (elapsed <= 0) {
    cpsText.textContent = "0.00";
  } else {
    cpsText.textContent = (clicks / elapsed).toFixed(2);
  }
}

function resetTest() {
  clearInterval(interval);

  totalTime = Math.max(1, parseInt(timeInput.value) || 1);

  clicks = 0;
  timeLeft = totalTime;

  running = true;
  started = false;

  heldKeys.clear();

  updateUI();
}

function startTimer() {
  started = true;

  interval = setInterval(() => {
    timeLeft--;

    updateUI();

    if (timeLeft <= 0) {
      finishTest();
    }
  }, 1000);
}

function finishTest() {
  clearInterval(interval);

  running = false;
  started = false;

  const finalCPS = (clicks / totalTime).toFixed(2);

  historyCount++;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${historyCount}</td>
    <td>${totalTime}s</td>
    <td>${clicks}</td>
    <td>${finalCPS}</td>
  `;

  historyBody.prepend(row);
}

resetTest();

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key !== "v" && key !== "n") return;
  if (!running) return;

  /*
    Prevent holding key
  */
  if (heldKeys.has(key)) return;

  heldKeys.add(key);

  /*
    Start on first click
  */
  if (!started) {
    startTimer();
  }

  const now = performance.now();

  /*
    If V and N are hit almost
    simultaneously, count once
  */
  if (now - lastAcceptedPress > MERGE_WINDOW) {
    clicks++;
    lastAcceptedPress = now;

    updateUI();
  }
});

document.addEventListener("keyup", (e) => {
  heldKeys.delete(e.key.toLowerCase());
});

/*
  SPACE = restart
*/
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !running) {
    resetTest();
  }
});

/*
  Live update timer amount
*/
timeInput.addEventListener("change", () => {
  resetTest();
});