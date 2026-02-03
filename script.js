const cardsContainer = document.querySelector(".cards");
const cards = document.querySelectorAll(".cards li");

let rotationAngle = 0;
const totalCards = cards.length;
const angleStep = totalCards ? 360 / totalCards : 0;

function setupCards() {
  if (!cardsContainer || !cards.length) return;

  const radius = Math.min(window.innerWidth / 2.5, 320);

  cards.forEach((card, index) => {
    const angle = index * angleStep;
    card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });
}

setupCards();
window.addEventListener("resize", setupCards);

/* ---------- Swipe Support (ONLY on carousel) ---------- */
let touchStartX = 0;
let touchEndX = 0;

if (cardsContainer) {
  cardsContainer.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  cardsContainer.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );
}

function handleSwipe() {
  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) > 50 && cardsContainer) {
    rotationAngle += swipeDistance > 0 ? -angleStep : angleStep;
    rotationAngle %= 360;
    cardsContainer.style.transform = `rotateY(${rotationAngle}deg)`;
  }
}

/* ---------- Keyboard Support (no page scroll) ---------- */
document.addEventListener("keydown", (e) => {
  if (!cardsContainer) return;
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

  e.preventDefault();

  if (e.key === "ArrowRight") rotationAngle -= angleStep;
  if (e.key === "ArrowLeft") rotationAngle += angleStep;

  rotationAngle %= 360;
  cardsContainer.style.transform = `rotateY(${rotationAngle}deg)`;
});

/* ===============================
   CANVAS BACKGROUND BIRDS
================================ */

const canvas = document.getElementById("birds-bg");
const ctx = canvas ? canvas.getContext("2d") : null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---------- Bird Class ---------- */
class Bird {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 6 + Math.random() * 6;
    this.speed = 0.3 + Math.random() * 0.8;
    this.angle = Math.random() * Math.PI * 2;
    this.wing = Math.random() * Math.PI;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.wing += 0.15;
    this.angle += (Math.random() - 0.5) * 0.02;

    if (
      this.x < -50 ||
      this.x > canvas.width + 50 ||
      this.y < -50 ||
      this.y > canvas.height + 50
    ) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const isLight = document.body.classList.contains("light");

    ctx.strokeStyle = isLight
      ? "rgba(37,99,235,0.35)"
      : "rgba(120,180,255,0.35)";

    ctx.lineWidth = 1.5;
    ctx.shadowColor = isLight
      ? "rgba(37,99,235,0.5)"
      : "rgba(80,140,255,0.6)";
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(0, Math.sin(this.wing) * this.size);
    ctx.lineTo(this.size, 0);
    ctx.stroke();

    ctx.restore();
  }
}

/* ---------- Create Birds ---------- */
const birds = [];
const BIRD_COUNT = Math.min(40, Math.floor(window.innerWidth / 25));

if (canvas && ctx) {
  for (let i = 0; i < BIRD_COUNT; i++) {
    birds.push(new Bird());
  }
}

/* ---------- Animation Loop (battery safe) ---------- */
let animationId;

function animate() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  birds.forEach((bird) => {
    bird.update();
    bird.draw();
  });

  animationId = requestAnimationFrame(animate);
}

animate();

/* Pause animation when tab hidden */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animate();
  }
});

/* Reduce motion preference */
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  birds.length = 0;
}

/* ===============================
   DAY / NIGHT THEME TOGGLE
================================ */

const toggleBtn = document.getElementById("themeToggle");

if (toggleBtn) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    toggleBtn.textContent = "🌞";
  } else {
    toggleBtn.textContent = "🌙";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    toggleBtn.textContent = isLight ? "🌞" : "🌙";

    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}
