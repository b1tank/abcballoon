const canvas = document.getElementById('balloonCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let gameActive = false;
let currentLetterIndex = 0;
let balloons = [];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function resizeCanvas() {
  const controls = document.getElementById('controls');
  const container = document.getElementById('canvas-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomColor() {
  const colors = ['#ff6f61', '#6ec6ff', '#ffd54f', '#81c784', '#ba68c8', '#ff8a65', '#4dd0e1', '#f06292', '#a1887f', '#90a4ae'];
  return colors[Math.floor(Math.random() * colors.length)];
}
function randomSize() {
  return 40 + Math.random() * 40; // 40-80px
}
function randomX(size) {
  return size/2 + Math.random() * (canvas.width - size);
}

function createBalloon(letter) {
  const size = randomSize();
  return {
    letter,
    x: randomX(size),
    y: canvas.height + size,
    size,
    color: randomColor(),
    speed: 1.5 + Math.random() * 1.5
  };
}

function drawBalloon(balloon) {
  ctx.save();
  // Draw string/rope
  ctx.beginPath();
  ctx.moveTo(balloon.x, balloon.y + balloon.size * 0.7 / 2);
  ctx.lineTo(balloon.x, balloon.y + balloon.size * 0.7 / 2 + balloon.size * 1.2);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw vertical ellipse (balloon)
  ctx.beginPath();
  ctx.ellipse(balloon.x, balloon.y, balloon.size/2, balloon.size*0.7/2, 0, 0, 2*Math.PI);
  ctx.fillStyle = balloon.color;
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw letter
  ctx.font = `${balloon.size/2}px Comic Sans MS, Comic Sans, cursive`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(balloon.letter, balloon.x, balloon.y);
  ctx.restore();
}

function updateBalloons() {
  for (let balloon of balloons) {
    balloon.y -= balloon.speed;
  }
  // Remove balloons that are off the top
  balloons = balloons.filter(b => b.y + b.size * 0.7 / 2 > 0);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let balloon of balloons) {
    drawBalloon(balloon);
  }
}

function gameLoop() {
  if (gameActive) {
    updateBalloons();
    render();
    requestAnimationFrame(gameLoop);
  } else {
    render();
  }
}

function startGame() {
  gameActive = true;
  currentLetterIndex = 0;
  balloons = [];
  startBtn.disabled = true;
  restartBtn.disabled = false;
  window.addEventListener('keydown', handleKey);
  gameLoop();
}

function restartGame() {
  gameActive = false;
  balloons = [];
  render();
  startBtn.disabled = false;
  restartBtn.disabled = true;
  window.removeEventListener('keydown', handleKey);
}

function handleKey(e) {
  if (!gameActive) return;
  const key = e.key.toUpperCase();
  if (key === letters[currentLetterIndex]) {
    balloons.push(createBalloon(key));
    currentLetterIndex++;
    if (currentLetterIndex >= letters.length) {
      // Game finished
      setTimeout(() => {
        alert('Congratulations! You typed all the letters!');
        restartGame();
      }, 100);
    }
  }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Initial render
render();
