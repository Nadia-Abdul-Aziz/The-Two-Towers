
                        let cube;
                        let obstacles = [];
                        let score = 0;
                        let gameOver = false;
                        let megaObstacleSpawned = false;

                        function setup() {
                            createCanvas(800, 400);
                        cube = {
                            x: 100,
                        y: 300,
                        size: 40,
                        velocity: 0,
                        gravity: 1,
                        jumpPower: -15,
                        isJumping: false
            };
        }

                        function draw() {
                            background(135, 206, 235);

                        // Draw ground
                        fill(100, 150, 50);
                        rect(0, 340, 800, 60);

                        if (!gameOver) {
                            // Update cube
                            cube.velocity += cube.gravity;
                        cube.y += cube.velocity;

                // Ground collision
                if (cube.y >= 300) {
                            cube.y = 300;
                        cube.velocity = 0;
                        cube.isJumping = false;
                }

                        // Spawn obstacles
                        if (frameCount % 90 === 0 && score < 20) {
                            obstacles.push({
                                x: 800,
                                y: 310,
                                width: 30,
                                height: 40,
                                isMega: false
                            });
                }

                // Spawn mega obstacle after 20 obstacles
                if (score >= 20 && !megaObstacleSpawned) {
                            obstacles.push({
                                x: 800,
                                y: 0,
                                width: 50,
                                height: 340,
                                isMega: true
                            });
                        megaObstacleSpawned = true;
                }

                // Update and draw obstacles
                for (let i = obstacles.length - 1; i >= 0; i--) {
                            obstacles[i].x -= 5;

                        // Draw obstacle
                        if (obstacles[i].isMega) {
                            fill(100, 20, 20);
                    } else {
                            fill(150, 50, 50);
                    }
                        rect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

                        // Check collision
                        if (cube.x < obstacles[i].x + obstacles[i].width &&
                        cube.x + cube.size > obstacles[i].x &&
                        cube.y < obstacles[i].y + obstacles[i].height &&
                        cube.y + cube.size > obstacles[i].y) {
                            gameOver = true;
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
                        fill(50, 100, 200);
                        rect(cube.x, cube.y, cube.size, cube.size);

                        // Draw score
                        fill(0);
                        textSize(24);
                        text('Score: ' + score, 20, 30);
            } else {
                            // Game over screen
                            fill(0);
                        textSize(48);
                        textAlign(CENTER, CENTER);
                        text('GAME OVER', 400, 150);
                        textSize(24);
                        text('Score: ' + score, 400, 200);
                        text('Press SPACE to restart', 400, 250);
            }
        }

                        function keyPressed() {
            if (key === ' ') {
                if (gameOver) {
                            // Restart game
                            obstacles = [];
                        score = 0;
                        gameOver = false;
                        megaObstacleSpawned = false;
                        cube.y = 300;
                        cube.velocity = 0;
                } else if (!cube.isJumping) {
                            // Jump
                            cube.velocity = cube.jumpPower;
                        cube.isJumping = true;
                }
            }
        }