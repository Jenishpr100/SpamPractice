const timerText = document.getElementById("timer");
const clicksText = document.getElementById("clicks");
const cpsText = document.getElementById("cps");
const historyBody = document.getElementById("historyBody");
const timeInput = document.getElementById("timeInput");
const startBtn = document.getElementById("startBtn");

let clicks = 0;
let totalTime = 10;
let timeLeft = 10;

let running = false;
let started = false;

let interval = null;
let historyCount = 0;

const heldKeys = new Set();

let lastAcceptedPress = 0;
const MERGE_WINDOW = 25;

/*
  First 2 unique keys
*/
let spamKeys = [];

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

  running = false;
  started = false;

  spamKeys = [];
  heldKeys.clear();
  lastAcceptedPress = 0;

  updateUI();
}

function startTest() {
  if (running) return;

  running = true;
  started = false;
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

/*
  Start button
*/
startBtn.addEventListener("click", () => {
  resetTest();
  startTest();
});

/*
  Keyboard input
*/
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (!running) return;
  if (heldKeys.has(key)) return;

  /*
    Pick first 2 keys
  */
  if (!spamKeys.includes(key) && spamKeys.length < 2) {
    spamKeys.push(key);
    console.log("Spam keys:", spamKeys);
  }

  /*
    Only selected keys work
  */
  if (!spamKeys.includes(key)) return;

  heldKeys.add(key);

  if (!started) {
    startTimer();
  }

  const now = performance.now();

  /*
    Merge same-frame presses
  */
  if (now - lastAcceptedPress > MERGE_WINDOW) {
    clicks++;
    lastAcceptedPress = now;
    updateUI();
  }
});

/*
  Release held key
*/
document.addEventListener("keyup", (e) => {
  heldKeys.delete(e.key.toLowerCase());
});

/*
  Space = restart after finish
*/
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !running) {
    resetTest();
    startTest();
  }
});

/*
  Change time
*/
timeInput.addEventListener("change", () => {
  resetTest();
});
