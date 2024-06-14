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
    const upButton = document.getElementById('up-button');
    const downButton = document.getElementById('down-button');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const pauseButton = document.getElementById('pause-button');

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
    const backgroundImages = [];
    let currentCharacterIndex = 0;
    let currentBackgroundIndex = 0;

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

    function handleControl(button) {
        if (isPaused) return;

        const step = 10;
        let left = parseInt(window.getComputedStyle(character).left);
        let top = parseInt(window.getComputedStyle(character).top);

        switch (button.id) {
            case 'up-button':
                if (!isJumping) {
                    velocity = -5;
                    isJumping = true;
                }
                break;
            case 'down-button':
                character.style.top = `${top + step}px`;
                break;
            case 'left-button':
                character.style.left = `${left - step}px`;
                break;
            case 'right-button':
                character.style.left = `${left + step}px`;
                break;
            case 'pause-button':
                isPaused = !isPaused;
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
                    velocity = 0.5; // small bounce
                }

                onSurface = true;
            }
        }

        if (!onSurface) {
            isJumping = true;
        }

        if (charTop + character.offsetHeight >= gameContainer.clientHeight) {
            charTop = gameContainer.clientHeight - character.offsetHeight;
            velocity = 0;
            isJumping = false;
        }

        character.style.top = `${charTop}px`;
        requestAnimationFrame(applyGravity);
    }

    function resizeGame() {
        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${obj.x}px`;
            objElement.style.top = `${obj.y}px`;
            objElement.style.width = `${obj.width}px`;
            objElement.style.height = `${obj.height}px`;
        });
    }

    function initCollisionObjects() {
        collisionObjects.forEach((obj, index) => {
            const objElement = document.createElement('div');
            objElement.className = 'collision-object';
            objElement.id = `collision-object-${index}`;
            objElement.style.left = `${obj.x}px`;
            objElement.style.top = `${obj.y}px`;
            objElement.style.width = `${obj.width}px`;
            objElement.style.height = `${obj.height}px`;
            gameContainer.appendChild(objElement);
        });
    }

    function loadCharacterImages() {
        let index = 1; // Starting from 1 for both characters and backgrounds
        while (true) {
            const imgPath = `assets/character${index}.png`;
            const img = new Image();
            img.src = imgPath;
            if (img.complete) {
                characterImages.push(imgPath);
            } else {
                break;
            }
            index++;
        }
    }

    function loadBackgroundImages() {
        let index = 1; // Starting from 1 for both characters and backgrounds
        while (true) {
            const imgPath = `assets/background${index}.jpg`;
            const img = new Image();
            img.src = imgPath;
            if (img.complete) {
                backgroundImages.push(imgPath);
            } else {
                break;
            }
            index++;
        }
    }

    function changeCharacter() {
        currentCharacterIndex = (currentCharacterIndex + 1) % characterImages.length;
        const newCharacter = characterImages[currentCharacterIndex];
        character.src = newCharacter;
        characterIcon.src = newCharacter;
    }

    function changeBackground() {
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
        const newBackground = backgroundImages[currentBackgroundIndex];
        background.style.backgroundImage = `url('${newBackground}')`;
        backgroundIcon.src = newBackground;
    }

    document.addEventListener('keydown', moveCharacter);
    speedSlider.addEventListener('input', () => {
        scrollSpeed = parseInt(speedSlider.value, 10);
    });

    characterButton.addEventListener('click', changeCharacter);
    backgroundButton.addEventListener('click', changeBackground);

    // Add touch and click event listeners for mobile controls
    [upButton, downButton, leftButton, rightButton, pauseButton].forEach(button => {
        button.addEventListener('click', () => handleControl(button));
        button.addEventListener('touchstart', () => handleControl(button));
    });

    function init() {
        initCollisionObjects();
        resizeGame();
        scrollBackground();
        applyGravity();
        updateScore();

        loadCharacterImages();
        loadBackgroundImages();
    }

    init();
});
