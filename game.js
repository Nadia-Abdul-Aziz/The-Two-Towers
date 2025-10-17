//states
const GAME_PLAYING = 'playing';
const GAME_OVER = 'game over';
const GAME_WON = 'game won';
const FINAL_CHALLENGE = 'final challenge';

//images
let spiderImage;
let bossImage;

function preload() {
    // Preload game images before the game starts
    spiderImage = loadImage('plane.png');
}

// Initialize the current game state to playing
let gameState = GAME_PLAYING;

// Typed.js related variables 
let gameOverInitialized = false;
let gameWonInitialized = false;

// Variables for managing the final challenge delay
let finalChallengeDelay = 100; // 3 seconds * 60 frames 
let finalChallengeTimer = 0;   // Timer to track final challenge start

// Array to store background motion lines for visual effect
let backgroundLines = [];

//for final challenge state
let finalChallengeInitiated = false;
let finalObstacle = null;

// Player object
let plane = {
    x: 150,
    y: 0,
    size: 50,
    ySpeed: 0,
    speed: 6,
    isOnGround: true //track if spider is on the ground, else he was floating
};

// Game configuration
let game = {
    gravity: 0.6,                // Gravity effect for jumping mechanics
    obstacles: [],                // Array to store obstacles
    delayTime: 3 * 60,            // Delay before boss becomes active
    speedMultiplier: 1,           // Global speed multiplier
    speedIncreaseInterval: 300    // Interval for increasing game speed
};

// Store initial game state for proper reset functionality
//GAME WAS NOT RESETTING PROPERLY SO CLAUDE DID THIS!!!
const INITIAL_STATE = {
    spider: { /* initial spider properties */ },
    boss: { /* initial boss properties */ },
    game: { /* initial game properties */ }
};

function setup() {
    // Initialize the game canvas and set initial positions
    createCanvas(640, 480);
    spider.y = height - spider.size;  // Position spider at bottom of screen
    boss.y = height - boss.size;       // Position boss at bottom of screen
    game.obstacles.push(createObstacle());  // Create initial obstacle

    // Initialize background motion lines
    initializeBackgroundLines();
}

// Function to initialize background motion lines for visual effect
function initializeBackgroundLines() {
    backgroundLines = [];  // Reset background lines array
    // Create 20 random background lines with varying properties
    for (let i = 0; i < 20; i++) {
        backgroundLines.push({
            x: random(width),        // Random horizontal starting position
            y: random(height - 80),  // Random vertical position (leaving bottom space)
            length: random(20, 60),  // Random line length
            speed: random(3, 6)      // Random movement speed
        });
    }
}

function draw() {
    background("black");
    drawMotionLines();
    drawBorder();

    // Game state switch
    switch (gameState) {
        case GAME_PLAYING:
            updateGame();
            break;
        case GAME_OVER:
            if (!gameOverInitialized) {
                initializeGameOver();
                gameOverInitialized = true;
            }
            break;
        case GAME_WON:
            if (!gameWonInitialized) {
                initializeGameWon();
                gameWonInitialized = true;
            }
            break;
    }
}

// Function to draw moving background lines
function drawMotionLines() {
    stroke(255, 40);
    strokeWeight(1);

    for (let line of backgroundLines) {
        // Move line to the left based on its speed and game speed multiplier
        line.x -= line.speed * game.speedMultiplier;

        // Reset line when it moves off the left side of the screen
        if (line.x + line.length < 0) {
            line.x = width;
            line.y = random(height - 80);  // Randomize vertical position
            line.length = random(20, 60);  // Randomize line length
        }

        // Draw the line
        beginShape();
        vertex(line.x, line.y);
        vertex(line.x + line.length, line.y);
        endShape();
    }
}

// Function to draw a white border around the game canvas
function drawBorder() {
    push();
    noFill();
    stroke(255);
    strokeWeight(5);
    rect(0, 0, width, height);
    pop();
}


