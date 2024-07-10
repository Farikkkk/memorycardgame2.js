import { confetti } from "./confetti.js";
import { canvas } from "./canvas.js";

document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.querySelector(".reset-button");
  const game = document.querySelector(".game");
  const resultInfo = document.querySelector(".result");
  const timerEl = document.querySelector("#time");
  const buttonsDiv = document.querySelector(".buttons");
  const container = document.querySelector(".container");
  const timerContainer = document.querySelector(".timer");
  const diffucultyDiv = document.querySelector(".difficulty-info");
  const stepsInGame = document.getElementById("steps");
  const divSteps = document.querySelector(".steps");
  const inputEl = document.querySelector("input");
  const startGameBtn = document.querySelector(".play-button");
  const gameName = document.querySelector("h1");
  const firstInfoDiv = document.querySelector(".name-info");

  let shuffleEmojis;
  let timer;
  let time = 0;
  let timerStarted = false;
  let numberOfCards = ["12", "16", "24"];
  let steps = 0;

  const localStorageKeys = {
    12: "memoryGameBestResult12",
    16: "memoryGameBestResult16",
    24: "memoryGameBestResult24",
  };

  let bestResult = {
    12: JSON.parse(localStorage.getItem(localStorageKeys["12"])) || {
      time: "Infinity",
      steps: "Infinity",
      username: "No record found",
    },

    16: JSON.parse(localStorage.getItem(localStorageKeys["16"])) || {
      time: "Infinity",
      steps: "Infinity",
      username: "No record found",
    },

    24: JSON.parse(localStorage.getItem(localStorageKeys["24"])) || {
      time: "Infinity",
      steps: "Infinity",
      username: "No record found",
    },
  };

  updateBestResultDisplay();

  const serverUrl = "https://memory-card-game-bc82cd0751f3.herokuapp.com";

  async function fetchBestResults() {
    try {
      const response = await fetch(`${serverUrl}/results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      bestResult = data;
      updateBestResultDisplay();
    } catch (error) {
      console.error("Error fetching best results:", error);
    }
  }

  async function saveBestResultToServer(timeResult, stepsResult, level) {
    const response = await fetch(`${serverUrl}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        time: timeResult,
        steps: stepsResult,
        username: inputEl.value,
      }),
    });
    const message = await response.text();
    console.log(message);
  }

  function updateBestResultDisplay() {
    Object.keys(bestResult).forEach((level) => {
      const result = bestResult[level];
      const element = document.querySelector(`[data-best-result="${level}"]`);
      if (element) {
        if (
          result.username === "No record found" ||
          result.time === "Infinity" ||
          result.steps === "Infinity"
        ) {
          element.innerHTML = "No record found";
        } else {
          element.innerHTML = `<br>  Name: ${
            result.username
          } <br> Time: (${formatTime(result.time)})<br> Steps: (${
            result.steps
          })`;
        }
      } else {
        console.error(`Element with data-best-result="${level}" not found.`);
      }
    });
  }

  function saveBestResult(timeResult, stepsResult, level) {
    bestResult[level].time = timeResult;
    bestResult[level].steps = stepsResult;
    bestResult[level].inputEl = inputEl.value;
    localStorage.setItem(
      localStorageKeys[level],
      JSON.stringify(bestResult[level])
    );
    saveBestResultToServer(timeResult, stepsResult, level);
    updateBestResultDisplay();
  }

  fetchBestResults();

  timerContainer.style.display = "none";
  resetBtn.style.display = "none";
  divSteps.style.display = "none";
  container.style.display = "none";
  inputEl.style.display = "block";
  gameName.style.display = "block";

  startGameBtn.addEventListener("click", () => {
    if (!inputEl.value) {
      alert("Please enter your name");
      return;
    }

    startGame();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (!inputEl.value) {
        alert("Please enter your name");
        return;
      } else {
        startGame();
      }
    }
  });

  function startGame() {
    inputEl.style.display = "none";
    startGameBtn.style.display = "none";
    game.style.display = "none";
    gameName.style.display = "none";
    buttonsDiv.style.display = "block";
    timerContainer.style.display = "none";
    resetBtn.style.display = "none";
    divSteps.style.display = "none";
    container.style.display = "flex";
    createBoard();
  }

  const emojis = [
    "😍",
    "❤️",
    "🌍",
    "🥑",
    "💰",
    "🎱",
    "🐒",
    "🍺",
    "💩",
    "👄",
    "🎄",
    "🏖️",
  ];

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function startTimer() {
    time = 0;
    updateTimerDisplay();
    timer = setInterval(() => {
      time++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerEl.innerHTML = `${minutes < 10 ? "0" : ""} ${minutes} : ${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }

  function createBoard() {
    game.innerHTML = "";
    resultInfo.innerHTML = "";
    timerStarted = false;
    shuffleEmojis = shuffleArray(
      emojis
        .slice(0, numberOfCards / 2)
        .concat(emojis.slice(0, numberOfCards / 2))
    );

    for (let i = 0; i < numberOfCards; i++) {
      let box = document.createElement("div");
      box.className = "item";
      box.innerHTML = shuffleEmojis[i];

      box.addEventListener("click", function () {
        if (
          !this.classList.contains("boxOpen") &&
          !this.classList.contains("boxMatch")
        ) {
          steps++;
          stepsInGame.innerHTML = `Steps : ${steps}`;
        }

        if (!timerStarted) {
          startTimer();
          timerStarted = true;
        }
        if (
          this.classList.contains("boxOpen") ||
          this.classList.contains("boxMatch")
        ) {
          return;
        }
        this.classList.add("boxOpen");

        let openBoxes = document.querySelectorAll(".boxOpen:not(.boxMatch)");

        if (openBoxes.length > 1) {
          setTimeout(() => {
            if (openBoxes[0].innerHTML === openBoxes[1].innerHTML) {
              openBoxes[0].classList.add("boxMatch");
              openBoxes[1].classList.add("boxMatch");
            }
            openBoxes[0].classList.remove("boxOpen");
            openBoxes[1].classList.remove("boxOpen");

            if (
              document.querySelectorAll(".boxMatch").length === numberOfCards
            ) {
              setTimeout(() => {
                resultInfo.innerHTML += `Congratulations! You won! 🥳`;
                document.querySelector(".result").innerHTML += confetti;
                stopTimer();

                if (
                  time < bestResult[numberOfCards].time ||
                  (time === bestResult[numberOfCards].time &&
                    steps < bestResult[numberOfCards].steps)
                ) {
                  resultInfo.innerHTML = "Cool!!! It is a new record 😎";
                  document.querySelector(".result").innerHTML += confetti;
                  saveBestResult(time, steps, numberOfCards);
                }
              }, 100);
            }
          }, 500);
        }
      });
      game.appendChild(box);
    }
  }

  document.querySelectorAll(".card-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      numberOfCards = parseInt(e.target.dataset.cards);
      buttonsDiv.style.display = "none";
      diffucultyDiv.style.display = "none";
      timerContainer.style.display = "block";
      resetBtn.style.display = "block";
      game.style.display = "flex";
      divSteps.style.display = "block";
      container.style.display = "flex";
      startGameBtn.disabled = false;

      createBoard();
    });
  });

  resetBtn.addEventListener("click", () => {
    steps = 0;
    stepsInGame.innerHTML = "";
    timerEl.innerHTML = "00 : 00";
    firstInfoDiv.style.display = "none";
    buttonsDiv.style.display = "block";
    diffucultyDiv.style.display = "block";
    timerContainer.style.display = "none";
    resetBtn.style.display = "none";
    resultInfo.innerHTML = "";
    game.style.display = "none";
    divSteps.style.display = "none";
    container.style.display = "flex";
    createBoard();
    stopTimer();
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")} : ${secs
      .toString()
      .padStart(2, "0")}`;
  }
});
