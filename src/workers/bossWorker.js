let boss = {
    width: 150,
    height: 100,
    health: 200,
    speed: 2,
    dx: 2,
    state: 'forward',
    timer: 0,
    dodgeCooldown: 300,
    shootTimer: 0
};

onmessage = (e) => {
    const { canvasWidth, action } = e.data;

    if (action === 'initialize') {
        boss.x = canvasWidth - 300;
        boss.y = canvasHeight - 150;
        postMessage({ boss });
        return;
    }

    if (action === 'update') {
        moveBoss(canvasWidth);
        postMessage({ boss });
    }
};

function moveBoss(canvasWidth) {
    switch (boss.state) {
        case 'forward':
            boss.x -= boss.dx; 
            boss.timer++;
            if (boss.timer > 180) {
                boss.state = 'backward';
                boss.timer = 0;
            }
            break;
        case 'backward':
            boss.x += boss.dx;
            if (boss.x > canvasWidth - 300) {
                boss.x = canvasWidth - 300;
                boss.state = 'forward';
            }
            break;
    }

    if (boss.x < 0) boss.x = 0;
    if (boss.x > canvasWidth - boss.width) boss.x = canvasWidth - boss.width;
}
