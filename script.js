const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);
const target = new Date('2026-11-05T00:00:00+03:00').getTime();

let w, h, dpr, particles = [], rockets = [], shooting = null;
let lastLaunch = 0, lastShooting = 0, stars = [];
const palette = ['#ffd7a0','#ff9eb5','#b7a5ff','#8deaff','#fff2c6'];

function resize(){
  dpr=Math.min(devicePixelRatio||1,2); w=innerWidth; h=innerHeight;
  canvas.width=w*dpr; canvas.height=h*dpr; canvas.style.width=w+'px'; canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stars=Array.from({length:Math.floor(w*h/9000)},()=>({x:Math.random()*w,y:Math.random()*h*.62,r:.35+Math.random()*1.15,a:.25+Math.random()*.65,phase:Math.random()*6}));
}
addEventListener('resize',resize); resize();

function landscape(t){
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#030714'); sky.addColorStop(.52,'#101b36'); sky.addColorStop(1,'#172b3b');
  ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
  // soft moon glow
  const glow=ctx.createRadialGradient(w*.78,h*.19,2,w*.78,h*.19,h*.42);
  glow.addColorStop(0,'rgba(157,190,255,.12)'); glow.addColorStop(1,'rgba(90,130,220,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  stars.forEach(s=>{ctx.globalAlpha=s.a*(.72+.28*Math.sin(t*.0007+s.phase));ctx.fillStyle='#dce8ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
  // distant mountain silhouettes
  mountain(h*.57,'#101a2b',.17,11);
  mountain(h*.66,'#0a1424',.12,7);
  mountain(h*.73,'#07111e',.09,5);
  // lake and reflection
  const lake=ctx.createLinearGradient(0,h*.72,0,h);
  lake.addColorStop(0,'#071521');lake.addColorStop(1,'#02070e');
  ctx.fillStyle=lake;ctx.fillRect(0,h*.72,w,h*.28);
  ctx.globalAlpha=.16;
  for(let i=0;i<45;i++){let y=h*.74+i*h*.006;ctx.fillStyle=i%3?'#7ca6c8':'#c0d9ee';ctx.fillRect(w*(.22+Math.sin(i*2.1)*.2),y,w*(.08+Math.random()*.16),.6);}
  ctx.globalAlpha=1;
  // dark foreground shore
  ctx.fillStyle='#030910';ctx.beginPath();ctx.moveTo(0,h*.86);ctx.quadraticCurveTo(w*.18,h*.79,w*.34,h*.88);ctx.quadraticCurveTo(w*.7,h*.83,w,h*.9);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
}
function mountain(base,color,amp,seed){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,base);
  for(let x=0;x<=w+30;x+=30){let y=base-amp*h*(.35+.65*Math.abs(Math.sin(x*.006+seed)*Math.cos(x*.013+seed)));ctx.lineTo(x,y);}
  ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
}
function starFall(){
  const x=w*(.15+Math.random()*.7), y=h*(.08+Math.random()*.25);
  shooting={x,y,vx:-(5+Math.random()*4),vy:3+Math.random()*2,life:32};
}
function burst(x,y,color,kind='normal'){
  const n=kind==='willow'?170:110+Math.random()*65;
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, speed=(kind==='willow'?1.2:1.8)+Math.random()*(kind==='willow'?3.3:5.2);
    particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:kind==='willow'?100+Math.random()*45:65+Math.random()*45,max:150,color:Math.random()<.78?color:palette[Math.floor(Math.random()*palette.length)],size:.8+Math.random()*1.7,drag:.986,gravity:.035});
  }
  for(let i=0;i<35;i++){const a=Math.random()*6.28,s=Math.random()*3;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:25+Math.random()*25,max:50,color:'#fff7d6',size:.7,drag:.96,gravity:.02});}
}
function launch(){
  const x=w*(.12+Math.random()*.76), ridge=h*(.64+Math.random()*.08);
  rockets.push({x,y:ridge,vx:(Math.random()-.5)*1.1,vy:-(5.5+Math.random()*2.2),top:h*(.12+Math.random()*.28),color:palette[Math.floor(Math.random()*palette.length)],trail:[]});
}
function drawFireworks(now){
  // Trail persistence: transparent veil over previous frame
  ctx.fillStyle='rgba(2,5,12,.19)';ctx.fillRect(0,0,w,h);
  if(now-lastLaunch>650+Math.random()*700){launch();lastLaunch=now;}
  rockets=rockets.filter(r=>!r.done);
  for(const r of rockets){
    r.trail.push({x:r.x,y:r.y});if(r.trail.length>8)r.trail.shift();
    r.x+=r.vx;r.y+=r.vy;r.vy+=.025;
    ctx.strokeStyle=r.color;ctx.lineWidth=1.5;ctx.globalAlpha=.65;ctx.beginPath();r.trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r.x,r.y,1.7,0,6.28);ctx.fill();
    if(r.y<=r.top){burst(r.x,r.y,r.color,Math.random()<.25?'willow':'normal');r.done=true;}
  }
}
function drawParticles(){
  particles=particles.filter(p=>p.life>0);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const p of particles){
    p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.x+=p.vx;p.y+=p.vy;p.life--;
    ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowBlur=9;ctx.shadowColor=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();
  }ctx.restore();ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function frame(now){
  const after=Date.now()>=target;
  // redraw scenery before the fireworks layer
  ctx.globalCompositeOperation='source-over';landscape(now);
  if(after){
    if(now-lastLaunch>700+Math.random()*650){launch();lastLaunch=now;}
    drawFireworks(now);
  }else{
    // Rare, quiet shooting stars before the countdown ends
    if(!shooting&&now-lastShooting>9000+Math.random()*13000){starFall();lastShooting=now;}
    if(shooting){
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(220,238,255,.85)';ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(shooting.x,shooting.y);ctx.lineTo(shooting.x-shooting.vx*5,shooting.y-shooting.vy*5);ctx.stroke();ctx.restore();
      shooting.x+=shooting.vx;shooting.y+=shooting.vy;shooting.life--;
      if(shooting.life<=0)shooting=null;
    }
  }
  drawParticles();
  requestAnimationFrame(frame);
}
function updateTimer(){
  let left=Math.max(0,target-Date.now());
  const d=Math.floor(left/86400000);left%=86400000;
  const hh=Math.floor(left/3600000);left%=3600000;
  const mm=Math.floor(left/60000);left%=60000;const ss=Math.floor(left/1000);
  $('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(hh).padStart(2,'0');
  $('minutes').textContent=String(mm).padStart(2,'0');$('seconds').textContent=String(ss).padStart(2,'0');
}
updateTimer();setInterval(updateTimer,250);requestAnimationFrame(frame);