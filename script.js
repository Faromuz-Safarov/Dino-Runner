
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore")
const message = document.getElementById("message");
const restartButton = document.getElementById("restartButton");


// Game world
const groundY = 200;
const gravity = 0.6;
const jumpStrength = -12;

// Dinosaur
const dino = {
    x: 60,
    y: groundY - 40,
    width: 30,
    height: 40,
    velocityY: 0,
    jumping: false
};

// Obstacle
const cactus = {
    x: 800,
    y: groundY - 40,
    width: 20,
    height: 40
};

let score = 0;
let highScore = Number(localStorage.getItem("dinoHighScore")) || 0;

highScoreDisplay.textContent = highScore;
let speed = 5;
let gameOver = false;


let audioContext;

function playTone(frequency, duration, type = "square") {
    // Create the audio system when the game first needs sound
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    // Some browsers suspend audio until the player interacts
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Keep the sound short and prevent clicking noises
    volume.gain.setValueAtTime(0.12, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}


// Make the dinosaur jump
function jump() {
    if (gameOver) {
        resetGame();
        return;
    }

    if (!dino.jumping) {
        dino.velocityY = jumpStrength;
        dino.jumping = true;

        playTone(500, 0.12)
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Dinosaur
    ctx.fillStyle = "#333";
    ctx.fillRect(
        dino.x,
        dino.y,
        dino.width,
        dino.height
    );

    // Dinosaur eye
    ctx.fillStyle = "white";
    ctx.fillRect(dino.x + 20, dino.y + 8, 4, 4);

    // Cactus
    ctx.fillStyle = "#238636";
    ctx.fillRect(
        cactus.x,
        cactus.y,
        cactus.width,
        cactus.height
    );

    // Cactus arms
    ctx.fillRect(cactus.x - 8, cactus.y + 12, 8, 6);
    ctx.fillRect(cactus.x + 20, cactus.y + 20, 8, 6);

    // Game over text
    if (gameOver) {
        ctx.fillStyle = "#333";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 90);
        ctx.font = "16px Arial";
        ctx.fillText(
            "Press SPACE or click Restart",
            canvas.width / 2,
            120
        );
        ctx.textAlign = "left";
    }
}

// Check whether two rectangles overlap
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Update the game state
function update() {
    if (gameOver) return;

    // Gravity pulls the dinosaur down
    dino.y += dino.velocityY;
    dino.velocityY += gravity;

    // Stop the dinosaur at the ground
    if (dino.y >= groundY - dino.height) {
        dino.y = groundY - dino.height;
        dino.velocityY = 0;
        dino.jumping = false;
    }

    // Move the cactus left
    cactus.x -= speed;

    // Spawn the next cactus
    if (cactus.x + cactus.width < 0) {
        cactus.x = canvas.width + Math.random() * 250;
        score += 1;
        speed += 0.5;
        playTone(600, 0.5);

        scoreDisplay.textContent = score;

        if (score > highScore) {
            highScore = score;
            playTone(900, 0.1);

            highScoreDisplay.textContent = score;

            localStorage.setItem("dinoHighScore", score)
        }
    }

    // Check for a collision
    if (isColliding(dino, cactus)) {
        gameOver = true;
        message.textContent = "You hit a cactus!";
        playTone(150, 0.1, "sawtooth");
    }
}

// The game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Start a fresh game
function resetGame() {
    dino.y = groundY - dino.height;
    dino.velocityY = 0;
    dino.jumping = false;

    cactus.x = canvas.width;
    score = 0;
    speed = 5;
    gameOver = false;

    scoreDisplay.textContent = score;
    message.textContent = "Jump over the cacti!";
}

// Controls
document.addEventListener("keydown", function(event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
    }
});

canvas.addEventListener("click", jump);
restartButton.addEventListener("click", resetGame);

// Start drawing and updating
gameLoop();
