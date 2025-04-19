// --- Game Configuration ---
const GROUND_Y_FRAC = 0.8; // Fraction of screen height where ground is
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const BASE_SPEED = 5;
const SPEED_INCREASE = 0.001;
const OBSTACLE_INTERVAL_MIN = 50; // Min frames between obstacles
const OBSTACLE_INTERVAL_MAX = 120; // Max frames between obstacles

// --- Game State ---
let dino;
let obstacles = [];
let backgroundLayers = [];
let score = 0;
let gameSpeed;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let nextObstacleFrame;
let groundY;

// --- Graphics Buffers (for pixel art) ---
let dinoSprite;
let cactusSprite;
let mountainSprite;
let groundSprite;

// --- Preload (Optional but good practice) ---
// We are generating graphics, so preload isn't strictly needed for loading
// but it's a good place conceptually if we had assets.

// --- Setup ---
function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1); // Ensure pixel art isn't blurry on high-res screens
    noSmooth(); // Crucial for sharp pixel look
    textFont('monospace', 18); // Monospaced font often fits pixel themes

    groundY = height * GROUND_Y_FRAC;
    gameSpeed = BASE_SPEED;
    nextObstacleFrame = OBSTACLE_INTERVAL_MAX;

    // --- Create Pixel Art Graphics ---
    createSprites();

    // --- Initialize Game Objects ---
    dino = new Dino();
    createBackgroundLayers();

    resetGame(); // Initial setup
}

// --- Draw Loop (Main Game Logic) ---
function draw() {
    background(135, 206, 250); // Sky blue

    // Draw background first (back to front)
    for (let layer of backgroundLayers) {
        layer.update();
        layer.draw();
    }

    // --- Game State Logic ---
    if (gameState === 'start') {
        displayStartScreen();
    } else if (gameState === 'playing') {
        runGame();
    } else if (gameState === 'gameOver') {
        runGame(); // Keep drawing the scene
        displayGameOverScreen();
    }

    // --- Draw Score ---
    fill(0);
    textAlign(LEFT, TOP);
    text(`Score: ${floor(score)}`, 10, 10);
}

// --- Game Running Logic ---
function runGame() {
    // Update and Draw Dino
    dino.update();
    dino.draw();

    // Update Game Speed (gradual increase)
    if (gameState === 'playing') {
        gameSpeed += SPEED_INCREASE;
        score += 0.1 * (gameSpeed / BASE_SPEED); // Score increases faster with speed
    }


    // Handle Obstacles
    manageObstacles();

    // Check for Collisions (only if playing)
    if (gameState === 'playing') {
        for (let obs of obstacles) {
            if (dino.hits(obs)) {
                gameState = 'gameOver';
                // Optional: Add a sound effect here if desired
            }
        }
    }
}

// --- Obstacle Management ---
function manageObstacles() {
    // Spawn new obstacles
    if (gameState === 'playing' && frameCount > nextObstacleFrame) {
        obstacles.push(new Obstacle());
        nextObstacleFrame = frameCount + floor(random(OBSTACLE_INTERVAL_MIN / (gameSpeed / BASE_SPEED), OBSTACLE_INTERVAL_MAX / (gameSpeed / BASE_SPEED)));
         // Make interval shorter as speed increases
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // Remove obstacles that are off-screen
        if (obstacles[i].isOffscreen()) {
            obstacles.splice(i, 1);
        }
    }
}

// --- Display Screens ---
function displayStartScreen() {
    fill(0, 0, 0, 180); // Semi-transparent black overlay
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Pixel Dino Runner", width / 2, height / 3);
    textSize(18);
    text("Press SPACE, Click, or Tap to Start", width / 2, height / 2);
}

function displayGameOverScreen() {
    fill(0, 0, 0, 180); // Semi-transparent black overlay
    rect(0, 0, width, height);

    fill(255, 0, 0); // Red for Game Over
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME OVER", width / 2, height / 3);

    fill(255); // White for score and restart
    textSize(24);
    text(`Final Score: ${floor(score)}`, width / 2, height / 2);
    textSize(18);
    text("Press SPACE, Click, or Tap to Restart", width / 2, height / 2 + 50);
}

// --- Reset Game ---
function resetGame() {
    score = 0;
    obstacles = [];
    gameSpeed = BASE_SPEED;
    dino.reset();
    frameCount = 0; // Reset frameCount for obstacle timing
    nextObstacleFrame = OBSTACLE_INTERVAL_MAX * 2; // Give player buffer time at start
    gameState = 'playing';
}