function updateGame() {
    // Initiate final challenge when speed reaches 2x
    if (game.speedMultiplier >= 2 && !finalChallengeInitiated) {
        finalChallengeInitiated = true;
        finalChallengeTimer = finalChallengeDelay;
        game.obstacles = [];  // Clear existing obstacles
    }

    // Handle final challenge delay and obstacle creation
    if (finalChallengeInitiated && finalObstacle === null) {
        finalChallengeTimer--;
        if (finalChallengeTimer <= 0) {
            createFinalObstacle();  // Create final obstacle when timer expires
        }
    }

    // Gradually increase game speed (cap at 2x)
    if (frameCount % game.speedIncreaseInterval === 0 && game.speedMultiplier < 2) {
        game.speedMultiplier += 0.5;
    }

    // Activate boss movement after initial delay
    if (frameCount > game.delayTime) {
        boss.active = true;
    }

    // Player movement controls
    // Move right
    if (keyIsDown(RIGHT_ARROW) && spider.x < width - spider.size) {
        spider.x += spider.speed;
    }
    // Move left
    else if (keyIsDown(LEFT_ARROW) && spider.x > 0) {
        spider.x -= spider.speed;
    }

    // Jumping 
    if (keyIsDown(32) && spider.isOnGround) {  // Spacebar
        spider.ySpeed = -12;
        spider.isOnGround = false;
    }

    // Boss movement tracking player
    if (boss.active) {
        if (boss.x < spider.x) {
            boss.x += boss.speed;  // Move right towards player
        } else if (boss.x > spider.x) {
            boss.x -= boss.speed;  // Move left towards player
        }
    }

    // Update player and boss positions
    updateSpider();
    showSpider();
    showBoss();

    // Check for boss collision with player
    if (checkBossCollision() && spider.isOnGround) {
        gameState = GAME_OVER;
    }

    // Final obstacle logic
    if (finalObstacle) {
        updateFinalObstacle();
        showFinalObstacle();

        // Check if boss hits final obstacle, trigger game won
        if (checkBossFinalObstacleCollision()) {
            gameState = GAME_WON;
        }

        // Check if player hits final obstacle, trigger game lost
        if (checkPlayerFinalObstacleCollision()) {
            gameState = GAME_OVER;
        }
    }

    // Create new obstacles
    if (!finalChallengeInitiated && frameCount % 90 === 0) {
        game.obstacles.push(createObstacle());
    }

    // Update and check collision with regular obstacles
    //CLAUDE USED!!
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        updateObstacle(game.obstacles[i]);
        showObstacle(game.obstacles[i]);

        // Check if player collides with obstacle
        if (checkCollision(game.obstacles[i])) {
            gameState = GAME_OVER;
        }

        // Remove obstacles that have moved off-screen
        if (game.obstacles[i].x + game.obstacles[i].base < 0) {
            game.obstacles.splice(i, 1);
        }
    }

    // // Display current game speed text, not needed, commented out
    // textSize(20);
    // fill(255);
    // noStroke();
    // text('Speed: ' + game.speedMultiplier.toFixed(1) + 'x', 10, 30);
}

//the mountain
function createFinalObstacle() {
    finalObstacle = {
        x: width,                 // Start at right edge of screen
        y: height - 100,          // Positioned higher than regular obstacles
        base: 60,                 // Wider than regular obstacles
        height: 80,               // Taller obstacle height
        speed: 2                  // Slower movement speed
    };

    // get rid of existing obstacles
    game.obstacles = [];
}

// Update the position of the final obstacle
function updateFinalObstacle() {
    if (finalObstacle) {
        // Move obstacle left based on game speed
        finalObstacle.x -= finalObstacle.speed * game.speedMultiplier;
    }
}

// Draw the mountain
function showFinalObstacle() {
    if (finalObstacle) {
        fill(255, 215, 0);  // yellow
        triangle(
            finalObstacle.x, height,
            finalObstacle.x + finalObstacle.base / 2, finalObstacle.y,
            finalObstacle.x + finalObstacle.base, height
        );
    }
}

