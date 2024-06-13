document.addEventListener('DOMContentLoaded', () => {
    const background = document.getElementById('background');
    const character = document.getElementById('character');
    let bgPosition = 0;
    let gravity = 0.25; // Reduced gravity to half the speed
    let velocity = 0;
    let isJumping = false;

    const collisionObjects = [
        { x: 100, y: 450, width: 100, height: 10 },
        { x: 300, y: 400, width: 100, height: 10 },
        // Add more collision objects as needed
    ];

    function scrollBackground() {
        bgPosition -= 2; // Adjust the speed of scrolling
        background.style.backgroundPositionX = bgPosition + 'px';
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
    }

    function applyGravity() {
        let charTop = parseInt(window.getComputedStyle(character).top);
        let charLeft = parseInt(window.getComputedStyle(character).left);

        velocity += gravity;
        charTop += velocity;

        let onSurface = false;
        for (let obj of collisionObjects) {
            if (charLeft + character.offsetWidth > obj.x && charLeft < obj.x + obj.width && charTop + character.offsetHeight >= obj.y && charTop + character.offsetHeight <= obj.y + obj.height) {
                charTop = obj.y - character.offsetHeight;
                velocity = 0;
                isJumping = false;
                onSurface = true;
            }
        }

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
    }

    window.addEventListener('keydown', moveCharacter);
    window.addEventListener('resize', resizeGame);

    scrollBackground();
    applyGravity();
    resizeGame(); // Initial resize
});
