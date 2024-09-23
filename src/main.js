const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const victoryMessage = document.getElementById("victoryMessage");

let gameStarted = false;
let currentScene = 1; 

const gravity = 0.5;
const player = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    speed: 5,
    dx: 0,
    dy: 0,
    jumping: false,
    health: 100,
};

const keys = { right: false, left: false, up: false, attack: false };

const platformsScene1 = [{ x: 0, y: canvas.height - 50, width: canvas.width, height: 50 }];
const platformsScene2 = [{ x: 0, y: canvas.height - 50, width: canvas.width, height: 50 }];
let currentPlatforms = platformsScene1;

function updateBackground() {
    if (currentScene === 1) {
        canvas.style.backgroundImage = "url('assets/background6.png')";  
        canvas.style.backgroundSize = "cover";  
        canvas.style.backgroundPosition = "center";  
    } else if (currentScene === 2) {
        canvas.style.backgroundImage = "url('assets/background5.jpg')";  
        canvas.style.backgroundSize = "cover";
        canvas.style.backgroundPosition = "center";
    }
}

const playerWorker = new Worker('./workers/playerWorker.js');

const playerImage = new Image();
playerImage.src = "./assets/_Run.png";

const spriteWidth = 50;
const spriteHeight = 80;
let frameIndex = 0;
let frameCounter = 0;
const frameSpeed = 5; // Ajusta este valor para cambiar la velocidad de la animación

function drawPlayer() {
    ctx.clearRect(player.x, player.y, player.width, player.height);

    ctx.drawImage(
        playerImage,
        frameIndex * spriteWidth,
        0,
        spriteWidth,
        spriteHeight,
        player.x,
        player.y,
        player.width,
        player.height
    );
}

function update() {
    drawPlayer();
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        playerWorker.postMessage({ keys, playerImageWidth: playerImage.width });
    }
    requestAnimationFrame(update);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowLeft') keys.left = true;

    playerWorker.postMessage({ keys, playerImageWidth: playerImage.width });
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;

    playerWorker.postMessage({ keys, playerImageWidth: playerImage.width });
});

playerWorker.onmessage = function (e) {
    const { frameIndex: newFrameIndex } = e.data;
    frameIndex = newFrameIndex; 
};

update();


function drawPlatforms() {
    if (currentScene === 1) {
        ctx.fillStyle = "#430f43"; 
        platformsScene1.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    } else if (currentScene === 2) {
        ctx.fillStyle = "#260d34";
        platformsScene2.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    }
}


document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "ArrowUp") keys.up = true;
    if (e.code === "Space") keys.attack = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowRight") keys.right = false;
    if (e.code === "ArrowLeft") keys.left = false;
    if (e.code === "ArrowUp") keys.up = false;
    if (e.code === "Space") keys.attack = false;
});

function movePlayer() {
    player.dx = keys.right ? player.speed : keys.left ? -player.speed : 0;

    if (keys.up && !player.jumping) {
        player.dy = -10;
        player.jumping = true;
    }

    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    currentPlatforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y) {
            player.dy = 0;
            player.jumping = false;
            player.y = platform.y - player.height;
        }
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        if (currentScene === 1) {
            currentScene = 2;
            loadScene2();
        } else {
            player.x = canvas.width - player.width;
        }
    }
}

function drawHealthBar(x, y, health, maxHealth) {
    const barWidth = 150; 
    const barHeight = 20; 

    ctx.lineWidth = 4; 
    ctx.strokeStyle = "#000"; 
    ctx.fillStyle = "#555";  
    ctx.roundRect(x, y, barWidth + 4, barHeight + 4, 5); 
    ctx.stroke();
    ctx.fill(); 

    const healthWidth = (health / maxHealth) * barWidth; 
    ctx.fillStyle = "green";
    ctx.roundRect(x + 2, y + 2, healthWidth, barHeight, 3); 
    ctx.fill();

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff"; 
    ctx.fillText(`${Math.floor((health / maxHealth) * 100)}%`, x + barWidth / 2 - 20, y + barHeight / 1.5);
    
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
};

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
};


function loadScene2() {
    player.x = 0;
    currentPlatforms = platformsScene2;
    updateBackground();
}

function restartGame() {
    startGame();
}

function startGame() {
    player.health = 100;
    player.x = 100;
    player.y = canvas.height - 130;
    currentScene = 1;
    gameStarted = true;
    startButton.style.display = "none";
    restartButton.style.display = "none";
    victoryMessage.style.display = "none";
    updateBackground();
    gameLoop();
}

function checkGameOver() {
    if (player.health <= 0) {
        console.log("¡El jugador ha sido derrotado!");
        gameOver();
    }
}

function gameOver() {
    restartButton.style.display = "block";
    gameStarted = false;
}

function victory() {
    victoryMessage.style.display = "block";
    gameStarted = false;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawPlayer();
    drawHealthBar(10, 10, player.health, 100);

    if (currentScene === 2) {
        drawHealthBar(canvas.width - 110, 10, boss.health, 200);
        updateBoss();
        attackBoss();
        updateProjectiles();
        checkProjectileCollision(projectiles);
    }

    movePlayer();
    checkGameOver();

    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

restartButton.addEventListener("click", restartGame);
startButton.addEventListener("click", startGame);

document.querySelector("#victoryMessage button").onclick = restartGame;
