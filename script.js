const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const target = new Date('2026-11-05T00:00:00+03:00').getTime();

let width, height, dpr, particles = [], rockets = [], lastLaunch = 0;
const colors = ['#ff4f8b', '#ffd166', '#7afcff', '#a78bfa', '#70ff9b', '#ff884d', '#ffffff'];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = innerWidth; height = innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize); resize();

function launch() {
  const x = width * (.12 + Math.random() * .76);
  rockets.push({ x, y: height + 8, vx: (Math.random() - .5) * 1.4,
    vy: -(6 + Math.random() * 3), targetY: height * (.12 + Math.random() * .42),
    color: colors[Math.floor(Math.random() * colors.length)] });
}
function explode(x, y, color) {
  const count = 90 + Math.floor(Math.random() * 70);
  const style = Math.random();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (style < .3 ? 2.2 : 1) + Math.random() * (style < .3 ? 3 : 5.5);
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 55 + Math.random() * 45, max: 100, color: Math.random() < .75 ? color : colors[Math.floor(Math.random()*colors.length)],
      size: 1 + Math.random() * 2.2, drag: .985 + Math.random() * .01 });
  }
  // A few glittering trails around the burst
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 25+Math.random()*30,
      max: 55, color: '#fff8d8', size: .8+Math.random(), drag: .97 });
  }
}
function frame(now) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(2,4,11,.22)';
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  if (now - lastLaunch > 520 + Math.random()*500) { launch(); lastLaunch = now; }
  rockets = rockets.filter(r => r.y > r.targetY);
  for (const r of rockets) {
    r.x += r.vx; r.y += r.vy; r.vy += .035;
    ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, Math.PI*2);
    ctx.fillStyle = r.color; ctx.fill();
    ctx.beginPath(); ctx.moveTo(r.x, r.y+8); ctx.lineTo(r.x-r.vx*2, r.y+22);
    ctx.strokeStyle = r.color; ctx.globalAlpha = .45; ctx.stroke(); ctx.globalAlpha = 1;
    if (r.y <= r.targetY) explode(r.x, r.y, r.color);
  }
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.vx *= p.drag; p.vy = p.vy*p.drag + .035;
    p.x += p.vx; p.y += p.vy; p.life--;
    ctx.globalAlpha = Math.max(0, p.life/p.max);
    ctx.fillStyle = p.color; ctx.shadowBlur = 12; ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  requestAnimationFrame(frame);
}
function updateTimer() {
  let left = Math.max(0, target - Date.now());
  const days = Math.floor(left / 86400000); left %= 86400000;
  const hours = Math.floor(left / 3600000); left %= 3600000;
  const minutes = Math.floor(left / 60000); left %= 60000;
  const seconds = Math.floor(left / 1000);
  $('days').textContent = String(days).padStart(2, '0');
  $('hours').textContent = String(hours).padStart(2, '0');
  $('minutes').textContent = String(minutes).padStart(2, '0');
  $('seconds').textContent = String(seconds).padStart(2, '0');
}
updateTimer(); setInterval(updateTimer, 250); requestAnimationFrame(frame);