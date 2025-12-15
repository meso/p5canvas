export const BREAKOUT_CODE = `
let config;
let paddle;
let ball;
let blocks = [];
let gameState = 'playing'; // playing, gameover, clear

function preload() {
  config = loadJSON('config.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Initialize game based on config
  resetGame();
}

function resetGame() {
  const paddleW = config.paddleWidth || 100;
  paddle = {
    x: width / 2 - paddleW / 2,
    y: height - 50,
    w: paddleW,
    h: 20,
    color: '#00ccff'
  };

  ball = {
    x: width / 2,
    y: height / 2,
    size: 20,
    speedX: config.ballSpeed || 5,
    speedY: -(config.ballSpeed || 5),
    color: '#ffffff'
  };

  blocks = [];
  const rows = config.blockRows || 5;
  const cols = 8;
  const blockW = width / cols;
  const blockH = 30;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      blocks.push({
        x: c * blockW,
        y: r * blockH + 50,
        w: blockW - 4,
        h: blockH - 4,
        active: true,
        color: config.enemyColor || 'red'
      });
    }
  }
}

function draw() {
  background(30);

  if (gameState === 'playing') {
    update();
  }

  // Draw Paddle
  fill(paddle.color);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);

  // Draw Ball
  fill(ball.color);
  ellipse(ball.x, ball.y, ball.size);

  // Draw Blocks
  for (let b of blocks) {
    if (b.active) {
      fill(b.color);
      rect(b.x, b.y, b.w, b.h);
    }
  }
}

function update() {
  // Paddle Movement
  if (mouseIsPressed || touches.length > 0) {
    let targetX = (touches.length > 0 ? touches[0].x : mouseX) - paddle.w / 2;
    paddle.x = lerp(paddle.x, targetX, 0.2);
  }
  paddle.x = constrain(paddle.x, 0, width - paddle.w);

  // Ball Movement
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Wall Collision
  if (ball.x < 0 || ball.x > width) ball.speedX *= -1;
  if (ball.y < 0) ball.speedY *= -1;
  
  // Paddle Collision
  if (
    ball.y + ball.size / 2 > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    ball.speedY *= -1;
    ball.y = paddle.y - ball.size / 2 - 1;
  }

  // Block Collision
  for (let b of blocks) {
    if (b.active) {
      if (
        ball.x > b.x &&
        ball.x < b.x + b.w &&
        ball.y > b.y &&
        ball.y < b.y + b.h
      ) {
        b.active = false;
        ball.speedY *= -1;
        break; 
      }
    }
  }

  // Game Over
  if (ball.y > height) {
    // Just reset for now
    resetGame();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetGame();
}
`;
