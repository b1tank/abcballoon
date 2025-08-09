const canvas = document.getElementById('balloonCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let gameActive = false;
let currentLetterIndex = 0;
let balloons = [];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Pre-calculate non-overlapping X positions for 26 balloons
let balloonXPositions = [];
function calculateBalloonXPositions() {
  const margin = 10;
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const step = (width - 2 * margin) / letters.length;
  balloonXPositions = [];
  for (let i = 0; i < letters.length; i++) {
    balloonXPositions.push(margin + step * i + step / 2);
  }
}

function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  // High-DPI support
  const dpr = window.devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  canvas.style.width = container.clientWidth + 'px';
  canvas.style.height = container.clientHeight + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.scale(dpr, dpr);
  calculateBalloonXPositions();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomColor() {
  // Vibrant, kid-friendly colors
  const colors = [
    '#FF5252', '#FFB300', '#FFD600', '#69F0AE', '#40C4FF', '#7C4DFF',
    '#FF4081', '#FF6D00', '#C6FF00', '#00B8D4', '#00E676', '#FF1744',
    '#F50057', '#D500F9', '#651FFF', '#2979FF', '#00E5FF', '#1DE9B6',
    '#76FF03', '#FFEA00', '#FFC400', '#FF9100', '#FF3D00', '#C51162',
    '#AA00FF', '#00BFAE'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
function randomSize() {
  return 40 + Math.random() * 40; // 40-80px
}

function createBalloon(letter, index) {
  const size = randomSize();
  // Use pre-calculated X position for each letter
  const x = balloonXPositions[index] || (canvas.width / (window.devicePixelRatio || 1) / 2);
  return {
    letter,
    x,
    y: canvas.height / (window.devicePixelRatio || 1) + size,
    size,
    color: randomColor(),
    speed: 1.5 + Math.random() * 1.5
  };
}

function drawBalloon(balloon) {
  ctx.save();
  // Draw string/rope
  ctx.beginPath();
  ctx.moveTo(balloon.x, balloon.y + balloon.size * 1.1 / 2);
  ctx.lineTo(balloon.x, balloon.y + balloon.size * 1.1 / 2 + balloon.size * 1.2);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw tall vertical ellipse (balloon)
  ctx.beginPath();
  ctx.ellipse(balloon.x, balloon.y, balloon.size/2.5, balloon.size*1.1/2, 0, 0, 2*Math.PI);
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
  const dpr = window.devicePixelRatio || 1;
  const topLimit = 0 + 2 + 0.5 * 40; // 2px margin + half min balloon height
  for (let balloon of balloons) {
    // Stop at the top of the canvas
    const minY = (balloon.size*1.1/2) + 2;
    if (balloon.y - minY > topLimit) {
      balloon.y -= balloon.speed;
      if (balloon.y - minY < topLimit) {
        balloon.y = topLimit + minY;
      }
    }
  }
  // Remove balloons that are completely off the top (shouldn't happen now)
  balloons = balloons.filter(b => b.y + b.size * 1.1 / 2 > 0);
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
    balloons.push(createBalloon(key, currentLetterIndex));
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
