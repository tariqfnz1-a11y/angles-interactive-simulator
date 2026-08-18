// script.js — draws an angle with one fixed ray and one movable ray
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const range = document.getElementById('angleRange');
const output = document.getElementById('angleValue');
const randomBtn = document.getElementById('randomBtn');
let angle = Number(range.value); // degrees

// geometry
function getCenter(){return {x: canvas.width/2, y: canvas.height/2 + 30}} // lower center
const radius = () => Math.min(canvas.width, canvas.height) * 0.35;

function degToRad(d){return d * Math.PI/180}
function radToDeg(r){return r * 180/Math.PI}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const c = getCenter();
  const r = radius();
  // circle
  ctx.beginPath(); ctx.arc(c.x,c.y,r,0,Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=2; ctx.stroke();

  // fixed ray at 0° (to the right)
  const rayA = {x: c.x + r*Math.cos(0), y: c.y + r*Math.sin(0)};
  // moving ray at -angle (canvas y increases downward)
  const aRad = -degToRad(angle);
  const rayB = {x: c.x + r*Math.cos(aRad), y: c.y + r*Math.sin(aRad)};

  // draw rays
  ctx.strokeStyle = '#0f172a'; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(rayA.x,rayA.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(rayB.x,rayB.y); ctx.stroke();

  // angle arc
  const start = aRad>0?0:aRad; const end = aRad>0?aRad:0; // draw small arc between
  ctx.beginPath(); ctx.strokeStyle = 'rgba(255,140,0,0.8)'; ctx.lineWidth=10;
  ctx.arc(c.x,c.y,r*0.35, end, start, aRad>0); ctx.stroke();

  // handle (draggable) on moving ray
  const handle = {x: rayB.x, y: rayB.y};
  ctx.beginPath(); ctx.fillStyle = '#ff8c00'; ctx.strokeStyle='#7a3f00'; ctx.lineWidth=2; ctx.arc(handle.x,handle.y,10,0,Math.PI*2); ctx.fill(); ctx.stroke();

  // angle text
  ctx.fillStyle = '#0f172a'; ctx.font='24px system-ui,Arial'; ctx.textAlign='center'; ctx.fillText(angle + '°', c.x, c.y - r - 10);
}

function setAngle(deg){angle = Math.round(((deg%360)+360)%360); range.value = angle; output.textContent = angle + '°'; draw();}

// range input
range.addEventListener('input', e=> setAngle(Number(e.target.value)));
range.addEventListener('keydown', e=>{
  const step = e.shiftKey?5:1;
  if(e.key==='ArrowLeft' || e.key==='ArrowDown'){ e.preventDefault(); setAngle(angle - step)}
  if(e.key==='ArrowRight' || e.key==='ArrowUp'){ e.preventDefault(); setAngle(angle + step)}
});

randomBtn.addEventListener('click', ()=> setAngle(Math.floor(Math.random()*181)+1)); // 1..181

// dragging on canvas
let dragging = false;
function canvasPosToAngle(x,y){const c = getCenter(); const dx = x - c.x; const dy = y - c.y; const a = radToDeg(Math.atan2(-dy,dx)); return ((a%360)+360)%360;}

canvas.addEventListener('pointerdown', e=>{
  canvas.setPointerCapture(e.pointerId);
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
  const c = getCenter(); const dist = Math.hypot(x-c.x,y-c.y);
  if(Math.abs(dist - radius()) < 30){ dragging = true; setAngle(Math.round(canvasPosToAngle(x,y))); }
});
canvas.addEventListener('pointermove', e=>{ if(!dragging) return; const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; setAngle(Math.round(canvasPosToAngle(x,y))); });
canvas.addEventListener('pointerup', e=>{ dragging = false; try{canvas.releasePointerCapture(e.pointerId)}catch{} });
canvas.addEventListener('pointercancel', ()=> dragging=false);

// resize handling
function resizeCanvas(){ // keep resolution high on HiDPI
  const ratio = window.devicePixelRatio || 1;
  const width = Math.min(window.innerWidth-40, 900);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(400 * ratio);
  canvas.style.width = Math.round(width) + 'px';
  canvas.style.height = Math.round(400) + 'px';
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
window.addEventListener('resize', ()=>{ resizeCanvas(); draw(); });

// init
resizeCanvas(); setAngle(angle);

// expose functions for quiz
window.setAngle = setAngle;
window.getCurrentAngle = ()=> angle;
