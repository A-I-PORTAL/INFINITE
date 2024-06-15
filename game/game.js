const characterButton = document.getElementById('character-button');
const characterIcon = document.getElementById('character-icon');
const backgroundButton = document.getElementById('background-button');
const backgroundIcon = document.getElementById('background-icon');
const musicButton = document.getElementById('music-button');

let characterIndex = 1;
let backgroundIndex = 1;
let musicIndex = 1;
let music = new Audio(`assets/music1.mp3`);
music.loop = true;
music.play();

// Function to update the character
characterButton.addEventListener('click', () => {
    characterIndex = (characterIndex % 3) + 1; // Assuming 3 characters
    characterIcon.src = `assets/character${characterIndex}.png`;
    document.getElementById('character').src = `assets/character${characterIndex}.png`;
});

// Function to update the background
backgroundButton.addEventListener('click', () => {
    backgroundIndex = (backgroundIndex % 3) + 1; // Assuming 3 backgrounds
    backgroundIcon.src = `assets/background${backgroundIndex}.jpg`;
    document.getElementById('background').style.backgroundImage = `url('assets/background${backgroundIndex}.jpg')`;
});

// Function to update the music
musicButton.addEventListener('click', () => {
    musicIndex = (musicIndex % 3) + 1; // Assuming 3 music tracks
    music.pause();
    music = new Audio(`assets/music${musicIndex}.mp3`);
    music.loop = true;
    music.play();
});

// Gravity and movement variables
const gravity = 0.5;
const jumpStrength = 10;
let speed = 2;
let score = 0;

const character = document.getElementById('character');
const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');

let isJumping = false;
let yVelocity = 0;

// Function to handle the game loop
function gameLoop() {
    if (isJumping) {
        yVelocity += gravity;
        character.style.top = `${character.offsetTop + yVelocity}px`;
        
        // Check for collision with the ground
        if (character.offsetTop + character.offsetHeight >= gameContainer.offsetHeight) {
            character.style.top = `${gameContainer.offsetHeight - character.offsetHeight}px`;
            isJumping = false;
            yVelocity = 0;
            score++;
        }
    }
    
    // Update the background position to create scrolling effect
    background.style.left = `${background.offsetLeft - speed}px`;
    if (background.offsetLeft <= -background.offsetWidth / 2) {
        background.style.left = '0px';
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Function to handle jumping
function jump() {
    if (!isJumping) {
        isJumping = true;
        yVelocity = -jumpStrength;
    }
}

// Event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' || event.code === 'Space') {
        jump();
    }
});

// Event listeners for mobile controls
document.getElementById('up-button').addEventListener('click', jump);
document.getElementById('left-button').addEventListener('click', () => speed--);
document.getElementById('right-button').addEventListener('click', () => speed++);
document.getElementById('down-button').addEventListener('click', () => speed = 0);
