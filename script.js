const canvas=document.getElementById('fireworks'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const target=new Date('2026-11-05T00:00:00+03:00').getTime();
let w,h,dpr,meteors=[],lastMeteor=0,stars=[],clouds=[];
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:Math.floor(w*h/950)},()=>({x:Math.random()*w,y:Math.random()*h*.78,r:.25+Math.random()*.85,a:.18+Math.random()*.65,tw:Math.random()*6}));clouds=Array.from({length:30},(_,i)=>({x:(i/30)*w+(Math.random()-.5)*100,y:h*(.68+Math.random()*.2),r:h*(.035+Math.random()*.075,speed:.025+Math.random()*.09}));}
addEventListener('resize',resize);resize();
function mountain(base,amp,phase,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+20;x+=16){let y=base-amp*(.25+.75*Math.abs(Math.sin(x*.004+phase)*Math.cos(x*.009-phase)));ctx.lineTo(x,y);}ctx.lineTo(w,h);ctx.closePath();ctx.fill();}
function cloud(c){const g=ctx.createRadialGradient(c.x,c.y,2,c.x,c.y,c.r*2.4);g.addColorStop(0,'rgba(110,75,150,.27)');g.addColorStop(.45,'rgba(69,48,103,.19)');g.addColorStop(1,'rgba(8,10,24,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(c.x,c.y,c.r*2.5,c.r*.75,0,0,6.28);ctx.fill();}
function scene(t){
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#010208');sky.addColorStop(.42,'#070b1c');sky.addColorStop(.72,'#17112a');sky.addColorStop(1,'#090b16');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 const haze=ctx.createRadialGradient(w*.5,h*.67,0,w*.5,h*.67,h*.55);haze.addColorStop(0,'rgba(91,46,132,.2)');haze.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
 stars.forEach(s=>{ctx.globalAlpha=s.a*(.7+.3*Math.sin(t*.0003+s.tw));ctx.fillStyle='#e9e7ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fill();});ctx.globalAlpha=1;
 mountain(h*.77,h*.12,1.4,'#121225');mountain(h*.82,h*.085,3.7,'#090d1a');mountain(h*.86,h*.045,2.2,'#030711');
 clouds.forEach(c=>{c.x+=c.speed;if(c.x>w+120)c.x=-120;cloud(c);});
 const water=ctx.createLinearGradient(0,h*.84,0,h);water.addColorStop(0,'#080b19');water.addColorStop(.4,'#090817');water.addColorStop(1,'#010207');ctx.fillStyle=water;ctx.fillRect(0,h*.84,w,h*.16);
 ctx.globalAlpha=.14;for(let i=0;i<100;i++){let y=h*(.845+Math.random()*.145),x=Math.random()*w;ctx.fillStyle=['#9c62ff','#4a8dff','#ff4d9d'][i%3];ctx.fillRect(x,y,8+Math.random()*85,.5+Math.random());}ctx.globalAlpha=1;
 ctx.fillStyle='#010309';ctx.beginPath();ctx.moveTo(0,h*.91);ctx.quadraticCurveTo(w*.22,h*.88,w*.43,h*.925);ctx.quadraticCurveTo(w*.72,h*.89,w,h*.93);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
}
function spawnMeteor(){meteors.push({x:w*(.15+Math.random()*.75),y:h*(.04+Math.random()*.4),vx:-(.18+Math.random()*.35),vy:.16+Math.random()*.28,life:240,len:20+Math.random()*24});}
function drawMeteors(){meteors=meteors.filter(m=>m.life>0);ctx.save();ctx.globalCompositeOperation='lighter';for(const m of meteors){m.x+=m.vx;m.y+=m.vy;m.life--;let alpha=Math.min(1,m.life/45);ctx.strokeStyle='rgba(255,222,155,'+(.65*alpha)+')';ctx.lineWidth=1.2;ctx.shadowBlur=8;ctx.shadowColor='#ffd98b';ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.vx*m.len,m.y-m.vy*m.len);ctx.stroke();ctx.fillStyle='#fff7df';ctx.beginPath();ctx.arc(m.x,m.y,1.1,0,6.28);ctx.fill();}ctx.restore();}
function frame(t){scene(t);if(t-lastMeteor>7000+Math.random()*12000){spawnMeteor();lastMeteor=t;}drawMeteors();requestAnimationFrame(frame);}
function timer(){let left=Math.max(0,target-Date.now()),d=Math.floor(left/86400000);left%=86400000;let hh=Math.floor(left/3600000);left%=3600000;let mm=Math.floor(left/60000),ss=Math.floor(left%60000/1000);$('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(hh).padStart(2,'0');$('minutes').textContent=String(mm).padStart(2,'0');$('seconds').textContent=String(ss).padStart(2,'0');}
timer();setInterval(timer,250);requestAnimationFrame(frame);