// Check if boss collides with final obstacle
// CLAUDE HELPED!!!
function checkBossFinalObstacleCollision() {
    if (!finalObstacle) return false;

    return (
        boss.x < finalObstacle.x + finalObstacle.base &&  // Right side of boss is left of obstacle's right
        boss.x + boss.size > finalObstacle.x &&           // Left side of boss is right of obstacle's left
        boss.y + boss.size > finalObstacle.y              // Boss is below obstacle's top
    );
}

// Check if player collides with final obstacle
function checkPlayerFinalObstacleCollision() {
    if (!finalObstacle) return false;

    return (
        spider.x < finalObstacle.x + finalObstacle.base &&  // Right side of spider is left of obstacle's right
        spider.x + spider.size > finalObstacle.x &&         // Left side of spider is right of obstacle's left
        spider.y + spider.size > finalObstacle.y            // Spider is below obstacle's top
    );
}

// Initialize game over screen with typed text animations
//Same as all other ones
function initializeGameOver() {
    let gameOverElement = createDiv('');
    gameOverElement.position(0, 0);
    gameOverElement.style('width', '100%');
    gameOverElement.style('height', '100%');
    gameOverElement.style('display', 'flex');
    gameOverElement.style('flex-direction', 'column');
    gameOverElement.style('justify-content', 'center');
    gameOverElement.style('align-items', 'center');
    gameOverElement.style('font-family', 'Courier New');
    gameOverElement.style('color', 'white');
    gameOverElement.style('text-align', 'center');
    gameOverElement.style('position', 'absolute');
    gameOverElement.style('top', '0');
    gameOverElement.style('left', '0');

    let gameOverTitle = createDiv('');
    gameOverTitle.parent(gameOverElement);
    gameOverTitle.style('font-size', '40px');
    gameOverTitle.style('margin-bottom', '20px');

    let typedElement = createDiv('');
    typedElement.parent(gameOverElement);
    typedElement.style('width', '300px');
    typedElement.style('font-size', '16px');

    let restartPrompt = createDiv('');
    restartPrompt.parent(gameOverElement);
    restartPrompt.style('font-size', '20px');
    restartPrompt.style('margin-top', '20px');

    new Typed(gameOverTitle.elt, {
        strings: ['GAME OVER'],
        typeSpeed: 40,
        showCursor: false,
        onComplete: () => {
            new Typed(typedElement.elt, {
                strings: [
                    'The Chase is Over...',
                    'The Obstacles Were Too Much...'
                ],
                typeSpeed: 40,
                backSpeed: 30,
                backDelay: 1000,
                startDelay: 500,
                showCursor: false,
                onComplete: () => {
                    new Typed(restartPrompt.elt, {
                        strings: ['Press SPACEBAR to try again'],
                        typeSpeed: 40,
                        showCursor: true,
                        onComplete: (self) => {
                            self.cursor.style.display = 'inline-block';
                        }
                    });
                }
            });
        }
    });
}

function initializeGameWon() {
    let gameWonElement = createDiv('');
    gameWonElement.position(0, 0);
    gameWonElement.style('width', '100%');
    gameWonElement.style('height', '100%');
    gameWonElement.style('display', 'flex');
    gameWonElement.style('flex-direction', 'column');
    gameWonElement.style('justify-content', 'center');
    gameWonElement.style('align-items', 'center');
    gameWonElement.style('font-family', 'Courier New');
    gameWonElement.style('color', 'white');
    gameWonElement.style('text-align', 'center');
    gameWonElement.style('position', 'absolute');
    gameWonElement.style('top', '0');
    gameWonElement.style('left', '0');

    let gameWonTitle = createDiv('');
    gameWonTitle.parent(gameWonElement);
    gameWonTitle.style('font-size', '20px');
    gameWonTitle.style('margin-bottom', '20px');

    let nextPageLink = createA('yesWinner.html', 'Continue');
    nextPageLink.parent(gameWonElement);
    nextPageLink.style('font-size', '20px');
    nextPageLink.style('font-family', 'Courier New');
    nextPageLink.style('margin-top', '20px');
    nextPageLink.style('padding', '10px 20px');
    nextPageLink.style('cursor', 'pointer');
    nextPageLink.style('background-color', 'white');
    nextPageLink.style('color', 'black');
    nextPageLink.style('text-decoration', 'none');
    nextPageLink.style('display', 'none');

    new Typed(gameWonTitle.elt, {
        strings: ['You Led Bugzilla Right Into the Trap!'],
        typeSpeed: 20,
        showCursor: false,
        onComplete: () => {
            // Show continue link after typing
            nextPageLink.style('display', 'block');
        }
    });
}

