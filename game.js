const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const bgMusic = document.getElementById('bgMusic');

const gravity = 0.5;

let player = {
  x: 50,
  y: 300,
  radius: 15,
  dx: 0,
  dy: 0,
  speed: 5,
  jumpForce: -12,
  onGround: false,
  alive: true
};

let gameOver = false;
let score = 0;

const keys = {
  right: false,
  left: false,
  up: false
};

const platforms = [
  { x: 0, y: 370, width: 800, height: 30 },
  { x: 200, y: 300, width: 100, height: 10 },
  { x: 400, y: 250, width: 100, height: 10 },
];

let goombas = [
  { x: 300, y: 340, width: 30, height: 30, dx: -1, alive: true }
];

let respawnTime = 2000;  // Waktu respawn Goomba dalam milidetik (2 detik)

// Menambahkan gambar latar belakang
const backgroundImage = new Image();
backgroundImage.src = 'background.jpg';  // Pastikan gambar ini ada di folder yang sama

document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'Space') keys.up = true;  // Mengganti ArrowUp dengan Space
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'Space') keys.up = false;  // Mengganti ArrowUp dengan Space
});


restartBtn.addEventListener('click', () => {
  resetGame();
});

function resetGame() {
  player = {
    x: 50,
    y: 300,
    radius: 15,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: -12,
    onGround: false,
    alive: true
  };

  goombas = [
    { x: 300, y: 340, width: 30, height: 30, dx: -1, alive: true }
  ];

  gameOver = false;
  restartBtn.style.display = 'none';
  score = 0;
  bgMusic.currentTime = 0;
  bgMusic.play();
}

function updateScore() {
  // Update skor dengan menggambar langsung di canvas
  ctx.fillStyle = 'red';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Skor: ${score}`, 10, 30);  // Skor di bagian atas kiri
}

function handleGoombaCollision() {
  goombas.forEach(goomba => {
    if (!goomba.alive) return;

    if (
      player.x < goomba.x + goomba.width &&
      player.x + player.radius * 2 > goomba.x &&
      player.y < goomba.y + goomba.height &&
      player.y + player.radius * 2 > goomba.y
    ) {
      const playerBottom = player.y + player.radius;
      const goombaTop = goomba.y;

      if (playerBottom - player.dy <= goombaTop + 5) {
        // Goomba terinjak
        goomba.alive = false;
        player.dy = player.jumpForce / 1.5;
        score += 100;  // Tambahkan skor
        // Respawn Goomba setelah beberapa detik
        setTimeout(() => {
          goomba.alive = true;
          goomba.x = Math.random() * (canvas.width - goomba.width);  // Posisi acak
        }, respawnTime);
      } else {
        // Game Over jika tabrakan dari samping
        gameOver = true;
        restartBtn.style.display = 'block';
        bgMusic.pause();
      }
    }
  });
}

function update() {
  if (gameOver) return;

  if (keys.right) player.dx = player.speed;
  else if (keys.left) player.dx = -player.speed;
  else player.dx = 0;

  if (keys.up && player.onGround) {
    player.dy = player.jumpForce;
    player.onGround = false;
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  // Platform collision
  player.onGround = false;
  platforms.forEach((plat) => {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.radius * 2 > plat.x &&
      player.y + player.radius * 2 < plat.y + plat.height &&
      player.y + player.radius * 2 + player.dy >= plat.y
    ) {
      player.dy = 0;
      player.y = plat.y - player.radius * 2;
      player.onGround = true;
    }
  });

  // Tangani tabrakan dengan Goomba
  handleGoombaCollision();
  
  // Update posisi Goomba
  goombas.forEach(goomba => {
    if (!goomba.alive) return;

    goomba.x += goomba.dx;

    if (goomba.x <= 0 || goomba.x + goomba.width >= canvas.width) {
      goomba.dx *= -1;
    }
  });
}

function drawBackground() {
  // Gambar latar belakang dengan gambar
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  if (!player.alive || gameOver) return;
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);  // Gambar lingkaran untuk pemain
  ctx.fill();
}

function drawPlatforms() {
  ctx.fillStyle = 'green';
  platforms.forEach((plat) => {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  });
}

function drawGoombas() {
  goombas.forEach(goomba => {
    if (!goomba.alive) return;
    ctx.fillStyle = 'brown';
    ctx.fillRect(goomba.x, goomba.y, goomba.width, goomba.height);  // Goomba tetap kotak
  });
}

function drawGameOver() {
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 140, canvas.height / 2 - 50);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();  // Gambar latar belakang
  update();
  drawPlatforms();
  drawGoombas();
  drawPlayer();
  updateScore();  // Panggil fungsi updateScore untuk menampilkan skor
  drawGameOver();
  requestAnimationFrame(gameLoop);
}

// Mulai game
gameLoop();
bgMusic.play();
