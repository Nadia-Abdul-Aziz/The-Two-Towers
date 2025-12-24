let cube;
let obstacles = [];
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let megaObstacleSpawned = false;
let obstacleCount = 0; // Track number of obstacles spawned
let megaObstacleTimer = 0; // Timer for mega obstacle delay
const GROUND_HEIGHT_RATIO = 0.1; // Ground is 10% of height
let backgroundSprite;
let playerSprite;
let obstacleSprites = [];
let deathSprite1; // pixil-layer-6.png
let deathSprite2; // pixil-layer-7.png
let killedByMega = false; // Track if killed by mega obstacle
let deathTimer = 0; // Timer for death animation
let fadeAlpha = 0; // Alpha for white fade
let themeMusic;
let propPlaneSound;
let explosionSound;
let gameStartFrame = 0; // Track when game started for speed scaling
let lastSpawnFrame = 0; // Track last obstacle spawn

function preload() {
    backgroundSprite = loadImage('pixil-layer-0.png');
    playerSprite = loadImage('pixil-layer-1.png');
    obstacleSprites.push(loadImage('pixil-layer-2.png'));
    obstacleSprites.push(loadImage('pixil-layer-3.png'));
    obstacleSprites.push(loadImage('pixil-layer-4.png'));
    obstacleSprites.push(loadImage('pixil-layer-5.png'));
    deathSprite1 = loadImage('pixil-layer-6.png');
    deathSprite2 = loadImage('pixil-layer-7.png');
    themeMusic = loadSound('Kirby dream land theme song.mp3');
    propPlaneSound = loadSound('Prop Plane Crash Sound Effect.mp3');
    explosionSound = loadSound('Big Explosion Sound Effect.mp3');
}

function setup() {
    const canvasSize = min(800, windowWidth, windowHeight);
    const cnv = createCanvas(canvasSize, canvasSize);
    cnv.position((windowWidth - canvasSize) / 2, (windowHeight - canvasSize) / 2);

    // Calculate proportions based on canvas size
    let pHeight = height * 0.12; // Player is 12% of screen height
    let pWidth = pHeight * 1.2; // Make player wider (adjust ratio as needed)
    let groundHeight = height * GROUND_HEIGHT_RATIO;

    cube = {
        x: width * 0.15,
        y: height * 0.85, // Start a bit higher (85% down the screen)
        width: pWidth,
        height: pHeight,
        velocity: 0,
        gravity: height * 0.0009,    // Scales physics to screen height
        jumpPower: height * -0.027,  // Scales jump to screen height
        isJumping: false
    };
}

function startGame() {
    gameState = 'playing';
    obstacles = [];
    score = 0;
    obstacleCount = 0;
    megaObstacleSpawned = false;
    megaObstacleTimer = 0;
    killedByMega = false;
    deathTimer = 0;
    fadeAlpha = 0;
    cube.y = height * 0.85;
    cube.velocity = 0;
    gameStartFrame = frameCount; // Record when game started
    lastSpawnFrame = frameCount; // Reset spawn tracker
    
    // Start theme music when game starts
    if (themeMusic && !themeMusic.isPlaying()) {
        themeMusic.loop();
    }
}

