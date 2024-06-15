document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    const currentScoreDisplay = document.getElementById('current-score');
    const topScoreDisplay = document.getElementById('top-score');
    const speedSlider = document.getElementById('speed-slider');
    const characterButton = document.getElementById('character-button');
    const backgroundButton = document.getElementById('background-button');
    const musicButton = document.getElementById('music-button');

    let bgPosition = 0;
    let gravity = 0.125;
    let velocity = 0;
    let isJumping = false;
    let scrollSpeed = 2;
    let isPaused = false;
    let currentScore = 0;
    let topScore = 0;
    let landedPlatforms = new Set();
    let currentCharacterIndex = 1;
    let currentBackgroundIndex = 1;
    let currentMusicIndex = 1;
    let audio = new Audio(`assets/music${currentMusicIndex}.mp3`);
    audio.loop = true;
    audio.play();

    const collisionObjects = [
        { x: 100, y: 450, width: 200, height: 10 },
        { x: 300, y: 400, width: 200, height: 10 },
        { x: 600, y: 350, width: 200, height: 10 },
        { x: 900, y: 300, width: 200, height: 10 },
        { x: 1200, y: 250, width: 200, height: 10 },
        { x: 1500, y: 450, width: 200, height: 10 },
        { x: 1800, y: 400, width: 200, height: 10 },
        { x: 2100, y: 350, width: 200, height: 10 },
        { x: 2400, y: 300, width: 200, height: 10 },
        { x: 2700, y: 250, width: 200, height: 10 },
    ];

    function updateScore() {
        currentScoreDisplay.textContent = currentScore;
        topScoreDisplay.textContent = topScore;
    }

    function scrollBackground() {
        if (isPaused) return;
        bgPosition -= scrollSpeed;
        background.style.backgroundPositionX = `${bgPosition}px`;

        collisionObjects.forEach((obj, index) => {
            obj.x -= scrollSpeed;

            if (obj.x + obj.width < 0) {
                obj.x += 3000;
                landedPlatforms.delete(index);
            }

            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${obj.x}px`;
        });

        requestAnimationFrame(scrollBackground);
    }

    function moveCharacter(event) {
        if (isPaused) return;

        const step = 10;
        let left = parseInt(window.getComputedStyle(character).left);
        let top = parseInt(window.getComputedStyle(character).top);

        switch (event.key) {
            case 'ArrowUp':
                if (!isJumping) {
                    velocity = -5;
                    isJumping = true;
                }
                break;
            case 'ArrowDown':
                character.style.top = `${top + step}px`;
                break;
            case 'ArrowLeft':
                character.style.left = `${left - step}px`;
                break;
            case 'ArrowRight':
                character.style.left = `${left + step}px`;
                break;
        }
    }

    function applyGravity() {
        if (isPaused) return;

        let top = parseInt(window.getComputedStyle(character).top);
        velocity += gravity;
        top += velocity;

        const characterRect = character.getBoundingClientRect();
        let isOnPlatform = false;

        collisionObjects.forEach((obj, index) => {
            const platformRect = document.getElementById(`collision-object-${index}`).getBoundingClientRect();

            if (characterRect.left < platformRect.right &&
                characterRect.right > platformRect.left &&
                characterRect.bottom < platformRect.bottom + 5 &&
                characterRect.bottom > platformRect.top) {
                top = platformRect.top - characterRect.height;
                velocity = 0;
                isJumping = false;
                isOnPlatform = true;
                landedPlatforms.add(index);
                currentScore = landedPlatforms.size;
                if (currentScore > topScore) {
                    topScore = currentScore;
                }
                updateScore();
            }
        });

        if (top >= window.innerHeight) {
            top = 0;
            velocity = 0;
            currentScore = 0;
            landedPlatforms.clear();
            updateScore();
        }

        character.style.top = `${top}px`;
        requestAnimationFrame(applyGravity);
    }

    function togglePause() {
        isPaused = !isPaused;
        if (!isPaused) {
            requestAnimationFrame(scrollBackground);
            requestAnimationFrame(applyGravity);
            audio.play();
        } else {
            audio.pause();
        }
    }

    function changeCharacter() {
        currentCharacterIndex = (currentCharacterIndex % 10) + 1;
        character.src = `assets/character${currentCharacterIndex}.png`;
        characterButton.querySelector('img').src = `assets/character${currentCharacterIndex}.png`;
    }

    function changeBackground() {
        currentBackgroundIndex = (currentBackgroundIndex % 10) + 1;
        background.style.backgroundImage = `url('assets/background${currentBackgroundIndex}.jpg')`;
        backgroundButton.querySelector('img').src = `assets/background${currentBackgroundIndex}.jpg`;
    }

    function changeMusic() {
        currentMusicIndex = (currentMusicIndex % 10) + 1;
        audio.pause();
        audio = new Audio(`assets/music${currentMusicIndex}.mp3`);
        audio.loop = true;
        if (!isPaused) {
            audio.play();
        }
    }

    document.addEventListener('keydown', moveCharacter);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    characterButton.addEventListener('click', changeCharacter);
    backgroundButton.addEventListener('click', changeBackground);
    musicButton.addEventListener('click', changeMusic);

    collisionObjects.forEach((obj, index) => {
        const objElement = document.createElement('div');
        objElement.id = `collision-object-${index}`;
        objElement.className = 'collision-object';
        objElement.style.left = `${obj.x}px`;
        objElement.style.top = `${obj.y}px`;
        objElement.style.width = `${obj.width}px`;
        objElement.style.height = `${obj.height}px`;
        gameContainer.appendChild(objElement);
    });

    requestAnimationFrame(scrollBackground);
    requestAnimationFrame(applyGravity);
});
