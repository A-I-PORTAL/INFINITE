document.addEventListener('DOMContentLoaded', () => {
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    let bgPosition = 0;
    let gravity = 0.25; // Reduced gravity to half the speed
    let velocity = 0;
    let isJumping = false;
    let scrollSpeed = 2; // Background scroll speed

    const collisionObjects = [
        { x: 100, y: 450, width: 100, height: 10 },
        { x: 300, y: 400, width: 100, height: 10 },
        { x: 600, y: 350, width: 100, height: 10 },
        { x: 900, y: 300, width: 100, height: 10 },
        // Add more collision objects as needed
    ];

    function scrollBackground() {
        bgPosition -= scrollSpeed;
        background.style.backgroundPositionX = bgPosition + 'px';

        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            obj.x -= scrollSpeed;
            objElement.style.left = obj.x + 'px';
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
                    velocity = -10;
                    isJumping = true;
                }
                break;
            case 'ArrowDown':
                character.style.top = top + step + 'px';
                break;
            case 'ArrowLeft':
                character.style.left = left - step + 'px';
                break;
            case 'ArrowRight':
                character.style.left = left + step + 'px';
                break;
        }

        // Prevent character from scrolling off-screen horizontally
        if (left < 0) {
            character.style.left = '0px';
        } else if (left + character.offsetWidth > window.innerWidth) {
            character.style.left = window.innerWidth - character.offsetWidth + 'px';
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

        // Check if the character falls off the screen
        if (charTop + character.offsetHeight > window.innerHeight && !onSurface) {
            charTop = 0;
            velocity = 0;
            isJumping = false;
        }

        character.style.top = charTop + 'px';
        requestAnimationFrame(applyGravity);
    }

    function resizeGame() {
        const gameContainer = document.getElementById('game-container');
        const gameWidth = gameContainer.clientWidth;
        const gameHeight = gameContainer.clientHeight;

        character.style.width = gameWidth * 0.05 + 'px'; // Adjust character size proportionally
        character.style.height = 'auto';
    }

    function initCollisionObjects() {
        const gameContainer = document.getElementById('game-container');
        collisionObjects.forEach((obj, index) => {
            const div = document.createElement('div');
            div.classList.add('collision-object');
            div.id = `collision-object-${index}`;
            div.style.left = obj.x + 'px';
            div.style.top = obj.y + 'px';
            div.style.width = obj.width + 'px';
            div.style.height = obj.height + 'px';
            gameContainer.appendChild(div);
        });
    }

    window.addEventListener('keydown', moveCharacter);
    window.addEventListener('resize', resizeGame);

    scrollBackground();
    applyGravity();
    resizeGame(); // Initial resize
    initCollisionObjects(); // Initialize collision objects
});
