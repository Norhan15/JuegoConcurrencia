let projectiles = [];

onmessage = (e) => {
    const { action, boss, player } = e.data;

    if (action === 'create') {
        projectiles = [];
        createCurvedProjectiles(boss, player);
        postMessage({ projectiles });
    }
}

function createCurvedProjectiles(boss, player) {
    const numProjectiles = 5;
    const startAngle = -Math.PI / 4;
    const angleStep = Math.PI / 4 / (numProjectiles - 1);

    const playerDirection = player.x > boss.x ? 1 : -1;

    for (let i = 0; i < numProjectiles; i++) {
        const angle = startAngle + angleStep * i;
        const projectile = {
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 10,
            height: 10,
            speed: 3,
            directionX: Math.cos(angle) * 3 * playerDirection,
            directionY: Math.sin(angle) * 3,
        };

        projectiles.push(projectile);
    }
}
