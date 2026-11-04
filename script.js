const canvas=document.getElementById('fireworks'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const target=new Date('2026-11-05T00:00:00+03:00').getTime();
let w,h,dpr,meteors=[],shells=[],sparks=[],nextMeteor=0,lastLaunch=0;
const palette=['#ff4d9d','#b16cff','#4c8dff','#ffd38a','#fff4d5','#67eaff'];
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
addEventListener('resize',resize);resize();
function meteor(){meteors.push({x:w*Math.random(),y:h*(.05+Math.random()*.35),vx:(Math.random()-.5)*.22,vy:.18+Math.random()*.24,life:230,len:25+Math.random()*35});}
function drawMeteors(){meteors=meteors.filter(m=>m.life>0);ctx.save();ctx.globalCompositeOperation='lighter';for(const m of meteors){m.x+=m.vx;m.y+=m.vy;m.life--;let a=Math.min(1,m.life/45);ctx.strokeStyle='rgba(250,250,255,'+a*.8+')';ctx.lineWidth=1.3;ctx.shadowBlur=8;ctx.shadowColor='#e9edff';ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.vx*m.len,m.y-m.vy*m.len);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x,m.y,1.2,0,6.28);ctx.fill();}ctx.restore();}
function launch(){const x=w*(.08+Math.random()*.84),y=h*.86; shells.push({x,y,px:x,py:y,vx:(Math.random()-.5)*1.1,vy:-(7.2+Math.random()*2.8),targetY:h*(.12+Math.random()*.38),color:palette[Math.floor(Math.random()*palette.length)],trail:[],age:0});}
function explode(x,y,color,type){const count=type==='willow'?210:150+Math.random()*100;for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=(type==='willow'?1.1:1.7)+Math.random()*(type==='willow'?3.1:5.5);sparks.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:type==='willow'?115+Math.random()*50:65+Math.random()*40,max:160,color:Math.random()<.82?color:palette[Math.floor(Math.random()*palette.length)],size:.7+Math.random()*1.5,gravity:.035,drag:.985,twinkle:Math.random()});}}
function drawShow(t){
 if(t-lastLaunch>550+Math.random()*450){launch();lastLaunch=t;}
 ctx.save();ctx.globalCompositeOperation='lighter';
 shells=shells.filter(s=>!s.dead);
 for(const s of shells){s.trail.push({x:s.x,y:s.y});if(s.trail.length>13)s.trail.shift();s.px=s.x;s.py=s.y;s.x+=s.vx;s.y+=s.vy;s.vy+=.035;s.age++;
 ctx.strokeStyle=s.color;ctx.lineWidth=1.8;ctx.globalAlpha=.75;ctx.beginPath();s.trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.shadowBlur=12;ctx.shadowColor=s.color;ctx.beginPath();ctx.arc(s.x,s.y,2,0,6.28);ctx.fill();
 if(s.y<=s.targetY||s.vy>-.5){explode(s.x,s.y,s.color,Math.random()<.3?'willow':'round');s.dead=true;}}
 sparks=sparks.filter(p=>p.life>0);for(const p of sparks){p.px=p.x;p.py=p.y;p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.x+=p.vx;p.y+=p.vy;p.life--;let a=Math.max(0,p.life/p.max);ctx.globalAlpha=a*(.78+.22*Math.sin(p.life*.22+p.twinkle*8));ctx.fillStyle=p.color;ctx.shadowBlur=10;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();
 // glowing particle streak gives depth and motion
 ctx.globalAlpha=a*.45;ctx.strokeStyle=p.color;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x-p.vx*2,p.y-p.vy*2);ctx.stroke();}
 ctx.restore();ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function frame(t){ctx.clearRect(0,0,w,h);drawShow(t);requestAnimationFrame(frame);}
function timer(){let left=Math.max(0,target-Date.now()),d=Math.floor(left/86400000);left%=86400000;let hh=Math.floor(left/3600000);left%=3600000;let mm=Math.floor(left/60000),ss=Math.floor(left%60000/1000);$('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(hh).padStart(2,'0');$('minutes').textContent=String(mm).padStart(2,'0');$('seconds').textContent=String(ss).padStart(2,'0');}
timer();setInterval(timer,250);requestAnimationFrame(frame);