function draw() {
    image(backgroundSprite, 0, 0, width, height);

    const groundY = height - (height * GROUND_HEIGHT_RATIO);

    if (gameState === 'start') {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(height * 0.07);
        text('11111', width / 2, height / 2 - 40);
        textSize(height * 0.03);
        text('TAP TO START!', width / 2, height / 2 + 40);
    } else if (gameState === 'playing') {
        updatePlayer(groundY);
        handleObstacles(groundY);
        
        // Draw Player with proportionate size
        image(playerSprite, cube.x, cube.y, cube.width, cube.height);
        
    } else if (gameState === 'megaDeath') {
        // Draw the frozen game state
        
        // Draw all obstacles in their final positions
        for (let i = 0; i < obstacles.length; i++) {
            let spriteToUse = obstacleSprites[obstacles[i].spriteIndex];
            image(spriteToUse, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        }
        
        // Draw death sprites behind the player
        image(deathSprite1, cube.x, cube.y, cube.width, cube.height);
        image(deathSprite2, cube.x, cube.y, cube.width, cube.height);
        // Duplicate of sprite 6 offset to the right and bigger
        let duplicateWidth = cube.width * 1.5;
        let duplicateHeight = cube.height * 1.5;
        image(deathSprite1, cube.x + 60, cube.y - 15, duplicateWidth, duplicateHeight);
        
        // Draw Player with proportionate size (on top)
        image(playerSprite, cube.x, cube.y, cube.width, cube.height);
        
        // Handle fade to white after 3 seconds
        let timeSinceDeath = frameCount - deathTimer;
        if (timeSinceDeath >= 180) { // 3 seconds at 60fps
            // Start fading to white slowly
            fadeAlpha = min(255, (timeSinceDeath - 180) * 1.5); // Slow fade
            fill(255, 255, 255, fadeAlpha);
            rect(0, 0, width, height);
        }
        
    } else if (gameState === 'gameOver') {
        // Draw the frozen game state
        
        // Draw all obstacles in their final positions
        for (let i = 0; i < obstacles.length; i++) {
            let spriteToUse = obstacleSprites[obstacles[i].spriteIndex];
            image(spriteToUse, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        }
        
        // Draw death sprites behind the player (only if killed by mega obstacle)
        if (killedByMega) {
            image(deathSprite1, cube.x, cube.y, cube.width, cube.height);
            image(deathSprite2, cube.x, cube.y, cube.width, cube.height);
            // Duplicate of sprite 6 offset to the right and bigger
            let duplicateWidth = cube.width * 1.5;
            let duplicateHeight = cube.height * 1.5;
            image(deathSprite1, cube.x + 60, cube.y - 15, duplicateWidth, duplicateHeight);
        }
        
        // Draw Player with proportionate size (on top)
        image(playerSprite, cube.x, cube.y, cube.width, cube.height);
        
        // Draw game over text without darkening overlay
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(height * 0.07);
        text('GAME OVER', width / 2, height / 2 - 40);
        textSize(height * 0.03);
        text('Score: ' + score + '\nTap to restart', width / 2, height / 2 + 40);
    }
}

function updatePlayer(groundY) {
    cube.velocity += cube.gravity;
    cube.y += cube.velocity;

    // Ground is now at 85% of screen height
    let ground = height * 0.85;
    if (cube.y >= ground) {
        cube.y = ground;
        cube.velocity = 0;
        cube.isJumping = false;
    }
}

function handleObstacles(groundY) {
    // Proportional obstacle sizing
    let standardObsSize = height * 0.1;

    // Calculate speed multiplier for spawn rate adjustment
    let secondsElapsed = (frameCount - gameStartFrame) / 60;
    let speedMultiplier = 1 + (secondsElapsed * 0.02);
    speedMultiplier = min(speedMultiplier, 2.5);
    
    // Adjust spawn rate based on speed - spawn more frequently as speed increases
    let spawnInterval = 90 / speedMultiplier; // Spawn faster as speed increases

    // Spawn regular obstacles at the very bottom of the screen
    if (frameCount - lastSpawnFrame >= spawnInterval && score < 20) {
        lastSpawnFrame = frameCount;
        let currentSpriteIndex = floor(obstacleCount / 7) % obstacleSprites.length;
        let heightMultiplier = 1 + (currentSpriteIndex * 0.7); // 0.7x multiplier
        
        // Special scaling for sprite 4 (index 2)
        if (currentSpriteIndex === 2) {
            heightMultiplier = 1 + (currentSpriteIndex * 1.2); // 1.2 multiplier for sprite 4 (increased from 1.0)
        }
        
        let obsHeight = standardObsSize * heightMultiplier;
        
        obstacles.push({
            x: width,
            y: height - obsHeight, // Position at very bottom of screen
            width: standardObsSize,
            height: obsHeight,
            isMega: false,
            spriteIndex: currentSpriteIndex,
            soundPlayed: false
        });
        obstacleCount++;
    }

    // Start timer when score reaches 20
    if (score >= 20 && !megaObstacleSpawned && megaObstacleTimer === 0) {
        megaObstacleTimer = frameCount;
    }

    // Spawn mega obstacle after 1 second delay (60 frames at 60fps)
    if (megaObstacleTimer > 0 && frameCount - megaObstacleTimer >= 60 && !megaObstacleSpawned) {
        let megaHeight = height * 0.7; // Mega obstacle is 70% of screen height (increased from 50%)
        obstacles.push({
            x: width,
            y: height - megaHeight, // Position lower on screen
            width: height * 0.2, // Increased width from 0.15 to 0.2
            height: megaHeight, 
            isMega: true,
            spriteIndex: 3, // Use sprite 5 (index 3 in the array)
            soundPlayed: false
        });
        megaObstacleSpawned = true;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        // Calculate speed multiplier based on time elapsed
        let secondsElapsed = (frameCount - gameStartFrame) / 60; // Convert frames to seconds
        let speedMultiplier = 1 + (secondsElapsed * 0.02); // Increase speed by 2% per second
        speedMultiplier = min(speedMultiplier, 2.5); // Cap at 2.5x speed
        
        obstacles[i].x -= (width * 0.008 * speedMultiplier); // Speed scales with width and time

        // Draw obstacle with proportionate size
        let spriteToUse = obstacleSprites[obstacles[i].spriteIndex];
        image(spriteToUse, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

        // Collision Detection (with slightly smaller hitbox)
        let hitboxPadding = 5; // 5 pixel padding on all sides
        
        // For sprite 4 (index 2), adjust the hitbox to only check the lower portion
        let obstacleHitboxY = obstacles[i].y;
        let obstacleHitboxHeight = obstacles[i].height;
        
        if (obstacles[i].spriteIndex === 2) {
            // Only check collision with bottom 60% of sprite 4
            let topOffset = obstacles[i].height * 0.4;
            obstacleHitboxY = obstacles[i].y + topOffset;
            obstacleHitboxHeight = obstacles[i].height * 0.6;
        }
        
        // Early sound trigger detection (larger hitbox for sound only)
        let soundTriggerDistance = 40; // Pixels ahead to trigger sound (increased for earlier trigger)
        if (!obstacles[i].soundPlayed &&
            cube.x + cube.width + soundTriggerDistance > obstacles[i].x &&
            cube.x < obstacles[i].x + obstacles[i].width &&
            cube.y + hitboxPadding < obstacleHitboxY + obstacleHitboxHeight - hitboxPadding &&
            cube.y + cube.height - hitboxPadding > obstacleHitboxY + hitboxPadding) {
            // Play sound early and skip the silent beginning
            if (obstacles[i].isMega) {
                if (explosionSound) {
                    explosionSound.play(0, 1, 1, 0.1); // Start at 0.1 seconds to skip silence
                }
            } else {
                if (propPlaneSound) {
                    propPlaneSound.play(0, 1, 1, 0.15); // Start at 0.15 seconds to skip silence
                }
            }
            obstacles[i].soundPlayed = true;
        }
        
        if (cube.x + hitboxPadding < obstacles[i].x + obstacles[i].width - hitboxPadding &&
            cube.x + cube.width - hitboxPadding > obstacles[i].x + hitboxPadding &&
            cube.y + hitboxPadding < obstacleHitboxY + obstacleHitboxHeight - hitboxPadding &&
            cube.y + cube.height - hitboxPadding > obstacleHitboxY + hitboxPadding) {
            if (obstacles[i].isMega) {
                killedByMega = true;
                deathTimer = frameCount; // Start death timer
                gameState = 'megaDeath';
                // Stop theme music
                if (themeMusic && themeMusic.isPlaying()) {
                    themeMusic.stop();
                }
            } else {
                gameState = 'gameOver';
                // Stop theme music
                if (themeMusic && themeMusic.isPlaying()) {
                    themeMusic.stop();
                }
            }
        }

        // Cleanup and Scoring
        if (obstacles[i].x + obstacles[i].width < 0) {
            if (!obstacles[i].isMega) score++;
            obstacles.splice(i, 1);
        }
    }
}

function drawOverlay(title, subtitle) {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(height * 0.07);
    text(title, width / 2, height / 2 - 40);
    textSize(height * 0.03);
    text(subtitle, width / 2, height / 2 + 40);
}

function mousePressed() {
    handleInput();
    return false; // Prevent default behavior
}

function touchStarted() {
    handleInput();
    return false; // Prevent default behavior on mobile
}

function handleInput() {
    if (gameState === 'start' || gameState === 'gameOver') {
        startGame();
    } else if (gameState === 'playing' && !cube.isJumping) {
        cube.velocity = cube.jumpPower;
        cube.isJumping = true;
    } else if (gameState === 'megaDeath') {
        // Allow restart during white fade
        let timeSinceDeath = frameCount - deathTimer;
        if (timeSinceDeath >= 180) {
            startGame();
        }
    }
}