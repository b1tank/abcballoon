const canvas = document.getElementById('balloonCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let gameActive = false;
let balloons = [];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Popping effect particles
let popParticles = [];

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
function randomEllipseRatio() {
  // a: horizontal radius, b: vertical radius
  // Tall: a/b = 0.3-0.5, b = 0.9-1.2
  const aRatio = 0.3 + Math.random() * 0.2; // 0.3-0.5
  const bRatio = 0.9 + Math.random() * 0.3; // 0.9-1.2
  return { aRatio, bRatio };
}

function createBalloon(letter, index) {
  const size = randomSize();
  const { aRatio, bRatio } = randomEllipseRatio();
  // Use pre-calculated X position for each letter
  const x = balloonXPositions[index] || (canvas.width / (window.devicePixelRatio || 1) / 2);
  return {
    letter,
    x,
    y: canvas.height / (window.devicePixelRatio || 1) + size,
    size,
    color: randomColor(),
    speed: 1.5 + Math.random() * 1.5,
    aRatio,
    bRatio
  };
}

function drawBalloon(balloon) {
  ctx.save();
  // Draw string/rope
  ctx.beginPath();
  ctx.moveTo(balloon.x, balloon.y + balloon.size * balloon.bRatio / 2);
  ctx.lineTo(balloon.x, balloon.y + balloon.size * balloon.bRatio / 2 + balloon.size * 1.2);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw vertical ellipse (balloon) with random a/b
  ctx.beginPath();
  ctx.ellipse(balloon.x, balloon.y, balloon.size * balloon.aRatio, balloon.size * balloon.bRatio / 2, 0, 0, 2 * Math.PI);
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

function createPopParticles(balloon) {
  // Simple burst effect: colored circles radiating out
  const particles = [];
  const count = 12 + Math.floor(Math.random() * 6); // 12-18 particles
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const speed = 2 + Math.random() * 2;
    particles.push({
      x: balloon.x,
      y: balloon.y,
      radius: 4 + Math.random() * 4,
      color: balloon.color,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      alpha: 1.0
    });
  }
  return particles;
}

function updatePopParticles() {
  for (let i = popParticles.length - 1; i >= 0; i--) {
    const p = popParticles[i];
    p.x += p.dx;
    p.y += p.dy;
    p.radius *= 0.92;
    p.alpha *= 0.92;
    if (p.radius < 1 || p.alpha < 0.1) {
      popParticles.splice(i, 1);
    }
  }
}

function drawPopParticles() {
  for (const p of popParticles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
}

function updateBalloons() {
  // Balloons stop at the top of the canvas
  for (let balloon of balloons) {
    const minY = (balloon.size * balloon.bRatio / 2) + 2; // 2px margin
    if (balloon.y - minY > 0) {
      balloon.y -= balloon.speed;
      if (balloon.y - minY < 0) {
        balloon.y = minY;
      }
    }
  }
  // Do not remove balloons at the top
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let balloon of balloons) {
    drawBalloon(balloon);
  }
  drawPopParticles();
}

function gameLoop() {
  if (gameActive) {
    updateBalloons();
    updatePopParticles();
    render();
    requestAnimationFrame(gameLoop);
  } else {
    render();
  }
}

function startGame() {
  gameActive = true;
  balloons = [];
  popParticles = [];
  startBtn.disabled = true;
  restartBtn.disabled = false;
  window.addEventListener('keydown', handleKey);
  gameLoop();
}

function restartGame() {
  gameActive = false;
  balloons = [];
  popParticles = [];
  render();
  startBtn.disabled = false;
  restartBtn.disabled = true;
  window.removeEventListener('keydown', handleKey);
}

function handleKey(e) {
  if (!gameActive) return;
  const key = e.key.toUpperCase();
  // Check if a balloon with this letter exists on screen
  const idx = balloons.findIndex(b => b.letter === key);
  if (idx !== -1) {
    // Pop the balloon (remove it)
    const popped = balloons.splice(idx, 1)[0];
    // Add pop effect
    popParticles.push(...createPopParticles(popped));
    // Respawn a new balloon with same letter and horizontal position
    // Find the index for the letter in the alphabet for X position
    const letterIndex = letters.indexOf(key);
    if (letterIndex !== -1) {
      balloons.push(createBalloon(key, letterIndex));
    }
  } else {
    // If not on screen, spawn a new balloon for this letter
    const letterIndex = letters.indexOf(key);
    if (letterIndex !== -1) {
      balloons.push(createBalloon(key, letterIndex));
    }
  }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Initial render
render();
