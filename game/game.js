document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
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

    // Game state variables
    let bgPosition = 0;
    let gravity = 0.125;
    let velocity = 0;
    let isJumping = false;
    let scrollSpeed = 2;
    let isPaused = false;
    let currentScore = 0;
    let topScore = 0;
    let landedPlatforms = new Set();

    // Character and background images
    const characterImages = [];
    let currentCharacterIndex = 1;

    const backgroundImages = [];
    let currentBackgroundIndex = 1;

    // Music control code
    let currentTrackIndex = 0;
    let audioElement = new Audio();
    const musicFiles = [];

    // Load music files dynamically from assets/music
    async function loadMusicFiles() {
        try {
            const response = await fetch('assets/music');
            if (response.ok) {
                const text = await response.text();
                const regex = /href="(music\d+\.mp3)"/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    musicFiles.push(`assets/music/${match[1]}`);
                }
            }
        } catch (error) {
            console.error('Error loading music files:', error);
        }
    }

    // Initialize the music player and setup event listeners
    async function initMusicPlayer() {
        await loadMusicFiles();
        if (musicFiles.length > 0) {
            audioElement.src = musicFiles[currentTrackIndex];
            audioElement.loop = true;
            audioElement.play();

            musicButton.addEventListener('click', () => {
                currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
                audioElement.src = musicFiles[currentTrackIndex];
                audioElement.play();
            });
        }
    }

    // Call the initMusicPlayer function
    initMusicPlayer();

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

    // Update score display
    function updateScore() {
        currentScoreDisplay.textContent = currentScore;
        topScoreDisplay.textContent = topScore;
    }

    // Scroll background and collision object
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

    // Move character based on key input
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

    // Apply gravity to character
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

    // Resize game elements based on window size
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

    // Initialize collision objects
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

    // Prevent zoom on double-tap for mobile devices
    function preventZoom(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }

    // Toggle pause state
    function togglePause() {
        isPaused = !isPaused;
        if (!isPaused) {
            scrollBackground();
            applyGravity();
        }
    }

    // Load character images dynamically
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

    // Load background images dynamically
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

    // Initialize character and background buttons
    function initCharacterButton() {
        characterButton.addEventListener('click', () => {
            currentCharacterIndex = (currentCharacterIndex + 1) % characterImages.length;
            characterIcon.src = characterImages[currentCharacterIndex];
            character.src = characterImages[currentCharacterIndex];
        });
    }

    function initBackgroundButton() {
        backgroundButton.addEventListener('click', () => {
            currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
            backgroundIcon.src = backgroundImages[currentBackgroundIndex];
            background.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`;
        });
    }

    // Event listeners
    document.addEventListener('keydown', moveCharacter);
    document.addEventListener('touchstart', preventZoom, { passive: false });
    window.addEventListener('resize', resizeGame);
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            togglePause();
        }
    });

    // Initialize mobile controls
    document.getElementById('up-button').addEventListener('click', mobileControl);
    document.getElementById('down-button').addEventListener('click', mobileControl);
    document.getElementById('left-button').addEventListener('click', mobileControl);
    document.getElementById('right-button').addEventListener('click', mobileControl);

    // Initialize the game
    initCollisionObjects();
    loadCharacterImages();
    loadBackgroundImages();
    initCharacterButton();
    initBackgroundButton();

    // Start game loop
    scrollBackground();
    applyGravity();
    resizeGame();
});