// --- Input Handling ---
function keyPressed() {
    handleInput();
}

function mousePressed() {
    handleInput();
}

function touchStarted() {
    handleInput();
    return false; // Prevent default browser touch behavior
}

function handleInput() {
    if (gameState === 'playing') {
        dino.jump();
    } else if (gameState === 'start' || gameState === 'gameOver') {
        resetGame();
    }
}

// --- Window Resize Handling ---
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    groundY = height * GROUND_Y_FRAC;
    // Recreate sprites and background if necessary (might cause slight flicker)
    // or adjust positions based on new dimensions. Simple approach: just redraw.
     createSprites(); // Regenerate sprites for new size potential
     createBackgroundLayers(); // Regenerate background layers
     dino.x = width * 0.1; // Reset dino horizontal position
     dino.y = groundY - dino.h; // Reset dino vertical position based on new groundY

     // Clear obstacles as their positions relative to the new screen size might be weird
     obstacles = [];
     nextObstacleFrame = frameCount + OBSTACLE_INTERVAL_MAX; // Reset obstacle timer

     // Optional: Center text again if needed
     if (gameState !== 'playing') {
         // Force redraw of start/gameover screen with new dimensions
     }
}


// ==========================
// ---      CLASSES       ---
// ==========================

// --- Dino Class ---
class Dino {
    constructor() {
        this.w = 40; // Dino width
        this.h = 40; // Dino height
        this.x = width * 0.1;
        this.y = groundY - this.h;
        this.vy = 0; // Velocity Y
        this.gravity = GRAVITY;
        this.jumpForce = JUMP_FORCE;
        this.sprite = dinoSprite; // Use the pre-rendered sprite
    }

    update() {
        this.vy += this.gravity;
        this.y += this.vy;

        // Prevent falling through the ground
        if (this.y >= groundY - this.h) {
            this.y = groundY - this.h;
            this.vy = 0;
        }
    }

    draw() {
        // Draw the pre-rendered sprite
        image(this.sprite, this.x, this.y, this.w, this.h);

        // // Hitbox visualization (optional)
        // noFill();
        // stroke(255, 0, 0);
        // rect(this.x, this.y, this.w, this.h);
        // noStroke();
    }

    jump() {
        // Only allow jumping if on the ground
        if (this.y === groundY - this.h) {
            this.vy = this.jumpForce;
        }
    }

    hits(obstacle) {
        // Simple AABB collision detection
        let dinoRight = this.x + this.w * 0.8; // Slightly smaller hitbox
        let dinoLeft = this.x + this.w * 0.2;
        let dinoBottom = this.y + this.h * 0.9;
        let dinoTop = this.y + this.h * 0.1;

        let obsRight = obstacle.x + obstacle.w;
        let obsLeft = obstacle.x;
        let obsBottom = obstacle.y + obstacle.h;
        let obsTop = obstacle.y;

        return (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom > obsTop &&
            dinoTop < obsBottom
        );
    }

     reset() {
        this.y = groundY - this.h;
        this.vy = 0;
    }
}

// --- Obstacle Class ---
class Obstacle {
    constructor() {
        this.w = 25; // Obstacle width
        this.h = 50; // Obstacle height
        this.x = width; // Start off-screen right
        this.y = groundY - this.h; // Position on the ground
        this.sprite = cactusSprite; // Use pre-rendered sprite
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        image(this.sprite, this.x, this.y, this.w, this.h);

        // // Hitbox visualization (optional)
        // noFill();
        // stroke(0, 0, 255);
        // rect(this.x, this.y, this.w, this.h);
        // noStroke();
    }

    isOffscreen() {
        return this.x + this.w < 0;
    }
}

// --- Background Layer Class ---
class BackgroundLayer {
    constructor(sprite, speedFactor, yPos, imgWidth, imgHeight) {
        this.sprite = sprite;
        this.speed = gameSpeed * speedFactor;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.y = yPos;
        this.x1 = 0;
        this.x2 = this.imgWidth; // Second image starts right after the first
    }

    update() {
        // Update speed based on global gameSpeed
        this.speed = gameSpeed * this.speedFactor;

        // Move images left
        this.x1 -= this.speed;
        this.x2 -= this.speed;

        // Reset image position when it goes fully off-screen left
        if (this.x1 <= -this.imgWidth) {
            this.x1 = this.x2 + this.imgWidth;
        }
        if (this.x2 <= -this.imgWidth) {
            this.x2 = this.x1 + this.imgWidth;
        }
    }

