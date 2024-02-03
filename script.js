const gameContainer = document.getElementById('game-container');
const snake = document.getElementById('snake');
const food = document.getElementById('food');
const obstaclesContainer = document.getElementById('obstacles');
const scoreContainer = document.getElementById('score');
const nameInputContainer = document.getElementById('name-input-container');
const leaderboardContainer = document.getElementById('leaderboard-container');
const leaderboardList = document.getElementById('leaderboard');
const startGameBtn = document.getElementById('startGameBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const helpContainer = document.getElementById('help-container');

let snakeBody = [{ x: 10, y: 10 }];
let directionX = 1;
let directionY = 0;
const gridSize = 30;
const containerSize = 20;
const initialSpeed = 200;
let speed = initialSpeed;
let score = 0;
let gameStarted = false;
let playerName = "";
let obstacles = [];
let foodX = 0;
let foodY = 0;
let lastTimestamp = 0;

// Load leaderboard from localStorage
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function createElement(className, x, y) {
    const element = document.createElement('div');
    element.className = className;
    element.style.left = x * gridSize + 'px';
    element.style.top = y * gridSize + 'px';
    return element;
}

function loadLeaderboard() {
    fetch('/loadLeaderboard.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from database:', data); // Výpis dat z databáze do konzole
            leaderboard = data;
            displayLeaderboard();
        })
        .catch(error => console.error('Error loading leaderboard:', error));
}
loadLeaderboard();


function createSnake() {
    snake.innerHTML = '';
    snakeBody.forEach(segment => snake.appendChild(createElement('snake-segment', segment.x, segment.y)));
}

function createObstacle(x, y) {
    obstaclesContainer.appendChild(createElement('obstacle', x, y));
    obstacles.push({ x, y });
}

function generateObstacles() {
    obstaclesContainer.innerHTML = '';
    obstacles = [];

    const obstacleCount = (score <= 10) ? 20 : (score <= 20) ? 10 : (score <= 30) ? 5 : 0;

    for (let i = 0; i < obstacleCount; i++) {
        let obstacleX, obstacleY;

        do {
            obstacleX = Math.floor(Math.random() * containerSize);
            obstacleY = Math.floor(Math.random() * containerSize);
        } while (
            snakeBody.some(segment => Math.abs(segment.x - obstacleX) < 2 && Math.abs(segment.y - obstacleY) < 2) ||
            (foodX === obstacleX && foodY === obstacleY) ||
            obstacles.some(obstacle => obstacle.x === obstacleX && obstacle.y === obstacleY)
        );

        createObstacle(obstacleX, obstacleY);
    }
}

function checkSelfCollision() {
    const head = snakeBody[0];
    if (snakeBody.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
    }
}

function checkObstacleCollision() {
    const head = snakeBody[0];
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        endGame();
    }
}

function updateSnake(timestamp) {
    if (!gameStarted) {
        lastTimestamp = timestamp;
        requestAnimationFrame(updateSnake);
        return;
    }

    const elapsedMilliseconds = timestamp - lastTimestamp;

    if (elapsedMilliseconds >= speed) {
        lastTimestamp = timestamp;
        const newHead = { x: snakeBody[0].x + directionX, y: snakeBody[0].y + directionY };

        if (
            newHead.x < 0 || newHead.x >= containerSize ||
            newHead.y < 0 || newHead.y >= containerSize
        ) {
            endGame();
            return;
        }

        checkSelfCollision();
        checkObstacleCollision();

        snakeBody.unshift(newHead);

        if (newHead.x === foodX && newHead.y === foodY) {
            score++;
            scoreContainer.textContent = score;

            generateFood();
            generateObstacles();
        } else {
            snakeBody.pop();
        }

        createSnake();
    }

    requestAnimationFrame(updateSnake);
}

function generateFood() {
    do {
        foodX = Math.floor(Math.random() * containerSize);
        foodY = Math.floor(Math.random() * containerSize);
    } while (
        snakeBody.some(segment => segment.x === foodX && segment.y === foodY) ||
        obstacles.some(obstacle => obstacle.x === foodX && obstacle.y === foodY)
    );

    food.style.left = foodX * gridSize + 'px';
    food.style.top = foodY * gridSize + 'px';
}

function handleKeyPress(event) {
    if (!gameStarted) {
        gameStarted = true;
        generateFood();
        generateObstacles();
        requestAnimationFrame(updateSnake);
    }

    switch (event.key) {
        case 'w':
            if (directionY !== 1) {
                directionX = 0;
                directionY = -1;
            }
            break;
        case 's':
            if (directionY !== -1) {
                directionX = 0;
                directionY = 1;
            }
            break;
        case 'a':
            if (directionX !== 1) {
                directionX = -1;
                directionY = 0;
            }
            break;
        case 'd':
            if (directionX !== -1) {
                directionX = 1;
                directionY = 0;
            }
            break;
    }
}

function startGame() {
    playerName = document.getElementById('playerName').value;
    if (playerName.trim() === "") {
        alert("Please enter your name to start the game.");
    } else {
        nameInputContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        leaderboardContainer.style.display = 'none';
        document.addEventListener('keydown', handleKeyPress);
        startGameBtn.style.display = 'none';
        restartGameBtn.style.display = 'block';
        requestAnimationFrame(updateSnake);
    }
}

function restartGame() {
    snakeBody = [{ x: 10, y: 10 }];
    directionX = 1;
    directionY = 0;
    score = 0;
    scoreContainer.textContent = score;
    gameStarted = false;
    speed = initialSpeed;
    generateFood();
    generateObstacles();
    createSnake();
    nameInputContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    leaderboardContainer.style.display = 'block';
    document.removeEventListener('keydown', handleKeyPress);
    startGameBtn.style.display = 'block';
    restartGameBtn.style.display = 'none';
}

function endGame() {
    const data = {
        player: playerName,
        score: score
    };

    console.log(JSON.stringify(data)); // Zkontrolovat výstup v konzoli

    fetch('/saveToDatabase.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error saving to database:', error);
    });

    const createdAt = getCurrentDateTime();
    leaderboard.push({ player: playerName, score: score, createdAt: createdAt });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();

    alert('Game Over! Score: ' + score);

    snakeBody = [{ x: 10, y: 10 }];
    directionX = 1;
    directionY = 0;
    score = 0;
    scoreContainer.textContent = score;
    gameStarted = false;
    speed = initialSpeed;
    generateFood();
    generateObstacles();
    createSnake();
    nameInputContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    leaderboardContainer.style.display = 'block';
    document.removeEventListener('keydown', handleKeyPress);
    startGameBtn.style.display = 'block';
    restartGameBtn.style.display = 'none';
}

function displayLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.player}: ${entry.score} (${entry.createdAt})`;
        leaderboardList.appendChild(listItem);
    });
}

// Initial setup
const storedPlayerName = localStorage.getItem('playerName');
if (storedPlayerName) {
    playerName = storedPlayerName;
    nameInputContainer.style.display = 'none';
    gameContainer.style.display = 'none';
    leaderboardContainer.style.display = 'block';
    displayLeaderboard();
}

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-GB');
    return `${date} ${time}`;
}