// move houston vertically and apply gravity
function updateSpider() {
    spider.y += spider.ySpeed;
    spider.ySpeed += game.gravity;

    // Check ground collision
    //fixing that bug that houston was either floating or below canvas
    if (spider.y >= height - spider.size) {
        spider.y = height - spider.size;  // Prevent going below ground
        spider.ySpeed = 0;  // Stop vertical movement
        spider.isOnGround = true;  // Reset ground flag
    }
}

// Draw houston image
function showSpider() {
    imageMode(CORNER);
    image(spiderImage, spider.x, spider.y, spider.size, spider.size);
}

// Draw bugzilla image
function showBoss() {
    imageMode(CORNER);
    image(bossImage, boss.x, boss.y, boss.size, boss.size);
}

// Create a new obstacle with random properties
function createObstacle() {
    return {
        x: width,  // Start at right edge of screen
        y: height - 20,  // Bottom positioning
        base: random(10, 30),  // Random base width
        height: random(30, 70),  // Random height
        speed: 4  // Movement speed
    };
}

// Update obstacle position based on game speed
function updateObstacle(obstacle) {
    obstacle.x -= obstacle.speed * game.speedMultiplier;
}

// Draw obstacle as a white triangle
function showObstacle(obstacle) {
    fill(255);
    triangle(
        obstacle.x, height,
        obstacle.x + obstacle.base / 2, height - obstacle.height,
        obstacle.x + obstacle.base, height
    );
}

// Check collision between spider and boss
function checkBossCollision() {
    return (
        spider.x < boss.x + boss.size &&
        spider.x + spider.size > boss.x &&
        spider.y + spider.size > boss.y
    );
}

// Check collision between spider and an obstacle
function checkCollision(obstacle) {
    return (
        spider.x < obstacle.x + obstacle.base &&
        spider.x + spider.size > obstacle.x &&
        spider.y + spider.size > height - obstacle.height
    );
}

// Handle spacebar press for game restart
function keyPressed() {
    if (keyCode === 32 && gameState === GAME_OVER) {
        resetGame();
    }
}

// Reset entire game to initial state
//ASKED CLAUDE TO REDO THIS BECAUSE MY GAME WAS NOT RESETTING RIGHT!!
function resetGame() {
    // Reset game state
    gameState = GAME_PLAYING;
    gameOverInitialized = false;
    gameWonInitialized = false;

    // Reset player (spider) to initial position and properties
    spider.x = INITIAL_STATE.spider.x;
    spider.y = height - INITIAL_STATE.spider.size;
    spider.ySpeed = INITIAL_STATE.spider.ySpeed;
    spider.speed = INITIAL_STATE.spider.speed;
    spider.isOnGround = INITIAL_STATE.spider.isOnGround;

    // Reset boss to initial position and properties
    boss.x = INITIAL_STATE.boss.x;
    boss.y = height - boss.size
    boss.speed = INITIAL_STATE.boss.speed;
    boss.active = INITIAL_STATE.boss.active;

    // Reset game properties
    game.obstacles = [];
    game.speedMultiplier = INITIAL_STATE.game.speedMultiplier;
    game.gravity = INITIAL_STATE.game.gravity;
    game.delayTime = INITIAL_STATE.game.delayTime;
    game.speedIncreaseInterval = INITIAL_STATE.game.speedIncreaseInterval;

    // Reset final challenge stuff
    finalChallengeInitiated = false;
    finalObstacle = null;
    finalChallengeTimer = 0;

    // Reset frame count
    frameCount = 0;

    // Reinitialize background lines
    initializeBackgroundLines();

    // Remove any existing UI elements
    removeElements();
}