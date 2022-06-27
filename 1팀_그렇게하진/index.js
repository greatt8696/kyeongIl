const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

let animationId;
const missles = [];
const enemies = [];
const particles = [];
const PARTICLE = 2;
const ENEMYSPEED = 9;
const SPWAN = 200;
const MAX = 130;
const MIN = 20;
const DAMAGE = 5;
const ATKSPEED = 1000;
canvas.width = innerWidth;
canvas.height = innerHeight;

// onresize = () => {
//   canvas.width = innerWidth;
//   canvas.height = innerHeight;
// };

//다중입력 //////////////////////////////////////////////
window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);

const keys = {
  ArrowLeft: false,
  ArrowDown: false,
  ArrowUp: false,
  ArrowRight: false,
};

const playerKeyVelocityMinus = {
  x: 0,
  y: 0,
};
const playerKeyVelocityPlus = {
  x: 0,
  y: 0,
};

let h = 0; // 0 - 59
let m = 0; // 0 - 59
let s = 0; // 0 - 59
let ms = 0; // 0 - 99
let timerId;

function showTime() {
  if (h === 60) {
    h += 1;
    m = 0;
  }

  if (s === 60) {
    m += 1;
    s = 0;
  }

  if (ms === 99) {
    s += 1;
    ms = 0;
  }

  const string_h = h < 10 ? "0" + h : h;
  const string_m = m < 10 ? "0" + m : m;
  const string_s = s < 10 ? "0" + s : s;
  const string_ms = ms < 10 ? "0" + ms : ms;

  ms++;

  const time = string_h + ":" + string_m + ":" + string_s + ":" + string_ms;

  document.getElementById("MyClockDisplay").innerHTML = time;

  // document.getElementById("MyClockDisplay").textContent = time;

  timerId = setTimeout(showTime, 10);
}

function keyEvent() {
  playerKeyVelocityPlus.y = keys["ArrowUp"] ? 1 : 0;
  playerKeyVelocityMinus.y = keys["ArrowDown"] ? -1 : 0;
  playerKeyVelocityPlus.x = keys["ArrowLeft"] ? 1 : 0;
  playerKeyVelocityMinus.x = keys["ArrowRight"] ? -1 : 0;
}

function keysPressed(e) {
  keys[e.key] = true;
  keyEvent();
}

function keysReleased(e) {
  keys[e.key] = false;
  keyEvent();
}

//////////////////////////////////////////////////////////

class Player {
  constructor(position, radius, color, damage = DAMAGE) {
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
    this.speed = 2;
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
    this.pos.x +=
      this.velocity.x * this.speed +
      playerKeyVelocityMinus.x +
      playerKeyVelocityPlus.x;
    this.pos.y +=
      this.velocity.y * this.speed +
      playerKeyVelocityMinus.y +
      playerKeyVelocityPlus.y;
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
    this.alpha -= 0.03;
  }
}

const player = new Player(
  { x: innerWidth / 2, y: innerHeight / 2 },
  35,
  "blue"
);

function autoAtk() {
  let angle;
  enemies.forEach((enemy) => {
    angle = Math.atan2(
      enemy.pos.y - canvas.height / 2,
      enemy.pos.x - canvas.width / 2
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
        "white",
        velocity
      )
    );
    console.log(missles);
  });
}

const autoATkId = setInterval(() => {
  autoAtk();
}, ATKSPEED);

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
      "white",
      velocity
    )
  );
};

function randomPosition(gap) {
  let randomX;
  let randomY;
  const selectXY = Math.random() < 0.5 ? false : true;

  if (selectXY) {
    randomX = Math.random() < 0.5 ? 0 - gap : canvas.width + gap;
    randomY = Math.random() * canvas.height;
  } else {
    randomX = Math.random() * canvas.width;
    randomY = Math.random() < 0.5 ? 0 - gap : canvas.height + gap;
  }

  return { x: randomX, y: randomY };
}

function randomRadius() {
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
    const speed = (Math.random() + ENEMYSPEED) * 0.1;

    enemies.push(new Enemy(position, radius, color, velocity, speed));
  }, SPWAN);
}

function animate() {
  // console.log(enemies.length);
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.4)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  missles.forEach((missle) => {
    missle.update();
  });

  particles.forEach((particle, idx) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(idx, 1);
      }, 0);
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
      clearTimeout(timerId)
      clearInterval(autoATkId)
      document.getElementById("MyClockDisplay").classList.add("gameover");
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
          for (let idx = 0; idx < PARTICLE; idx++) {
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
showTime();
