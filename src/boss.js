const boss = {
    x: canvas.width - 300,
    y: canvas.height - 150,
    width: 150,
    height: 100,
    health: 500,
    speed: 2,
    dx: 2,
    state: 'forward',
    timer: 0,
    dodgeCooldown: 300,
    shootTimer: 0 
};


let bossWorker;
let bossData = { ...boss };

if (typeof(Worker) !== "undefined") {
    bossWorker = new Worker("./workers/bossWorker.js");

    bossWorker.postMessage({ 
        action: 'initialize',
        canvasWidth: canvas.width 
    });

    bossWorker.onmessage = (e) => {
        bossData = e.data.boss;
        boss.x = bossData.x;
        drawBoss();
    };
} else {
    console.error("Tu navegador no soporta Web Workers.");
}

function drawBoss() {
    ctx.fillStyle = "red";
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
}

let projectileWorker;
let projectiles = [];

if (typeof(Worker) !== "undefined") {
    projectileWorker = new Worker("./workers/projectileWorker.js");

    projectileWorker.onmessage = (e) => {
        projectiles = e.data.projectiles;
        createCurvedProjectiles();
    };
} else {
    console.error("Tu navegador no soporta Web Workers.");
}


function attackBoss() {
    if (keys.attack && currentScene === 2) {
        if (player.x + player.width > boss.x && player.x < boss.x + boss.width) {
            boss.health -= 10;
        }
    }
}

function checkProjectileCollision(projectiles) {
    projectiles.forEach((projectile, index) => {
        if (player.x < projectile.x + projectile.width &&
            player.x + player.width > projectile.x &&
            player.y < projectile.y + projectile.height &&
            player.y + player.height > projectile.y) {
            player.health -= 10;
            console.log("¡El jugador ha sido golpeado por un proyectil! Salud restante: " + player.health);
            projectiles.splice(index, 1);
        }

        if (projectile.x < 0 || projectile.x > canvas.width || 
            projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(index, 1);
        }
    });
}


function updateProjectiles() {
    projectiles.forEach((projectile, index) => {
        projectile.x += projectile.directionX;
        projectile.y += projectile.directionY;

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.width / 2, 0, Math.PI * 2);
        ctx.fill();

        if (projectile.x < 0 || projectile.x > canvas.width || 
            projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(index, 1);
        }

        if (projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y) {
            player.health -= 10;
            console.log("¡El jugador ha sido golpeado por un proyectil!");
            projectiles.splice(index, 1);
        }
    });
}

function attackBoss() {
    if (keys.attack && currentScene === 2) {
        if (player.x + player.width > boss.x && player.x < boss.x + boss.width) {
            boss.health -= 10; 
            console.log("¡El jefe ha sido golpeado! Salud restante: " + boss.health);
        }
    }
}

let lastAttackTime = 0;

function checkPlayerAttack(currentTime) {
    if (currentScene === 2) {
        if (boss.x + boss.width > player.x && boss.x < player.x + player.width) {
            if (currentTime - lastAttackTime > 1000) {
                player.health -= 1;
                console.log("¡El jugador ha sido golpeado por el jefe!");
                lastAttackTime = currentTime;
            }
        }
    }
}


function startGame() {
    player.health = 100;
    player.x = 100;
    player.y = canvas.height - 130;

    boss.health = 200; 
    boss.x = canvas.width - 300; 
    boss.y = canvas.height - 150; 
    boss.state = 'forward'; 
    boss.timer = 0;
    boss.shootTimer = 0; 
    projectiles.length = 0; 

    currentScene = 1;
    gameStarted = true;
    startButton.style.display = "none";
    restartButton.style.display = "none";
    victoryMessage.style.display = "none";
    gameLoop();
}

function updateBoss() {
    if (boss.health > 0) {
        if (bossWorker) {
            bossWorker.postMessage({ 
                action: 'update', 
                canvasWidth: canvas.width 
            });
        } else {
            moveBoss();
        }

        drawBoss(); 
        checkPlayerAttack();

        boss.shootTimer++;
        if (boss.shootTimer >= 180) {
            projectileWorker.postMessage({ 
                action: 'create', 
                boss: boss, 
                player: player 
            });
            boss.shootTimer = 0;
        }

        updateProjectiles(); 
    } else {
        console.log("¡El jefe ha sido derrotado!");
        boss.health = 0;
        boss.x = -200;
        restartButton.style.display = "block"; 
        victory();
    }
}


function victory() {
    victoryMessage.style.display = "block";
    gameStarted = false;
}


function gameLoop(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawPlayer();
    drawHealthBar(10, 10, player.health, 100);

    if (currentScene === 2) {
        drawHealthBar(canvas.width - 180, 10, boss.health, 500);
        updateBoss();
        attackBoss();
        updateProjectiles();
        checkProjectileCollision(projectiles); 
        checkPlayerAttack(currentTime);
    }

    movePlayer();
    checkGameOver();

    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

