
                        let cube;
                        let obstacles = [];
                        let score = 0;
                        let gameOver = false;
                        let megaObstacleSpawned = false;
                        const GROUND_HEIGHT = 60;
function setup() {
    // create a square canvas sized to fit the window (max 800)
    const canvasSize = min(800, windowWidth, windowHeight);
    const cnv = createCanvas(canvasSize, canvasSize);
    // center the canvas in the window
    cnv.position((windowWidth - canvasSize) / 2, (windowHeight - canvasSize) / 2);

    // initialize cube relative to canvas size
    cube = {
        x: 100,
        y: height - GROUND_HEIGHT - 40, // start on ground (cube size = 40)
        size: 40,
        velocity: 0,
        gravity: 1,
        jumpPower: -15,
        isJumping: false
    };
}
