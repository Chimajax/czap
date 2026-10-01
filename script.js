const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let nodes = [];
let mouse = { x: 0.5, y: 0.5, active: false };

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildNodes();
}

function buildNodes() {
  nodes = [];
  const mobile = width < 600;
  const spacing = mobile ? 52 : 78;
  const rowHeight = spacing * 0.86;
  const cols = Math.ceil(width / spacing) + 3;
  const rows = Math.ceil(height / rowHeight) + 3;
  const startX = -spacing * 2;
  const startY = -rowHeight * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacing + (r % 2 ? spacing / 2 : 0);
      const y = startY + r * rowHeight;
      nodes.push({
        x, y,
        baseX: x, baseY: y,
        phase: Math.random() * Math.PI * 2,
        pulse: Math.random(),
        size: mobile ? 3.2 : 5.2
      });
    }
  }
}

function drawHex(x, y, radius, alpha) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + i * Math.PI / 3;
    const px = x + Math.cos(a) * radius;
    const py = y + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(160, 28, 47, ${alpha})`;
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

function draw(t) {
  ctx.clearRect(0, 0, width, height);

  const time = t * 0.00045;
  const mx = (mouse.x - 0.5) * 24;
  const my = (mouse.y - 0.5) * 18;
  const mobile = width < 600;
  const radius = mobile ? 29 : 43;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const wave = Math.sin(time * 2 + n.phase + n.baseX * 0.008) * (mobile ? 2 : 3);
    const x = n.baseX + mx * (n.baseX / Math.max(width, 1)) * 0.25;
    const y = n.baseY + wave + my * (n.baseY / Math.max(height, 1)) * 0.18;

    drawHex(x, y, radius, 0.11);

    const glow = 0.13 + 0.09 * (Math.sin(time * 3 + n.phase) + 1);
    ctx.beginPath();
    ctx.arc(x, y, n.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(222, 47, 69, ${glow})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(220, 35, 58, .42)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Larger red Czap core: the central node anchors the blockchain network.
  const coreX = width * 0.5 + mx * 0.15;
  const coreY = height * 0.5 + my * 0.12;
  const coreR = mobile ? 18 : 28;
  const corePulse = 1 + Math.sin(time * 4) * 0.08;
  ctx.beginPath();
  ctx.arc(coreX, coreY, coreR * 2.6 * corePulse, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(175,23,45,.045)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(coreX, coreY, coreR * 1.45, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(235,56,79,.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  const coreGradient = ctx.createRadialGradient(coreX-coreR*.25,coreY-coreR*.25,2,coreX,coreY,coreR);
  coreGradient.addColorStop(0,"rgba(255,87,105,.98)");
  coreGradient.addColorStop(.45,"rgba(205,34,57,.92)");
  coreGradient.addColorStop(1,"rgba(91,10,23,.96)");
  ctx.beginPath();
  ctx.arc(coreX,coreY,coreR*corePulse,0,Math.PI*2);
  ctx.fillStyle=coreGradient;
  ctx.shadowBlur=35;
  ctx.shadowColor="rgba(215,37,61,.7)";
  ctx.fill();
  ctx.shadowBlur=0;

  // A few slow-moving "transactions" across the network.
  if (!reduceMotion) {
    const travel = (t * 0.000018) % 1;
    for (let k = 0; k < 4; k++) {
      const idx = Math.floor(((travel + k * 0.24) % 1) * nodes.length);
      const a = nodes[idx];
      const b = nodes[(idx + 7) % nodes.length];
      if (!a || !b) continue;
      const p = (travel * 1.8 + k * 0.17) % 1;
      const x = a.baseX + (b.baseX - a.baseX) * p;
      const y = a.baseY + (b.baseY - a.baseY) * p;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(244, 75, 94, .8)";
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(220, 39, 62, .8)";
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  if (!reduceMotion) requestAnimationFrame(draw);
}

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) / r.width;
  mouse.y = (e.clientY - r.top) / r.height;
  mouse.active = true;
});

canvas.addEventListener("pointerleave", () => {
  mouse.x = 0.5;
  mouse.y = 0.5;
  mouse.active = false;
});

window.addEventListener("resize", resize);
resize();
if (reduceMotion) draw(0);
else requestAnimationFrame(draw);

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

toggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
});

mobileMenu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

// Subtle reveal on scroll
const revealTargets = document.querySelectorAll(
  ".statement-content, .network-copy, .ai-copy, .research-content, .build-content, .ecosystem-content, .cta-inner"
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));
