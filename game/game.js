const gameContainer = document.getElementById('game-container');
const character = document.getElementById('character');
const background = document.getElementById('background');
const collisionObjects = [
    { x: 500, y: 300, width: 300, height: 20 },
    { x: 900, y: 400, width: 300, height: 20 },
    { x: 1300, y: 500, width: 300, height: 20 },
    { x: 1700, y: 600, width: 300, height: 20 },
    { x: 2100, y: 700, width: 300, height: 20 },
    { x: 2500, y: 800, width: 300, height: 20 },
    { x: 2900, y: 300, width: 300, height: 20 },
    { x: 3300, y: 400, width: 300, height: 20 },
    { x: 3700, y: 500, width: 300, height: 20 },
    { x: 4100, y: 600, width: 300, height: 20 }
];

let posX = 50;
let posY = 50;
let velocityX = 0;
let velocityY = 1; // Reduced speed
const gravity = 0.2;
const jumpStrength = 10;
const moveSpeed = 5;
let jumping = false;
let onPlatform = false;

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            velocityX = -moveSpeed;
            break;
        case 'ArrowRight':
            velocityX = moveSpeed;
            break;
        case 'ArrowUp':
            if (!jumping && onPlatform) {
                velocityY = -jumpStrength;
                jumping = true;
            }
            break;
        case 'ArrowDown':
            velocityY = moveSpeed;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            velocityX = 0;
            break;
        case 'ArrowDown':
            velocityY = 0;
            break;
    }
});

// Mobile Controls
document.getElementById('up-button').addEventListener('touchstart', function() {
    if (!jumping && onPlatform) {
        velocityY = -jumpStrength;
        jumping = true;
    }
});

document.getElementById('left-button').addEventListener('touchstart', function() {
    velocityX = -moveSpeed;
});

document.getElementById('right-button').addEventListener('touchstart', function() {
    velocityX = moveSpeed;
});

document.getElementById('down-button').addEventListener('touchstart', function() {
    velocityY = moveSpeed;
});

document.querySelectorAll('.control-button').forEach(button => {
    button.addEventListener('touchend', function() {
        velocityX = 0;
        velocityY = 0;
    });
});

function checkCollisions() {
    onPlatform = false;
    collisionObjects.forEach(obj => {
        if (posX < obj.x + obj.width &&
            posX + character.offsetWidth > obj.x &&
            posY < obj.y + obj.height &&
            posY + character.offsetHeight > obj.y) {
            if (velocityY > 0 && posY + character.offsetHeight - velocityY <= obj.y) {
                posY = obj.y - character.offsetHeight;
                velocityY = 0;
                jumping = false;
                onPlatform = true;
            } else if (velocityY < 0 && posY - velocityY >= obj.y + obj.height) {
                posY = obj.y + obj.height;
                velocityY = 0;
            } else if (velocityX > 0 && posX + character.offsetWidth - velocityX <= obj.x) {
                posX = obj.x - character.offsetWidth;
                velocityX = 0;
            } else if (velocityX < 0 && posX - velocityX >= obj.x + obj.width) {
                posX = obj.x + obj.width;
                velocityX = 0;
            }
        }
    });

    // Check collisions with left and right boundaries
    if (posX < 0) {
        posX = 0;
        velocityX = 0;
    } else if (posX + character.offsetWidth > gameContainer.offsetWidth) {
        posX = gameContainer.offsetWidth - character.offsetWidth;
        velocityX = 0;
    }
}

function updateCharacterSize() {
    const containerWidth = gameContainer.offsetWidth;
    character.style.width = containerWidth * 0.05 + 'px'; // 5% of container width
    character.style.height = 'auto';
}

window.addEventListener('resize', function() {
    updateCharacterSize();
    updateCollisionObjectSizes();
});

function updateCollisionObjectSizes() {
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    collisionObjects.forEach((obj, index) => {
        const collisionObjectDiv = document.getElementsByClassName('collision-object')[index];
        collisionObjectDiv.style.left = obj.x + 'px';
        collisionObjectDiv.style.top = obj.y + 'px';
        collisionObjectDiv.style.width = obj.width + 'px';
        collisionObjectDiv.style.height = obj.height + 'px';
    });
}

function gameLoop() {
    velocityY += gravity;
    posX += velocityX;
    posY += velocityY;

    checkCollisions();

    if (posY > gameContainer.offsetHeight) {
        posY = -character.offsetHeight;
    }

    character.style.left = posX + 'px';
    character.style.top = posY + 'px';

    background.style.left = -(posX % background.offsetWidth) + 'px';

    requestAnimationFrame(gameLoop);
}

updateCharacterSize();
updateCollisionObjectSizes();
gameLoop();
