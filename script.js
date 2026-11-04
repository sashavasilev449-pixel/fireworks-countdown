const canvas=document.getElementById('fireworks'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const target=new Date('2026-11-05T00:00:00+03:00').getTime();
let w,h,dpr,particles=[],rockets=[],meteor=null,lastMeteor=0,lastLaunch=0,stars=[],clouds=[];
const colors=['#ff4d9d','#9c62ff','#4a8dff','#ffbd70','#fff2cf','#64eaff'];

function resize(){
 dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
 canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
 stars=Array.from({length:Math.floor(w*h/1600)},()=>({x:Math.random()*w,y:Math.random()*h*.78,r:.25+Math.random()*.9,a:.15+Math.random()*.65,tw:Math.random()*6}));
 clouds=Array.from({length:24},(_,i)=>({x:(i/24)*w+(Math.random()-.5)*100,y:h*(.66+Math.random()*.2),r:h*(.035+Math.random()*.07),speed:.05+Math.random()*.13}));
}
addEventListener('resize',resize);resize();

function pathMountain(base,amp,phase,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h);
 for(let x=0;x<=w+20;x+=20){let yy=base-amp*(.25+.75*Math.abs(Math.sin(x*.004+phase)*Math.cos(x*.009-phase)));ctx.lineTo(x,yy);}
 ctx.lineTo(w,h);ctx.closePath();ctx.fill();
}
function drawCloud(c){
 const g=ctx.createRadialGradient(c.x,c.y,2,c.x,c.y,c.r*2.2);
 g.addColorStop(0,'rgba(106,71,142,.22)');g.addColorStop(.5,'rgba(65,43,95,.16)');g.addColorStop(1,'rgba(10,12,28,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(c.x,c.y,c.r*2.3,c.r*.7,0,0,Math.PI*2);ctx.fill();
}
function scenery(t){
 const sky=ctx.createLinearGradient(0,0,0,h);
 sky.addColorStop(0,'#01020a');sky.addColorStop(.38,'#070b20');sky.addColorStop(.68,'#17132d');sky.addColorStop(1,'#080b17');
 ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 const neb=ctx.createRadialGradient(w*.5,h*.62,0,w*.5,h*.62,h*.55);
 neb.addColorStop(0,'rgba(91,46,132,.17)');neb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=neb;ctx.fillRect(0,0,w,h);
 stars.forEach(s=>{ctx.globalAlpha=s.a*(.7+.3*Math.sin(t*.00035+s.tw));ctx.fillStyle='#e9e7ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fill();});ctx.globalAlpha=1;
 // distant ridges, depth layers
 pathMountain(h*.77,h*.12,1.4,'#111225');pathMountain(h*.82,h*.085,3.7,'#090d1a');pathMountain(h*.86,h*.045,2.2,'#030711');
 // clouds with soft violet illumination
 clouds.forEach(c=>{c.x+=c.speed;if(c.x>w+100)c.x=-100;drawCloud(c);});
 // water and horizon reflections
 const water=ctx.createLinearGradient(0,h*.84,0,h);water.addColorStop(0,'#080b19');water.addColorStop(.35,'#090817');water.addColorStop(1,'#010207');
 ctx.fillStyle=water;ctx.fillRect(0,h*.84,w,h*.16);
 ctx.globalAlpha=.16;
 for(let i=0;i<95;i++){let y=h*(.845+Math.random()*.145),x=Math.random()*w,len=8+Math.random()*100;ctx.fillStyle=colors[i%colors.length];ctx.fillRect(x,y,len,.5+Math.random());}
 ctx.globalAlpha=1;
 // foreground silhouette
 ctx.fillStyle='#010309';ctx.beginPath();ctx.moveTo(0,h*.91);ctx.quadraticCurveTo(w*.22,h*.88,w*.43,h*.925);ctx.quadraticCurveTo(w*.72,h*.89,w,h*.93);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
}
function fallingStar(){
 meteor={x:w*(.15+Math.random()*.7),y:h*(.08+Math.random()*.32),vx:-(.45+Math.random()*.65),vy:.35+Math.random()*.45,life:150};
}
function starTrail(){
 if(!meteor)return;ctx.save();ctx.globalCompositeOperation='lighter';
 const fade=meteor.life/150;ctx.strokeStyle='rgba(255,220,145,'+(.65*fade)+')';ctx.lineWidth=1.4;
 ctx.shadowBlur=9;ctx.shadowColor='#ffd98b';ctx.beginPath();ctx.moveTo(meteor.x,meteor.y);ctx.lineTo(meteor.x-meteor.vx*17,meteor.y-meteor.vy*17);ctx.stroke();
 ctx.fillStyle='#fff5d5';ctx.beginPath();ctx.arc(meteor.x,meteor.y,1.3,0,6.28);ctx.fill();ctx.restore();
 meteor.x+=meteor.vx;meteor.y+=meteor.vy;meteor.life--;if(meteor.life<=0)meteor=null;
}
function explosion(x,y,color,kind){
 const n=kind==='willow'?230:160+Math.random()*100;
 for(let i=0;i<n;i++){
  let a=Math.random()*6.283,s=(kind==='willow'?1.2:1.7)+Math.random()*(kind==='willow'?3.7:6.4);
  particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:kind==='willow'?115+Math.random()*75:75+Math.random()*55,max:190,color:Math.random()<.8?color:colors[Math.floor(Math.random()*colors.length)],size:.7+Math.random()*1.7,drag:.989,gravity:.025});
 }
 for(let i=0;i<65;i++){let a=Math.random()*6.28,s=Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:30+Math.random()*35,max:65,color:'#fff7df',size:.7,drag:.97,gravity:.02});}
}
function launch(){
 // launch from behind distant ridge, then burst high above horizon
 const x=w*(.08+Math.random()*.84),base=h*(.79+Math.random()*.045);
 rockets.push({x,y:base,vx:(Math.random()-.5)*.5,vy:-(6.5+Math.random()*2.8),top:h*(.12+Math.random()*.34),color:colors[Math.floor(Math.random()*colors.length)],trail:[],done:false});
}
function fireworks(t){
 if(t-lastLaunch>450+Math.random()*550){launch();lastLaunch=t;}
 rockets=rockets.filter(r=>!r.done);
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const r of rockets){
  r.trail.push({x:r.x,y:r.y});if(r.trail.length>15)r.trail.shift();
  r.x+=r.vx;r.y+=r.vy;r.vy+=.018;
  ctx.strokeStyle=r.color;ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.beginPath();r.trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.shadowBlur=8;ctx.shadowColor=r.color;ctx.beginPath();ctx.arc(r.x,r.y,2,0,6.28);ctx.fill();
  if(r.y<=r.top){explosion(r.x,r.y,r.color,Math.random()<.3?'willow':'normal');r.done=true;}
 }
 ctx.restore();
}
function drawParticles(){
 particles=particles.filter(p=>p.life>0);ctx.save();ctx.globalCompositeOperation='lighter';
 for(const p of particles){p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.x+=p.vx;p.y+=p.vy;p.life--;
 ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowBlur=10;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();}
 ctx.restore();ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function frame(t){
 scenery(t);
 if(Date.now()>=target)fireworks(t);
 else if(!meteor&&t-lastMeteor>12000+Math.random()*16000){fallingStar();lastMeteor=t;}
 if(Date.now()<target)starTrail();
 drawParticles();requestAnimationFrame(frame);
}
function timer(){
 let left=Math.max(0,target-Date.now()),d=Math.floor(left/86400000);left%=86400000;
 let hh=Math.floor(left/3600000);left%=3600000;let mm=Math.floor(left/60000);let ss=Math.floor(left%60000/1000);
 $('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(hh).padStart(2,'0');$('minutes').textContent=String(mm).padStart(2,'0');$('seconds').textContent=String(ss).padStart(2,'0');
}
timer();setInterval(timer,250);requestAnimationFrame(frame);