    draw() {
        // Draw two copies of the sprite to create seamless scrolling
        image(this.sprite, this.x1, this.y, this.imgWidth, this.imgHeight);
        image(this.sprite, this.x2, this.y, this.imgWidth, this.imgHeight);
    }

    // Store speedFactor to recalculate speed when gameSpeed changes
    setSpeedFactor(factor) {
      this.speedFactor = factor;
    }
}


// ==================================
// --- PIXEL ART GENERATION ---
// ==================================

function createSprites() {
    // --- Dino Sprite (Simple T-Rex like) ---
    dinoSprite = createGraphics(40, 40);
    dinoSprite.noSmooth();
    dinoSprite.noStroke();
    // Body (Green)
    dinoSprite.fill(34, 139, 34); // Forest Green
    dinoSprite.rect(10, 10, 20, 25); // Main body
    dinoSprite.rect(25, 5, 10, 15);  // Head
    dinoSprite.rect(5, 30, 8, 10);   // Tail base
    dinoSprite.rect(0, 35, 8, 5);    // Tail end
    // Legs
    dinoSprite.rect(12, 35, 6, 5);
    dinoSprite.rect(22, 35, 6, 5);
    // Eye (Black)
    dinoSprite.fill(0);
    dinoSprite.rect(30, 8, 3, 3);
    // Arm (small)
    dinoSprite.fill(34, 139, 34);
    dinoSprite.rect(20, 18, 5, 5);


    // --- Cactus Sprite ---
    cactusSprite = createGraphics(25, 50);
    cactusSprite.noSmooth();
    cactusSprite.noStroke();
    // Main Stem (Dark Green)
    cactusSprite.fill(0, 100, 0); // Dark Green
    cactusSprite.rect(8, 5, 9, 45);
    // Arms
    cactusSprite.rect(0, 15, 8, 8);
    cactusSprite.rect(17, 20, 8, 8);
    // Base slight bulge
    cactusSprite.rect(5, 45, 15, 5);


    // --- Mountain Sprite ---
    mountainSprite = createGraphics(300, 150); // Wider for background
    mountainSprite.noSmooth();
    mountainSprite.noStroke();
    mountainSprite.background(135, 206, 250, 0); // Transparent background
    // Mountain Shape (Gray)
    mountainSprite.fill(100, 100, 110); // Darker gray
    mountainSprite.triangle(0, 150, 150, 20, 300, 150);
    // Snow Cap (White)
    mountainSprite.fill(240, 240, 255);
    mountainSprite.triangle(100, 65, 150, 20, 200, 65);
    mountainSprite.triangle(125, 45, 150, 20, 175, 45); // Peak detail


    // --- Ground Sprite ---
    // Create a wide ground sprite for seamless tiling
    groundSprite = createGraphics(width > 600 ? width : 600, 50); // Ensure decent width
    groundSprite.noSmooth();
    groundSprite.noStroke();
    // Base Ground (Brown)
    groundSprite.fill(139, 69, 19); // Saddle Brown
    groundSprite.rect(0, 0, groundSprite.width, 50);
    // Add some texture/detail (random darker/lighter pixels)
    groundSprite.fill(160, 82, 45); // Sienna
    for (let i = 0; i < 200; i++) {
        let x = random(groundSprite.width);
        let y = random(5, 45);
        groundSprite.rect(x, y, random(2, 5), random(2, 5));
    }
     groundSprite.fill('#8B4513'); // Darker brown (SaddleBrown)
     for (let i = 0; i < 100; i++) {
        let x = random(groundSprite.width);
        let y = random(10, 50);
        groundSprite.rect(x, y, random(1, 4), random(1, 4));
    }
}

function createBackgroundLayers() {
    backgroundLayers = []; // Clear existing layers

    // Mountains (Slowest) - Adjust Y position as needed
    let mountainLayer = new BackgroundLayer(mountainSprite, 0.1, groundY - mountainSprite.height * 0.9, mountainSprite.width, mountainSprite.height);
    mountainLayer.setSpeedFactor(0.1); // Store the factor
    backgroundLayers.push(mountainLayer);


    // Ground (Fastest, matches obstacle speed slightly adjusted)
    let groundLayer = new BackgroundLayer(groundSprite, 1.0, groundY, groundSprite.width, groundSprite.height);
     groundLayer.setSpeedFactor(1.0); // Store the factor
    backgroundLayers.push(groundLayer);


    // Ensure layers are sorted by speed factor for correct drawing order if needed
    // (Not strictly necessary here as we add them back-to-front)
    // backgroundLayers.sort((a, b) => a.speedFactor - b.speedFactor);
}