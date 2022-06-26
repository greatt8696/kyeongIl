const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};

//다중입력 //////////////////////////////////////////////
window.addEventListener('keydown', keysPressed, false);
window.addEventListener('keyup', keysReleased, false);

const keys = {};

const playerKeyVelocity = {
  x: 0,
  y: 0,
};

function keysPressed(e) {
  keys[e.keyCode] = true;
  console.log(keys);

  console.log(playerKeyVelocity);
  // Ctrl + Space
  if (keys[38]) {
    //up
    playerKeyVelocity.y = 1;
    playerKeyVelocity.x = 0;
  }
  if (keys[40]) {
    //down
    playerKeyVelocity.y = -1;
    playerKeyVelocity.x = 0;
  }
  if (keys[37]) {
    //left
    playerKeyVelocity.y = 0;
    playerKeyVelocity.x = 1;
  }
  if (keys[39]) {
    //right
    playerKeyVelocity.y = 0;
    playerKeyVelocity.x = -1;
  }
  if (keys[38] && keys[37]) {
    //left & up
    playerKeyVelocity.y = 1;
    playerKeyVelocity.x = 1;
  }
  if (keys[40] && keys[39]) {
    //left & up
    playerKeyVelocity.y = -1;
    playerKeyVelocity.x = -1;
  }
}

function keysReleased(e) {
  keys[e.keyCode] = false;
  // Ctrl + Space
  if (!keys[38]) {
    //up
    playerKeyVelocity.y = 0;
  }
  if (!keys[40]) {
    //down
    playerKeyVelocity.y = 0;
  }
  if (!keys[37]) {
    //left
    playerKeyVelocity.x = 0;
  }
  if (!keys[39]) {
    //right
    playerKeyVelocity.x = 0;
  }
}

// onkeydown = (event) => {
//   console.log(event);
//   switch (event.key) {
//     case 'ArrowUp': //38
//       playerKeyVelocity.y = 1;
//       break;
//     case 'ArrowDown': //40
//       playerKeyVelocity.y = -1;
//       break;
//     case 'ArrowLeft': //37
//       playerKeyVelocity.x = 1;
//       break;
//     case 'ArrowRight': //39
//       playerKeyVelocity.x = -1;
//       break;
//     default:
//       break;
//   }
// };

//////////////////////////////////////////////////////////

class Player {
  constructor(position, radius, color, damage = 10) {
    this.pos = position;
    this.radius = radius;
    this.color = color;
    this.damage = damage;
  }

  draw() {
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Missile {
  constructor(position, radius, color, velocity) {
    this.pos = position;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.speed = 5;
  }
  draw() {
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
    this.pos.x += this.velocity.x * this.speed;
    this.pos.y += this.velocity.y * this.speed;
  }
}

class Enemy {
  constructor(position, radius, color, velocity, speed = 1) {
    this.pos = position;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.speed = speed;
  }
  draw() {
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    const angle = Math.atan2(
      player.pos.y - this.pos.y,
      player.pos.x - this.pos.x
    );

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    this.velocity = velocity;
    this.draw();
    this.pos.x += this.velocity.x * this.speed + playerKeyVelocity.x;
    this.pos.y += this.velocity.y * this.speed + playerKeyVelocity.y;
  }
}

class Particle {
  constructor(position, radius, color, velocity, speed = 8, friction = 0.98) {
    this.pos = position;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.speed = speed;
    this.alpha = 1;
    this.friction = friction;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.pos.x += this.velocity.x * this.speed;
    this.pos.y += this.velocity.y * this.speed;
    this.alpha -= 0.01;
  }
}

let animationId;
const missles = [];
const enemies = [];
const particles = [];

const player = new Player(
  { x: innerWidth / 2, y: innerHeight / 2 },
  66,
  'blue'
);

onclick = (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  missles.push(
    new Missile(
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      5,
      'purple',
      velocity
    )
  );
};

function randomPosition(gap) {
  let randomX;
  let randomy;
  const xyChoice = Math.random() < 0.5 ? false : true;

  if (xyChoice) {
    randomX = Math.random() < 0.5 ? 0 - gap : canvas.width + gap;
    randomy = Math.random() * canvas.height;
  } else {
    randomX = Math.random() * canvas.width;
    randomy = Math.random() < 0.5 ? 0 - gap : canvas.height + gap;
  }
  return { x: randomX, y: randomy };
}

function randomRadius() {
  const MAX = 60;
  const MIN = 30;
  return Math.random() * (MAX - MIN) + MIN;
}

function spawnEnemies() {
  setInterval(() => {
    const position = randomPosition(100);
    const radius = randomRadius();
    const color = `hsl(${Math.random() * 360},50%, 50%)`;

    const angle = Math.atan2(
      player.pos.y - position.y,
      player.pos.x / 2 - position.x
    );

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    const speed = (Math.random() + 5) * 0.1;

    enemies.push(new Enemy(position, radius, color, velocity, speed));
  }, 1000);
}

function removeMissle(missle, idx) {
  if (
    missle.pos.x - missle.radius < 0 ||
    missle.pos.x - missle.radius > canvas.width ||
    missle.pos.y - missle.radius < 0 ||
    missle.pos.y - missle.radius > canvas.height
  ) {
    setTimeout(() => {
      missles.splice(idx, 1);
    });
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  missles.forEach((missle) => {
    missle.update();
  });

  particles.forEach((particle, idx) => {
    if (particle.alpha <= 0) {
      particles.splice(idx);
    } else {
      particle.update();
    }
  });

  enemies.forEach((enemy, enemyIdx) => {
    enemy.update();
    const playerEnemyDist = Math.hypot(
      player.pos.x - enemy.pos.x,
      player.pos.y - enemy.pos.y
    );
    if (playerEnemyDist - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
    }

    missles.forEach((missle, missleIdx) => {
      const missleEnemyDist = Math.hypot(
        missle.pos.x - enemy.pos.x,
        missle.pos.y - enemy.pos.y
      );
      if (missleEnemyDist - enemy.radius - missle.radius < 1) {
        if (enemy.radius - player.damage > player.damage) {
          enemy.radius -= player.damage;
          gsap.to(enemy, {
            radius: enemy.radius - player.damage,
          });
          for (let idx = 0; idx < 15; idx++) {
            particles.push(
              new Particle(
                {
                  x: missle.pos.x,
                  y: missle.pos.y,
                },
                Math.random() * 2 + 0.1,
                enemy.color,
                {
                  x: Math.random() - 0.5,
                  y: Math.random() - 0.5,
                }
              )
            );
          }

          setTimeout(() => {
            missles.splice(missleIdx, 1);
          }, 0);
        } else {
          gsap.to(enemy, {
            radius: 0,
          });
          setTimeout(() => {
            enemies.splice(enemyIdx, 1);
            missles.splice(missleIdx, 1);
          }, 0);
        }
      }
    });
  });
}

animate();
spawnEnemies();
