document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    let bgPosition = 0;
    let gravity = 0.125;
    let velocity = 0;
    let isJumping = false;
    let scrollSpeed = 2;
    let isPaused = false;

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

    function scrollBackground() {
        if (isPaused) return;
        bgPosition -= scrollSpeed;
        background.style.backgroundPositionX = `${bgPosition}px`;

        collisionObjects.forEach((obj, index) => {
            obj.x -= scrollSpeed;

            if (obj.x + obj.width < 0) {
                obj.x += 3000; // Reset position to the right after it goes off screen to the left
            }

            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${(obj.x / 800) * 100}vw`;
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
        for (let obj of collisionObjects) {
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
        }

        character.style.top = `${charTop}px`;
        character.style.left = `${charLeft}px`;
        requestAnimationFrame(applyGravity);
    }

    function resizeGame() {
        const gameWidth = gameContainer.clientWidth;
        const gameHeight = gameContainer.clientHeight;

        // Scale character proportionally to the game container
        const characterScale = gameWidth / 800; // Assuming 800 is the reference width
        character.style.width = `${characterScale * 50}px`; // 50 is the base width of the character
        character.style.height = 'auto';

        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${(obj.x / 800) * 100}vw`;
            objElement.style.top = `${(obj.y / 800) * 100}vh`;
            objElement.style.width = `${(obj.width / 800) * 100}vw`;
            objElement.style.height = `${(obj.height / 800) * 100}vh`;
         });

        // Ensure the game view adjusts correctly for mobile devices
        background.style.height = `${gameHeight}px`;
    }

    function initCollisionObjects() {
        const gameContainer = document.getElementById('game-container');
        collisionObjects.forEach((obj, index) => {
            const div = document.createElement('div');
            div.classList.add('collision-object');
            div.id = `collision-object-${index}`;
            div.style.left = `${(obj.x / 800) * 100}vw`;
            div.style.top = `${(obj.y / 800) * 100}vh`;
            div.style.width = `${(obj.width / 800) * 100}vw`;
            div.style.height = `${(obj.height / 800) * 100}vh`;
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

    window.addEventListener('resize', resizeGame);

    document.addEventListener('keydown', moveCharacter);

    document.getElementById('up-button').addEventListener('touchstart', mobileControl);
    document.getElementById('left-button').addEventListener('touchstart', mobileControl);
    document.getElementById('down-button').addEventListener('touchstart', mobileControl);
    document.getElementById('right-button').addEventListener('touchstart', mobileControl);

    const pauseButton = document.createElement('div');
    pauseButton.id = 'pause-button';
    pauseButton.className = 'control-button';
    pauseButton.innerText = '⏸️';
    document.getElementById('mobile-controls').appendChild(pauseButton);
    pauseButton.addEventListener('click', togglePause);

    window.addEventListener('touchstart', preventZoom, { passive: false });
    window.addEventListener('touchmove', preventZoom, { passive: false });

    initCollisionObjects();
    resizeGame();
    scrollBackground();
    applyGravity();
});
