// These variables connect the JavaScript to the game and score elements.
var gameCanvas = document.getElementById("game-canvas");
var gameContext = gameCanvas.getContext("2d");
var scoreDisplay = document.getElementById("score");
var gameMessage = document.getElementById("game-message");
var messageHeading = document.getElementById("message-heading");
var messageText = document.getElementById("message-text");
var startButton = document.getElementById("start-button");
var restartButton = document.getElementById("restart-button");
var scoreForm = document.getElementById("score-form");
var playerNameInput = document.getElementById("player-name");
var nameError = document.getElementById("name-error");
var highScoreList = document.getElementById("high-score-list");

// These variables keep track of the snake, food, score, and current game state.
var gridSize = 20;
var snakeBody = [];
var foodPosition = { x: 0, y: 0 };
var movementDirection = { x: 1, y: 0 };
var nextDirection = { x: 1, y: 0 };
var currentScore = 0;
var gameState = "start";
var highScores = loadHighScores();

// This function reads saved scores and reports broken saved data in the console.
function loadHighScores() {
    var savedScores = localStorage.getItem("southAfricanSnakeHighScores");
    var parsedScores = [];

    if (savedScores === null) {
        return parsedScores;
    }

    try {
        parsedScores = JSON.parse(savedScores);
        if (!Array.isArray(parsedScores)) {
            console.error("Saved high scores were not a list. Starting with an empty list.");
            return [];
        }
    } catch (error) {
        console.error("The saved high scores could not be read.", error);
        return [];
    }

    return parsedScores;
}

// This function draws the snake and food on the canvas.
function drawGame() {
    var bodyPartIndex;

    gameContext.fillStyle = "#102b24";
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameContext.fillStyle = "#ffb81c";
    gameContext.fillRect(foodPosition.x, foodPosition.y, gridSize, gridSize);

    gameContext.fillStyle = "#35c46a";
    for (bodyPartIndex = 0; bodyPartIndex < snakeBody.length; bodyPartIndex = bodyPartIndex + 1) {
        gameContext.fillRect(snakeBody[bodyPartIndex].x, snakeBody[bodyPartIndex].y, gridSize, gridSize);
    }
}

// This function places food in a random grid cell that is not inside the snake.
function placeFood() {
    var foodIsOnSnake = true;
    var bodyPartIndex;

    while (foodIsOnSnake) {
        foodPosition.x = Math.floor(Math.random() * (gameCanvas.width / gridSize)) * gridSize;
        foodPosition.y = Math.floor(Math.random() * (gameCanvas.height / gridSize)) * gridSize;
        foodIsOnSnake = false;

        for (bodyPartIndex = 0; bodyPartIndex < snakeBody.length; bodyPartIndex = bodyPartIndex + 1) {
            if (snakeBody[bodyPartIndex].x === foodPosition.x && snakeBody[bodyPartIndex].y === foodPosition.y) {
                foodIsOnSnake = true;
            }
        }
    }
}

// This function prepares a new snake game and shows the playing screen.
function startGame() {
    snakeBody = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    movementDirection = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    currentScore = 0;
    scoreDisplay.textContent = currentScore;
    gameState = "playing";
    gameMessage.classList.add("hidden");
    scoreForm.classList.add("hidden");
    nameError.textContent = "";
    placeFood();
    drawGame();
}

// This function ends the game and decides whether to ask for a high-score name.
function endGame() {
    var canEnterHighScore = highScores.length < 5;

    gameState = "gameover";
    messageHeading.textContent = "Game over!";
    messageText.textContent = "Your score: " + currentScore;
    startButton.classList.add("hidden");
    restartButton.classList.remove("hidden");
    gameMessage.classList.remove("hidden");

    if (highScores.length === 5 && currentScore > highScores[highScores.length - 1].score) {
        canEnterHighScore = true;
    }

    if (canEnterHighScore) {
        scoreForm.classList.remove("hidden");
        playerNameInput.value = "";
        nameError.textContent = "";
        playerNameInput.focus();
    } else {
        scoreForm.classList.add("hidden");
    }
}

// This function checks whether a grid position is occupied by the snake.
function isSnakeAtPosition(positionX, positionY) {
    var bodyPartIndex;

    for (bodyPartIndex = 0; bodyPartIndex < snakeBody.length; bodyPartIndex = bodyPartIndex + 1) {
        if (snakeBody[bodyPartIndex].x === positionX && snakeBody[bodyPartIndex].y === positionY) {
            return true;
        }
    }

    return false;
}

