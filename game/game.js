const character = document.getElementById('character');
const background = document.getElementById('background');
const gameContainer = document.getElementById('game-container');
const upButton = document.getElementById('up-button');
const leftButton = document.getElementById('left-button');
const downButton = document.getElementById('down-button');
const rightButton = document.getElementById('right-button');

let characterY = 50;
let characterX = 50;
let gravity = 0.5;
let velocityY = 0;
let velocityX = 0;
const jumpHeight = -10;
const moveSpeed = 5;

function updateCharacterSize() {
    const scaleFactor = gameContainer.clientHeight / 600; // Adjust 600 as the base height reference
    character.style.width = `${50 * scaleFactor}px`;
}

function updateCharacter() {
    // Apply gravity
    velocityY += gravity;
    characterY += velocityY;
    characterX += velocityX;

    // Collision with platforms
    const collisionObjects = document.querySelectorAll('.collision-object');
    collisionObjects.forEach(platform => {
        const rect = platform.getBoundingClientRect();
        const charRect = character.getBoundingClientRect();

        if (
            charRect.right > rect.left &&
            charRect.left < rect.right &&
            charRect.bottom > rect.top &&
            charRect.top < rect.bottom
        ) {
            if (velocityY > 0) {
                characterY = rect.top - charRect.height;
                velocityY = 0;
            }
        }
    });

    // Collision with screen boundaries
    if (characterX < 0) {
        characterX = 0;
    } else if (characterX + character.clientWidth > gameContainer.clientWidth) {
        characterX = gameContainer.clientWidth - character.clientWidth;
    }

    if (characterY + character.clientHeight > gameContainer.clientHeight) {
        characterY = 0; // Reset to top if falling out of the frame
    }

    // Update character position
    character.style.top = `${characterY}px`;
    character.style.left = `${characterX}px`;
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            velocityY = jumpHeight;
            break;
        case 'ArrowLeft':
            velocityX = -moveSpeed;
            break;
        case 'ArrowRight':
            velocityX = moveSpeed;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            velocityX = 0;
            break;
    }
}

function handleTouchStart(event) {
    const button = event.target;
    if (button === upButton) {
        velocityY = jumpHeight;
    } else if (button === leftButton) {
        velocityX = -moveSpeed;
    } else if (button === rightButton) {
        velocityX = moveSpeed;
    }
}

function handleTouchEnd(event) {
    const button = event.target;
    if (button === leftButton || button === rightButton) {
        velocityX = 0;
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
upButton.addEventListener('touchstart', handleTouchStart);
leftButton.addEventListener('touchstart', handleTouchStart);
rightButton.addEventListener('touchstart', handleTouchStart);
downButton.addEventListener('touchstart', handleTouchStart);

upButton.addEventListener('touchend', handleTouchEnd);
leftButton.addEventListener('touchend', handleTouchEnd);
rightButton.addEventListener('touchend', handleTouchEnd);
downButton.addEventListener('touchend', handleTouchEnd);

window.addEventListener('resize', () => {
    updateCharacterSize();
});

updateCharacterSize();
setInterval(updateCharacter, 20);
