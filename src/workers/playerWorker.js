let frameIndex = 0;
const spriteWidth = 40;
let isMoving = false;

onmessage = function (e) {
    const { keys, playerImageWidth } = e.data;

    isMoving = keys.right || keys.left;

    if (isMoving) {
        frameIndex = (frameIndex + 1) % (playerImageWidth / spriteWidth);
    } else {
        frameIndex = 0;
    }

    postMessage({ frameIndex });
};