// This function moves the snake and handles eating, growing, and collisions.
function moveSnake() {
    var newHead;
    var ateFood;
    var bodyPartIndex;

    movementDirection = { x: nextDirection.x, y: nextDirection.y };
    newHead = {
        x: snakeBody[0].x + movementDirection.x * gridSize,
        y: snakeBody[0].y + movementDirection.y * gridSize
    };
    ateFood = newHead.x === foodPosition.x && newHead.y === foodPosition.y;

    if (newHead.x < 0 || newHead.x >= gameCanvas.width || newHead.y < 0 || newHead.y >= gameCanvas.height) {
        endGame();
        return;
    }

    for (bodyPartIndex = 0; bodyPartIndex < snakeBody.length; bodyPartIndex = bodyPartIndex + 1) {
        if (snakeBody[bodyPartIndex].x === newHead.x && snakeBody[bodyPartIndex].y === newHead.y) {
            endGame();
            return;
        }
    }

    snakeBody.unshift(newHead);

    if (ateFood) {
        currentScore = currentScore + 1;
        scoreDisplay.textContent = currentScore;
        placeFood();
    } else {
        snakeBody.pop();
    }

    drawGame();
}

// This function redraws the game at a steady speed while a game is active.
function gameLoop() {
    if (gameState === "playing") {
        moveSnake();
    }
}

// This function saves the player's name and score after checking the name.
function saveHighScore(event) {
    var playerName = playerNameInput.value.trim();
    var newHighScore;
    var scoreIndex;
    var scoreToSort;

    event.preventDefault();
    nameError.textContent = "";

    if (playerName.length < 3) {
        nameError.textContent = "Please enter a name with at least 3 characters.";
        playerNameInput.focus();
        return;
    }

    newHighScore = { name: playerName, score: currentScore };
    highScores.push(newHighScore);

    for (scoreIndex = 0; scoreIndex < highScores.length; scoreIndex = scoreIndex + 1) {
        for (var compareIndex = 0; compareIndex < highScores.length - 1; compareIndex = compareIndex + 1) {
            if (highScores[compareIndex].score < highScores[compareIndex + 1].score) {
                scoreToSort = highScores[compareIndex];
                highScores[compareIndex] = highScores[compareIndex + 1];
                highScores[compareIndex + 1] = scoreToSort;
            }
        }
    }

    highScores = highScores.slice(0, 5);
    localStorage.setItem("southAfricanSnakeHighScores", JSON.stringify(highScores));
    displayHighScores();
    scoreForm.classList.add("hidden");
    messageText.textContent = "Your score was saved. Press Restart to play again.";
}

// This function clears and redraws the five high-score rows.
function displayHighScores() {
    var scoreIndex;
    var tableRow;
    var placeCell;
    var nameCell;
    var scoreCell;

    highScoreList.textContent = "";

    if (highScores.length === 0) {
        tableRow = document.createElement("tr");
        nameCell = document.createElement("td");
        nameCell.colSpan = 3;
        nameCell.textContent = "No scores yet. Be the first to play!";
        tableRow.appendChild(nameCell);
        highScoreList.appendChild(tableRow);
        return;
    }

    for (scoreIndex = 0; scoreIndex < highScores.length; scoreIndex = scoreIndex + 1) {
        tableRow = document.createElement("tr");
        placeCell = document.createElement("td");
        nameCell = document.createElement("td");
        scoreCell = document.createElement("td");
        placeCell.textContent = scoreIndex + 1;
        nameCell.textContent = highScores[scoreIndex].name;
        scoreCell.textContent = highScores[scoreIndex].score;
        tableRow.appendChild(placeCell);
        tableRow.appendChild(nameCell);
        tableRow.appendChild(scoreCell);
        highScoreList.appendChild(tableRow);
    }
}

// This function reads arrow keys, prevents page scrolling, and changes direction safely.
function handleKeyPress(event) {
    if (event.key.indexOf("Arrow") === 0) {
        event.preventDefault();
    }

    if (gameState !== "playing") {
        return;
    }

    if (event.key === "ArrowUp" && movementDirection.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    } else if (event.key === "ArrowDown" && movementDirection.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    } else if (event.key === "ArrowLeft" && movementDirection.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    } else if (event.key === "ArrowRight" && movementDirection.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }
}

// These event listeners connect the buttons, form, and keyboard to the game.
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
scoreForm.addEventListener("submit", saveHighScore);
document.addEventListener("keydown", handleKeyPress);

// This initial drawing and timer show the board before and during the game.
displayHighScores();
drawGame();
setInterval(gameLoop, 130);
