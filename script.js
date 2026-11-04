const canvas=document.getElementById('fireworks'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const target=new Date('2026-11-05T00:00:00+03:00').getTime();
let w,h,dpr,meteors=[],lastMeteor=0,nextMeteor=0;
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
addEventListener('resize',resize);resize();
function spawnMeteor(){meteors.push({x:w*(.08+Math.random()*.84),y:h*(.03+Math.random()*.38),vx:-(.14+Math.random()*.28),vy:.12+Math.random()*.24,life:220+Math.random()*100,len:24+Math.random()*34,brightness:.65+Math.random()*.35});}
function drawMeteors(){meteors=meteors.filter(m=>m.life>0);ctx.save();ctx.globalCompositeOperation='lighter';
for(const m of meteors){m.x+=m.vx;m.y+=m.vy;m.life--;const a=Math.min(1,m.life/55)*m.brightness;
ctx.strokeStyle='rgba(245,245,255,'+a+')';ctx.lineWidth=1.35;ctx.shadowBlur=7;ctx.shadowColor='rgba(235,240,255,.8)';ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.vx*m.len,m.y-m.vy*m.len);ctx.stroke();
ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(m.x,m.y,1.15,0,6.28);ctx.fill();}
ctx.restore();}
function frame(t){ctx.clearRect(0,0,w,h);if(t>=nextMeteor){spawnMeteor();nextMeteor=t+2500+Math.random()*4500;}drawMeteors();requestAnimationFrame(frame);}
function timer(){let left=Math.max(0,target-Date.now()),d=Math.floor(left/86400000);left%=86400000;let hh=Math.floor(left/3600000);left%=3600000;let mm=Math.floor(left/60000),ss=Math.floor(left%60000/1000);$('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(hh).padStart(2,'0');$('minutes').textContent=String(mm).padStart(2,'0');$('seconds').textContent=String(ss).padStart(2,'0');}
timer();setInterval(timer,250);requestAnimationFrame(frame);