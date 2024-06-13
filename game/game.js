document.addEventListener('DOMContentLoaded', () => {
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    let bgPosition = 0;
    let gravity = 0.125;
    let velocity = 0;
    let isJumping = false;
    let scrollSpeed = 2;

    const collisionObjects = [
        { x: 100, y: 450, width: 100, height: 10 },
        { x: 300, y: 400, width: 100, height: 10 },
        { x: 600, y: 350, width: 100, height: 10 },
        { x: 900, y: 300, width: 100, height: 10 },
        { x: 1200, y: 250, width: 100, height: 10 },
        { x: 1500, y: 450, width: 100, height: 10 },
        { x: 1800, y: 400, width: 100, height: 10 },
        { x: 2100, y: 350, width: 100, height: 10 },
        { x: 2400, y: 300, width: 100, height: 10 },
        { x: 2700, y: 250, width: 100, height: 10 },
    ];

    function scrollBackground() {
        bgPosition -= scrollSpeed;
        background.style.backgroundPositionX = `${bgPosition}px`;

        collisionObjects.forEach((obj, index) => {
            obj.x -= scrollSpeed;

            if (obj.x + obj.width < 0) {
                obj.x += 3000; // Reset position to the right after it goes off screen to the left
            }

            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${obj.x}px`;
        });

        requestAnimationFrame(scrollBackground);
    }

    function moveCharacter(event) {
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
        } else if (left + character.offsetWidth > window.innerWidth) {
            character.style.left = `${window.innerWidth - character.offsetWidth}px`;
        }
    }

    function applyGravity() {
        let charTop = parseInt(window.getComputedStyle(character).top);
        let charLeft = parseInt(window.getComputedStyle(character).left);

        velocity += gravity;
        charTop += velocity;

        let onSurface = false;
        for (let obj of collisionObjects) {
            if (
                charLeft + character.offsetWidth > obj.x &&
                charLeft < obj.x + obj.width &&
                charTop + character.offsetHeight >= obj.y &&
                charTop + character.offsetHeight <= obj.y + obj.height
            ) {
                charTop = obj.y - character.offsetHeight;
                velocity = 0;
                isJumping = false;
                onSurface = true;
                break;
            }
        }

        if (charTop + character.offsetHeight > window.innerHeight && !onSurface) {
            charTop = 0;
            velocity = 0;
            isJumping = false;
        }

        character.style.top = `${charTop}px`;
        requestAnimationFrame(applyGravity);
    }

    function resizeGame() {
        const gameContainer = document.getElementById('game-container');
        const gameWidth = gameContainer.clientWidth;
        const gameHeight = gameContainer.clientHeight;

        character.style.width = `${gameWidth * 0.05}px`;
        character.style.height = 'auto';

        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.width = `${gameWidth * 0.033}px`;
            objElement.style.height = `${gameHeight * 0.016}px`;
        });
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

    window.addEventListener('keydown', moveCharacter);
    window.addEventListener('resize', resizeGame);

    document.getElementById('up-button').addEventListener('touchstart', mobileControl);
    document.getElementById('down-button').addEventListener('touchstart', mobileControl);
    document.getElementById('left-button').addEventListener('touchstart', mobileControl);
    document.getElementById('right-button').addEventListener('touchstart', mobileControl);

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });

    initCollisionObjects();
    resizeGame();
    scrollBackground();
    applyGravity();
});
