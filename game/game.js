document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    const currentScoreDisplay = document.getElementById('current-score');
    const topScoreDisplay = document.getElementById('top-score');
    const speedSlider = document.getElementById('speed-slider');
    const characterButton = document.getElementById('character-button');
    const characterIcon = document.getElementById('character-icon');
    const backgroundButton = document.getElementById('background-button');
    const backgroundIcon = document.getElementById('background-icon');
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

    const characterImages = [];
    let currentCharacterIndex = 1;

    const backgroundImages = [];
    let currentBackgroundIndex = 1;
    
    // Initial setup
    let musicIndex = 1;
    let music = new Audio(`assets/music${musicIndex}.mp3`);
    music.loop = true;
    music.play();

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

        if (left < 0) {
            character.style.left = '0px';
        } else if (left + character.offsetWidth > gameContainer.clientWidth) {
            character.style.left = `${gameContainer.clientWidth - character.offsetWidth}px`;
        }
    }

    function applyGravity() {
        if (isPaused) return;

        let charTop = parseInt(window.getComputedStyle(character).top);
        let charLeft = parseInt(window.getComputedStyle(character).left);

        velocity += gravity;
        charTop += velocity;

        let onSurface = false;
        for (let [index, obj] of collisionObjects.entries()) {
            if (
                charLeft + character.offsetWidth > obj.x &&
                charLeft < obj.x + obj.width &&
                charTop + character.offsetHeight > obj.y &&
                charTop < obj.y + obj.height
            ) {
                if (charTop + character.offsetHeight - velocity <= obj.y) {
                    charTop = obj.y - character.offsetHeight;
                    velocity = 0;
                    isJumping = false;

                    if (!landedPlatforms.has(index)) {
                        currentScore++;
                        if (currentScore > topScore) topScore = currentScore;
                        updateScore();
                        landedPlatforms.add(index);
                    }
                } else if (charTop - velocity >= obj.y + obj.height) {
                    charTop = obj.y + obj.height;
                    velocity = 0;
                } else if (charLeft + character.offsetWidth - velocity <= obj.x) {
                    charLeft = obj.x - character.offsetWidth;
                } else if (charLeft - velocity >= obj.x + obj.width) {
                    charLeft = obj.x + obj.width;
                }
                onSurface = true;
                break;
            }
        }

        if (charTop + character.offsetHeight > gameContainer.clientHeight && !onSurface) {
            charTop = 0;
            velocity = 0;
            isJumping = false;
            currentScore = 0;
            landedPlatforms.clear();
            updateScore();
        }

        character.style.top = `${charTop}px`;
        character.style.left = `${charLeft}px`;
        requestAnimationFrame(applyGravity);
    }

    function resizeGame() {
        const gameWidth = gameContainer.clientWidth;
        const gameHeight = gameContainer.clientHeight;

        const characterScale = gameWidth / 800;
        character.style.width = `${characterScale * 50}px`;
        character.style.height = 'auto';

        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${obj.x}px`;
            objElement.style.top = `${obj.y}px`;
            objElement.style.width = `${obj.width}px`;
            objElement.style.height = `${obj.height}px`;
        });

        background.style.height = `${gameHeight}px`;

        const mobileControls = document.getElementById('mobile-controls');
        mobileControls.style.width = '240px';
        mobileControls.style.height = '240px';
    }

    function initCollisionObjects() {
        const gameContainer = document.getElementById('game-container');
        collisionObjects.forEach((obj, index) => {
            const div = document.createElement('div');
            div.classList.add('collision-object');
            div.id = `collision-object-${index}`;
            div.style.left = `${obj.x}px`;
            div.style.top = `${obj.y}px`;
            div.style.width = `${obj.width}px`;
            div.style.height = `${obj.height}px`;
            gameContainer.appendChild(div);
        });
    }

    function mobileControl(event) {
        const control = event.target.id.replace('-button', '');
        const eventKey = `Arrow${control.charAt(0).toUpperCase() + control.slice(1)}`;
        moveCharacter({ key: eventKey });
    }

    function preventZoom(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }

    function togglePause() {
        isPaused = !isPaused;
        if (!isPaused) {
            scrollBackground();
            applyGravity();
        }
    }

    function loadCharacterImages() {
        let i = 1;
        let img = new Image();
        img.src = `assets/character${i}.png`;
        img.onload = function () {
            while (this.complete) {
                characterImages.push(this.src);
                i++;
                this.src = `assets/character${i}.png`;
            }
        };
    }

    function loadBackgroundImages() {
        let i = 1;
        let img = new Image();
        img.src = `assets/background${i}.jpg`;
        img.onload = function () {
            while (this.complete) {
                backgroundImages.push(this.src);
                i++;
                this.src = `assets/background${i}.jpg`;
            }
        };
    }

    function changeCharacter() {
        currentCharacterIndex = (currentCharacterIndex % characterImages.length) + 1;
        characterIcon.src = `assets/character${currentCharacterIndex}.png`;
        character.src = `assets/character${currentCharacterIndex}.png`;
    }

    function changeBackground() {
        currentBackgroundIndex = (currentBackgroundIndex % backgroundImages.length) + 1;
        backgroundIcon.src = `assets/background${currentBackgroundIndex}.jpg`;
        background.style.backgroundImage = `url('assets/background${currentBackgroundIndex}.jpg')`;
    }

    // Function to update the music
    musicButton.addEventListener('click', () => {
    // Increment the music index
    musicIndex++;
    
    // Pause and stop the current music
    music.pause();
    music.currentTime = 0;

    // Attempt to create a new audio object with the next music file
    let nextMusic = new Audio(`assets/music${musicIndex}.mp3`);
    
    // Handle the error if the file does not exist (by resetting to 1)
    nextMusic.addEventListener('error', () => {
        musicIndex = 1;
        nextMusic = new Audio(`assets/music${musicIndex}.mp3`);
        nextMusic.loop = true;
        nextMusic.play();
        music = nextMusic;
    });

    // If the file exists, play it
    nextMusic.addEventListener('canplaythrough', () => {
        nextMusic.loop = true;
        nextMusic.play();
        music = nextMusic;
    });

    // Attempt to load the next file
    nextMusic.load();
    });

    window.addEventListener('resize', resizeGame);

    document.addEventListener('keydown', moveCharacter);

    document.querySelectorAll('.control-button').forEach(button => {
        button.addEventListener('touchstart', mobileControl);
        button.addEventListener('mousedown', mobileControl);
    });

    document.addEventListener('touchstart', preventZoom, { passive: false });

    characterButton.addEventListener('click', changeCharacter);
    backgroundButton.addEventListener('click', changeBackground);
    document.getElementById('pause-button').addEventListener('click', togglePause);

    speedSlider.addEventListener('input', () => {
        scrollSpeed = parseInt(speedSlider.value, 10);
    });

    loadCharacterImages();
    loadBackgroundImages();
    initCollisionObjects();
    resizeGame();
    scrollBackground();
    applyGravity();
    updateScore();
});
