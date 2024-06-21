document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript is running");
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
    const musicBtn = document.getElementById('musicBtn'); // Music button
    const levelButton = document.getElementById('level-button'); // Level button

    window.onload = function() {
        const videoModal = document.getElementById('video-modal');
        const closeVideoButton = document.getElementById('close-video-button');
        const introVideo = document.getElementById('intro-video');
        const musicButton = document.getElementById('musicBtn');
        let isMusicPlaying = false;
        let backgroundMusic = new Audio('assets/music.mp3');
        backgroundMusic.loop = true;

        // Start playing the video
        introVideo.play();

        // Add event listener to close button
        closeVideoButton.addEventListener('click', function() {
            videoModal.style.display = 'none';
            introVideo.pause();
        });

        // Ensure the modal is visible when the video is playing
        introVideo.addEventListener('playing', function() {
            videoModal.style.display = 'flex';
        });

        introVideo.addEventListener('pause', function() {
            videoModal.style.display = 'none';
        });

        // Music button functionality
        musicButton.addEventListener('click', function() {
            if (isMusicPlaying) {
                backgroundMusic.pause();
                musicButton.innerHTML = '<span id="music-icon">🔊</span>';
            } else {
                backgroundMusic.play();
                musicButton.innerHTML = '<span id="music-icon">🔇</span>';
            }
            isMusicPlaying = !isMusicPlaying;
        });

        // Other existing game logic...
    };

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
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        gameContainer.style.width = `${viewportWidth}px`;
        gameContainer.style.height = `${viewportHeight}px`;
        background.style.width = `${viewportWidth}px`;
        background.style.height = `${viewportHeight}px`;

        const characterScale = viewportWidth / 800;
        character.style.width = `${characterScale * 50}px`;
        character.style.height = 'auto';

        collisionObjects.forEach((obj, index) => {
            const objElement = document.getElementById(`collision-object-${index}`);
            objElement.style.left = `${obj.x}px`;
            objElement.style.top = `${obj.y}px`;
            objElement.style.width = `${obj.width}px`;
            objElement.style.height = `${obj.height}px`;
        });

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

    function changeLevel() {
        window.location.href = 'level3.html'; // Assuming level3.html is the next level's page
    }

    window.addEventListener('resize', () => {
        resizeGame();
        positionMobileControls();
    });

    function positionMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        mobileControls.style.left = '50%';
        mobileControls.style.bottom = '10%';
        mobileControls.style.transform = 'translate(-50%, 0)';
    }

    document.addEventListener('keydown', moveCharacter);

    document.querySelectorAll('.control-button').forEach(button => {
        button.addEventListener('touchstart', mobileControl);
        button.addEventListener('mousedown', mobileControl);
    });

    document.addEventListener('touchstart', preventZoom, { passive: false });

    characterButton.addEventListener('click', changeCharacter);
    backgroundButton.addEventListener('click', changeBackground);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    levelButton.addEventListener('click', changeLevel); // Add event listener for the level button

    speedSlider.addEventListener('input', () => {
        scrollSpeed = parseInt(speedSlider.value, 10);
    });

    // Add the music functionality
    const audio = new Audio();
    let currentTrackIndex = 0;

    // Dynamically generate the list of tracks
    const tracks = [];
    for (let i = 1; i <= 10; i++) { // Adjust the range as needed
        tracks.push(`assets/music${i}.mp3`);
    }

    function loadTrack(index) {
        if (index < tracks.length) {
            audio.src = tracks[index];
            audio.load();
            audio.onloadeddata = () => {
                audio.play().then(() => {
                    console.log(`Playing: ${tracks[index]}`);
                }).catch(error => {
                    console.error('Playback failed', error);
                });
            };
            audio.onerror = () => {
                console.error(`Error loading track: ${tracks[index]}`);
                // Try the next track if there's an error
                currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
                loadTrack(currentTrackIndex);
            };
        } else {
            console.error('Track index out of range');
        }
    }

    audio.loop = true;

    // Add a button to initiate the first play to comply with autoplay policies
    musicBtn.addEventListener('click', () => {
        if (audio.paused && currentTrackIndex === 0) {
            loadTrack(currentTrackIndex);
        } else {
            audio.pause();
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            loadTrack(currentTrackIndex);
        }
    });

    loadTrack(currentTrackIndex); // Start with the first track

    loadCharacterImages();
    loadBackgroundImages();
    initCollisionObjects();
    resizeGame();
    scrollBackground();
    applyGravity();
    updateScore();

    // Add additional required changes

    // Video Modal Controls
    const videoModal = document.getElementById("video-modal");
    const introVideo = document.getElementById("intro-video");
    const closeVideoButton = document.getElementById("close-video-button");

    closeVideoButton.addEventListener("click", function () {
        videoModal.style.display = "none";
        introVideo.pause();
    });

    // Music Button Controls
    const musicIcon = document.getElementById("music-icon");
    let musicOn = true;

    musicBtn.addEventListener("click", function () {
        musicOn = !musicOn;
        musicIcon.textContent = musicOn ? "🔊" : "🔇";
        // Toggle music logic here
    });

    // Character Button Controls
    const characterImages = ["assets/character1.png", "assets/character2.png", "assets/character3.png"];
    let currentCharacterIndex = 0;

    characterButton.addEventListener("click", function () {
        currentCharacterIndex = (currentCharacterIndex + 1) % characterImages.length;
        character.src = characterImages[currentCharacterIndex];
        characterIcon.src = characterImages[currentCharacterIndex];
    });

    // Background Button Controls
    const backgroundImages = ["assets/background1.jpg", "assets/background2.jpg", "assets/background3.jpg"];
    let currentBackgroundIndex = 0;

    backgroundButton.addEventListener("click", function () {
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
        background.style.backgroundImage = `url(${backgroundImages[currentBackgroundIndex]})`;
        backgroundIcon.src = backgroundImages[currentBackgroundIndex];
    });

    // Mobile Controls
    const upButton = document.getElementById("up-button");
    const leftButton = document.getElementById("left-button");
    const downButton = document.getElementById("down-button");
    const rightButton = document.getElementById("right-button");
    const pauseButton = document.getElementById("pause-button");

    upButton.addEventListener("click", function () {
        console.log("Up button clicked");
        // Add movement logic here
    });

    leftButton.addEventListener("click", function () {
        console.log("Left button clicked");
        // Add movement logic here
    });

    downButton.addEventListener("click", function () {
        console.log("Down button clicked");
        // Add movement logic here
    });

    rightButton.addEventListener("click", function () {
        console.log("Right button clicked");
        // Add movement logic here
    });

    pauseButton.addEventListener("click", function () {
        console.log("Pause button clicked");
        // Add pause logic here
    });

    // Speed Slider Controls
    speedSlider.addEventListener("input", function () {
        const speed = speedSlider.value;
        console.log(`Speed set to ${speed}`);
        // Adjust speed logic here
    });

    // Score Display Logic
    const currentScoreElem = document.getElementById("current-score");
    const topScoreElem = document.getElementById("top-score");
    let currentScore = 0;
    let topScore = 0;

    function updateScore() {
        currentScore++;
        currentScoreElem.textContent = currentScore;
        if (currentScore > topScore) {
            topScore = currentScore;
            topScoreElem.textContent = topScore;
        }
    }

    // Example score update interval
    setInterval(updateScore, 1000);
});
