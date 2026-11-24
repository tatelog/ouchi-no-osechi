function openTableFlip() {
 const d = draft();
 const dishes = d.tiers.flat().filter(id => id != null);
 if (!dishes.length) return;
 const game = document.createElement('dialog');
 game.className = 'flip-game';
 game.setAttribute('aria-label', 'ちゃぶ台返し');
 game.innerHTML = '<h2>ちゃぶ台返し</h2><canvas width="640" height="330" aria-hidden="true"></canvas><p role="status"></p><meter min="0" max="100" aria-label="タイミング"></meter><div><button class="primary flip-launch"></button><button class="flip-exit">お重に戻る</button></div>';
 document.body.append(game);
 const canvas = game.querySelector('canvas'), ctx = canvas.getContext('2d');
 const status = game.querySelector('p'), meter = game.querySelector('meter'), launch = game.querySelector('.flip-launch');
 const images = new Map();
 for (const id of new Set(dishes)) {
   const img = new Image();
   img.src = id === 0 ? './assets/art/'+(d.kam===3?'white':'pink')+'-slice.png' : foodPath(id);
   images.set(id,img);
 }
 let phase, start, angle, power, pieces, frame;
 let best = 0;
 try { best = Number(localStorage.getItem('osechi-flip-best')) || 0 } catch {}
 function reset() {
   phase='angle'; start=performance.now(); pieces=[]; angle=45; power=0;
   meter.hidden=false;launch.hidden=false;launch.textContent='角度を決める';
   status.textContent='飛ばす角度を狙ってタップ'+(best?'　自己ベスト '+best.toFixed(1)+' m':'');
   frame=requestAnimationFrame(draw);
 }
 function timing(now) {return (1-Math.cos((now-start)/370))/2}
 function aimed(now) {return 15+60*timing(now)}
 function force(now) {return 8+19*timing(now)}
 launch.onclick=()=>{
   const now=performance.now();
   if(phase==='result'){reset();return}
   if(phase==='angle'){angle=aimed(now);phase='power';start=now;status.textContent='力をためて、タイミングよく返そう！';launch.textContent='ちゃぶ台を返す！';return}
   if(phase!=='power')return;
   power=force(now);phase='flight';start=now;launch.hidden=true;meter.hidden=true;
   status.textContent='具材が飛んでいく！';
   pieces=dishes.map(id=>{
     const radians=(angle+(Math.random()-.5)*12)*Math.PI/180;
     const speed=power*(.85+.3*Math.random());
     const vx=speed*Math.cos(radians), vy=speed*Math.sin(radians);
     const land=(vy+Math.sqrt(vy*vy+2*9.81*1.6))/9.81;
     return {id,vx,vy,land,distance:land*vx};
   });
 };
 game.querySelector('.flip-exit').onclick=()=>game.close();
 game.addEventListener('close',()=>{cancelAnimationFrame(frame);game.remove()},{once:true});
 function photo(id,x,y,size,rotation) {
   const img=images.get(id);
   if(!img.naturalWidth)return;
   const scale=size/Math.max(img.naturalWidth,img.naturalHeight);
   ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
   const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
   ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();
 }
 function draw(now) {
   if(!game.open)return;
   const flying=phase==='flight';
   const t=flying?(now-start)/650:0;
   const lead=flying?Math.max(...pieces.map(p=>p.vx*Math.min(t,p.land))):0;
   const scale=Math.min(15,510/Math.max(1,lead),flying?215/Math.max(1,...pieces.map(p=>1.6+p.vy*p.vy/19.62)):15);
   const ground=271;
   ctx.fillStyle='#f9edce';ctx.fillRect(0,0,640,330);
   ctx.fillStyle='#c5bf86';ctx.fillRect(0,ground,640,59);
   ctx.fillStyle='#5a4833';ctx.font='18px serif';
   for(let m=0;60+m*scale<625;m+=10){const x=60+m*scale;ctx.fillRect(x,ground,2,10);ctx.fillText(m+' m',x-8,ground+34)}
   ctx.save();ctx.translate(60,ground-24);ctx.rotate(flying?-Math.min(t*5,2.2):0);
   ctx.fillStyle='#824321';ctx.fillRect(-40,-10,100,11);ctx.fillRect(-30,0,8,24);ctx.fillRect(42,0,8,24);ctx.restore();
   if(flying){
     for(const p of pieces){const u=Math.min(t,p.land);photo(p.id,60+p.vx*u*scale,ground-14-Math.max(0,1.6+p.vy*u-4.905*u*u)*scale,45,u*3)}
     if(pieces.every(p=>t>=p.land)){
       const winner=pieces.reduce((a,b)=>a.distance>=b.distance?a:b);
       best=Math.max(best,winner.distance);
       try{localStorage.setItem('osechi-flip-best',String(best))}catch{}
       status.textContent='最遠は'+names[winner.id]+'！ '+winner.distance.toFixed(1)+' m（自己ベスト '+best.toFixed(1)+' m）';
       phase='result';launch.hidden=false;launch.textContent='もう一度返す';return;
     }
   }else{
     dishes.forEach((id,i)=>photo(id,33+(i%6)*11,ground-45-Math.floor(i/6)*6,33,0));
     const deg=phase==='angle'?aimed(now):angle;
     const rad=deg*Math.PI/180;
     ctx.strokeStyle='#a43124';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(80,ground-55);ctx.lineTo(80+75*Math.cos(rad),ground-55-75*Math.sin(rad));ctx.stroke();
     meter.value=100*timing(now);ctx.fillText(phase==='angle'?Math.round(deg)+'°':'力 '+Math.round(meter.value)+'%',115,85);
   }
   frame=requestAnimationFrame(draw);
 }
 game.showModal();reset();
}
