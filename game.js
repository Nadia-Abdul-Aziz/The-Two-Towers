let cube;
let obstacles = [];
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let megaObstacleSpawned = false;
const GROUND_HEIGHT = 60;
let startButton;
let backgroundSprite;
let bgX = 0;
let playerSprite;
let obstacleSprite;

function preload() {
    // Load your background sprite image here
    // Replace 'your-image-url.png' with your actual image URL
    backgroundSprite = loadImage('pixil-layer-0.png');
    
    // Load your player sprite image here
    // Replace 'player-image-url.png' with your actual image URL
    playerSprite = loadImage('pixil-layer-1.png');
    
    // Load your obstacle sprite image here
    // Replace 'obstacle-image-url.png' with your actual image URL
    obstacleSprite = loadImage('pixil-layer-2.png');
}

function setup() {
    // create a square canvas sized to fit the window (max 800)
    const canvasSize = min(800, windowWidth, windowHeight);
    const cnv = createCanvas(canvasSize, canvasSize);
    // center the canvas in the window
    cnv.position((windowWidth - canvasSize) / 2, (windowHeight - canvasSize) / 2);

    // initialize cube relative to canvas size
    cube = {
        x: 100,
        y: height - GROUND_HEIGHT - 150, // start on ground (cube size = 150)
        size: 150,
        velocity: 0,
        gravity: 1,
        jumpPower: -20,
        isJumping: false
    };

}

function startGame() {
    gameState = 'playing';
    obstacles = [];
    score = 0;
    megaObstacleSpawned = false;
    cube.y = height - GROUND_HEIGHT - cube.size;
    cube.velocity = 0;
}

function draw() {
    // Draw static background
    image(backgroundSprite, 0, 0, width, height);

    // Ground level (invisible)
    const groundY = height - GROUND_HEIGHT;

    if (gameState === 'start') {
        // Start screen
        fill(0);
        textSize(48);
        textAlign(CENTER, CENTER);
        text('OBSTACLE GAME', width / 2, height / 2 - 60);
        textSize(20);
        text('Press SPACE to jump', width / 2, height / 2 + 20);
        text('Avoid the obstacles!', width / 2, height / 2 + 50);
        text('Press SPACE to start', width / 2, height / 2 + 100);
        
    } else if (gameState === 'playing') {
        // Update cube
        cube.velocity += cube.gravity;
        cube.y += cube.velocity;

        // Ground collision
        if (cube.y >= groundY - cube.size) {
            cube.y = groundY - cube.size;
            cube.velocity = 0;
            cube.isJumping = false;
        }

        // Spawn obstacles
        if (frameCount % 90 === 0 && score < 20) {
            obstacles.push({
                x: width,
                y: groundY - 150,
                width: 120,
                height: 150,
                isMega: false
            });
        }

        // Spawn mega obstacle after 20 obstacles
        if (score >= 20 && !megaObstacleSpawned) {
            obstacles.push({
                x: width,
                y: 0,
                width: 50,
                height: groundY, // fill down to ground
                isMega: true
            });
            megaObstacleSpawned = true;
        }

        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= 5;

            // Draw obstacle
            image(obstacleSprite, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

            // Check collision
            if (cube.x < obstacles[i].x + obstacles[i].width &&
                cube.x + cube.size > obstacles[i].x &&
                cube.y < obstacles[i].y + obstacles[i].height &&
                cube.y + cube.size > obstacles[i].y) {
                gameState = 'gameOver';
            }

            // Remove off-screen obstacles and increase score
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                if (!obstacles[i] || !obstacles[i].isMega) {
                    score++;
                }
            }
        }

        // Draw cube
        image(playerSprite, cube.x, cube.y, cube.size, cube.size);

        // Draw score
        fill(0);
        textSize(24);
        textAlign(LEFT, BASELINE);
        text('Score: ' + score, 20, 30);
        
    } else if (gameState === 'gameOver') {
        // Game over screen
        fill(0);
        textSize(48);
        textAlign(CENTER, CENTER);
        text('GAME OVER', width / 2, height / 2 - 40);
        textSize(24);
        text('Score: ' + score, width / 2, height / 2);
        text('Press SPACE to restart', width / 2, height / 2 + 40);
    }
}

function keyPressed() {
    if (key === ' ') {
        if (gameState === 'start') {
            // Start game
            startGame();
        } else if (gameState === 'gameOver') {
            // Restart game
            gameState = 'playing';
            obstacles = [];
            score = 0;
            megaObstacleSpawned = false;
            cube.y = height - GROUND_HEIGHT - cube.size;
            cube.velocity = 0;
        } else if (gameState === 'playing' && !cube.isJumping) {
            // Jump
            cube.velocity = cube.jumpPower;
            cube.isJumping = true;
        }
    }
}