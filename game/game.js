document.addEventListener('DOMContentLoaded', () => {
    const background = document.getElementById('background');
    let bgPosition = 0;

    function scrollBackground() {
        bgPosition -= 2; // Adjust the speed of scrolling
        background.style.backgroundPositionX = bgPosition + 'px';
        requestAnimationFrame(scrollBackground);
    }

    function moveCharacter(event) {
        const character = document.getElementById('character');
        const step = 10;
        let left = parseInt(window.getComputedStyle(character).left);

        switch (event.key) {
            case 'ArrowUp':
                character.style.top = parseInt(window.getComputedStyle(character).top) - step + 'px';
                break;
            case 'ArrowDown':
                character.style.top = parseInt(window.getComputedStyle(character).top) + step + 'px';
                break;
            case 'ArrowLeft':
                character.style.left = left - step + 'px';
                break;
            case 'ArrowRight':
                character.style.left = left + step + 'px';
                break;
        }
    }

    document.addEventListener('keydown', moveCharacter);
    scrollBackground();
});
