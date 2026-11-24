function chooseGrandpaMood(moods,onSelect){
 const choices=moods.map(mood=>[mood.name,()=>onSelect(mood)]);
 ask('おじいちゃんのコンディションは？',[...choices,['戻る',()=>{}]]);
}

async function openTableFlip(catching=false,chosenMood=null) {
 if(catching&&!chosenMood){
   try{
     const {moods}=await import('./catch.js?v=5');
     chooseGrandpaMood(moods,mood=>openTableFlip(true,mood));
   }catch{notice('コンディションを読み込めませんでした。もう一度お試しください')}
   return;
 }
 const meal = draft();
 const game = document.createElement('dialog');
 game.className = 'flip-game';
 game.setAttribute('aria-label','ちゃぶ台返し');
 game.innerHTML = '<h2>ちゃぶ台返し</h2><div class="flip-stage"></div><small>上下左右をタップ・クリックで視点変更。ドラッグで回転、ピンチで拡大</small><p role="status">お重をちゃぶ台に載せています…</p><meter min="0" max="100" hidden aria-label="タイミング"></meter><div><button class="primary flip-launch" disabled>角度を決める</button><button class="flip-replay" hidden>リプレイ</button><button class="flip-pause" hidden>一時停止</button><button class="flip-share primary" hidden>Xで投稿</button><button class="flip-exit">お重に戻る</button></div>';
 if(catching){
   game.querySelector('h2').textContent='おばあちゃん、いただきます！';
   game.setAttribute('aria-label','お粗末にしない');
   game.querySelector('small').textContent='印をタップして、落ちる前にキャッチ！　ドラッグ・左右キーでも移動できます';
   const course=document.createElement('canvas');
   course.className='catch-track';course.width=640;course.height=48;course.hidden=true;
   course.setAttribute('aria-label','回収コース。印は具材の着地点、紫はおばあちゃん');
   game.querySelector('.flip-stage').append(course);
 }
 document.body.append(game);
 // Fullscreen the document: modal dialogs themselves are ineligible fullscreen targets.
 const page=document.documentElement;
 const fullscreenRequest=!document.fullscreenElement && page.requestFullscreen
   ? page.requestFullscreen().catch(()=>{}) : null;
 game.showModal();
 const stage=game.querySelector('.flip-stage'), status=game.querySelector('p'), launch=game.querySelector('.flip-launch'), meter=game.querySelector('meter');
 game.querySelector('.flip-exit').onclick=()=>game.close();
 const replay=game.querySelector('.flip-replay'), pause=game.querySelector('.flip-pause');
 let renderer, frame, scene, controls, resize, overlay;
 const textures=new Map();
 game.addEventListener('close',()=>{
   cancelAnimationFrame(frame);controls?.dispose();resize?.disconnect();overlay?.dispose();
   if(fullscreenRequest)fullscreenRequest.then(()=>{
     if(document.fullscreenElement===page && !document.querySelector('.flip-game[open]'))document.exitFullscreen().catch(()=>{});
   });
   scene?.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
   textures.forEach(tex=>tex.dispose());
   renderer?.dispose();renderer?.forceContextLoss();game.remove();
 },{once:true});
 try {
 const [T,{OrbitControls},{elder,moods,catchingGame,throwVelocity,travelTime,throwHeight,bestThrowAngle},{throwOverlay}]=await Promise.all([import('./assets/vendor/three.module.js'),import('./assets/vendor/orbit-controls.js'),import('./catch.js?v=5'),import('./throw-overlay.js')]);
 if(!game.open)return;
 renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 stage.append(renderer.domElement);
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));

 scene=new T.Scene();scene.background=new T.Color(0xffe2b4);
 scene.fog=new T.FogExp2(0xffdfb1,.007);
 const camera=new T.PerspectiveCamera(40,680/480,.05,500);
 function resizeStage(){
   const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);
   camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
 }
 overlay=throwOverlay(T,stage,camera);
 resize=new ResizeObserver(resizeStage);resize.observe(stage);resizeStage();
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enablePan=false;controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=35;
 controls.maxPolarAngle=Math.PI*.49;
 const surface=renderer.domElement;
 let condition=chosenMood??moods[0];
 const pointers=new Set();
 let tap=null;
 surface.addEventListener('pointerdown',event=>{
   pointers.add(event.pointerId);
   tap=pointers.size===1 && event.button===0 ? {id:event.pointerId,x:event.clientX,y:event.clientY} : null;
 });
 surface.addEventListener('pointermove',event=>{
   if(tap?.id===event.pointerId && Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>8)tap=null;
 });
 surface.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);tap=null});
 surface.addEventListener('pointerup',event=>{
   pointers.delete(event.pointerId);
   if(!controls.enabled||tap?.id!==event.pointerId)return;
   tap=null;
   const bounds=surface.getBoundingClientRect();
   const x=(event.clientX-bounds.left)/bounds.width-.5;
   const y=(event.clientY-bounds.top)/bounds.height-.5;
   const orbit=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
   if(Math.abs(x)>=Math.abs(y))orbit.theta+=(x<0?-1:1)*Math.PI/6;
   else orbit.phi=T.MathUtils.clamp(orbit.phi+Math.sign(y)*Math.PI/10,.05,controls.maxPolarAngle);
   camera.position.setFromSpherical(orbit).add(controls.target);
   controls.update();
 });
 const initialView=new T.Vector3(3.4,6,7.4);
 const light=new T.DirectionalLight(0xffefcc,2.8);light.position.set(-5,10,6);scene.add(light,new T.HemisphereLight(0xfff6e0,0xe2ae87,2));
 const group=parent=>{const g=new T.Group();parent.add(g);return g};
 function box(parent,x,y,z,w,h,l,color){
   const mesh=new T.Mesh(new T.BoxGeometry(w,h,l),new T.MeshStandardMaterial({color,roughness:.4}));
   mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 box(scene,350,-.15,0,900,.3,200,0xb7af78);
 for(let m=0;m<=750;m+=5)box(scene,m,.012,0,.055,.02,m%10===0?9:5,0xf6e3af);
 const table=group(scene);
 const rows=meal.tiers;
 const layers=[];
 const tableWidth=3.65,tableDepth=3.38;
 box(table,0,1.02,0,tableWidth,.18,tableDepth,0x84412b);
 for(const x of [-1,1])for(const z of [-1,1])box(table,x*(tableWidth/2-.25),.48,z*(tableDepth/2-.25),.19,.96,.19,0x653321);
 const grandpa=elder(T,scene,false);grandpa.body.position.set(-tableWidth/2-.3,0,0);
 grandpa.body.scale.setScalar(1.3);
 const grandma=catching?elder(T,scene,true):null;
 if(grandma)grandma.body.visible=false;
 const pieces=[],loader=new T.TextureLoader();
 rows.forEach((row,tier)=>{
   const layer=group(table);
   // 一の重 is on top, with each lacquered base resting on the rim below.
   const level=rows.length-1-tier;
   const baseY=1.2+level*.39;
   layer.position.y=baseY;
   layers.push({layer,level,baseY});
   const y=0;
   box(layer,0,y,0,2.85,.15,2.65,0x651b0f);
   for(const sign of [-1,1]){
     box(layer,sign*1.427,y+.26,0,.025,.025,2.65,0xc89850);
     box(layer,0,y+.26,sign*1.322,2.86,.025,.025,0xc89850);
     box(layer,sign*1.39,y+.14,0,.09,.34,2.65,0x9b3022);
     box(layer,0,y+.14,sign*1.28,2.85,.34,.09,0x9b3022);
   }
   const layout=arrangeTray(row);
   row.forEach((id,i)=>{
     if(id==null)return;
     const r=layout[i],path=id===0?'./assets/art/'+(meal.kam===3?'white':'pink')+'-slice.png':foodPath(id);
     if(!textures.has(path)){
       const tex=loader.load(path,()=>{},undefined,()=>{});
       tex.colorSpace=T.SRGBColorSpace;textures.set(path,tex);

     }
     const tex=textures.get(path);
     const mesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.08,side:T.DoubleSide}));
     mesh.position.set(((r.x+r.w/2)/100-.5)*2.64,y+.19+i*.004,((r.y+r.h/2)/100-.5)*2.44);
     mesh.rotation.x=-Math.PI/2;mesh.scale.set(r.w*.026,r.h*.024,1);layer.add(mesh);
     const trailPos=new Float32Array(48*3),geo=new T.BufferGeometry();
     geo.setAttribute('position',new T.BufferAttribute(trailPos,3));geo.setDrawRange(0,0);
     const line=new T.Line(geo,new T.LineBasicMaterial({color:new T.Color().setHSL((id*.123)%1,.84,.53),transparent:true,opacity:.8}));
     line.frustumCulled=false;scene.add(line);
     pieces.push({id,mesh,layer,tier,slot:i,home:mesh.position.clone(),scale:mesh.scale.clone(),line,trailPos});
   });
 });
 // Confetti bursts use one shared point cloud, including simultaneous landings.
 const capacity=450, sparks=[],coords=new Float32Array(capacity*3),colors=new Float32Array(capacity*3);
 const particles=new T.BufferGeometry();
 particles.setAttribute('position',new T.BufferAttribute(coords,3));particles.setAttribute('color',new T.BufferAttribute(colors,3));
 const cloud=new T.Points(particles,new T.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.92}));
 cloud.frustumCulled=false;scene.add(cloud);
 function burst(pos,count){
   for(let i=0;i<count;i++)sparks.push({p:pos.clone(),v:new T.Vector3((Math.random()-.5)*6,1+Math.random()*5,(Math.random()-.5)*6),life:1,color:new T.Color().setHSL(Math.random()*.16,.94,.55)});
   if(sparks.length>capacity)sparks.splice(0,sparks.length-capacity);
 }
 const boost=1+.11*(rows.length-1)+.021*(pieces.length-1);
 let phase,started,angle,power,elapsed,last,best=0;
 try{best=Number(localStorage.getItem('osechi-flip-3d-best'))||0}catch{}
 const wave=time=>(1-Math.cos((time-started)*condition.pace/380))/2;
 const target=new T.Vector3(), shift=new T.Vector3();
 let lastShot, replaying=false, paused=false, flipTime=0;
 let maxThrow=0;
 const grandmaSpeech=document.createElement('span');
 grandmaSpeech.className='grandma-speech';grandmaSpeech.hidden=true;
 if(catching)stage.append(grandmaSpeech);
 let speechTime=0;
 function say(words){
   grandmaSpeech.textContent=words;grandmaSpeech.hidden=false;speechTime=2;
 }
 function positionSpeech(dt){
   if(grandmaSpeech.hidden)return;
   speechTime-=dt;
   if(speechTime<=0){grandmaSpeech.hidden=true;return}
   projected.set(0,1.7,0);grandma.body.localToWorld(projected);projected.project(camera);
   grandmaSpeech.style.left=T.MathUtils.clamp((projected.x+1)*50,28,72)+'%';
   grandmaSpeech.style.top=T.MathUtils.clamp((1-projected.y)*50,22,81)+'%';
 }
 const share=game.querySelector('.flip-share');
 function offerResultShare(title,lines){
   share.hidden=false;
   share.onclick=()=>showXShare(
     [title,...lines,'#おうちのおせち'].join('\n'),
     async()=>{
       const card=document.createElement('canvas');card.width=1000;card.height=760;
       const ctx=card.getContext('2d');
       ctx.fillStyle='#fff0d4';ctx.fillRect(0,0,1000,760);
       ctx.fillStyle='#712e21';ctx.font='bold 44px klee,serif';ctx.fillText(title,38,65,925);
       // Read WebGL immediately after rendering, before its drawing buffer is cleared.
       renderer.render(scene,camera);
       const src=renderer.domElement,scale=Math.min(924/src.width,465/src.height);
       const w=src.width*scale,h=src.height*scale;
       ctx.fillStyle='#ffe2b4';ctx.fillRect(38,93,924,465);
       ctx.drawImage(src,(1000-w)/2,93+(465-h)/2,w,h);
       ctx.fillStyle='#38291d';ctx.font='bold 37px klee,serif';
       lines.forEach((line,i)=>ctx.fillText(line,38,622+i*58,924));
       ctx.font='24px klee,serif';ctx.fillText('おうちのおせち',38,732);
       return new Promise((resolve,reject)=>card.toBlob(blob=>blob?resolve(blob):reject(new Error('画像生成失敗')),'image/png'));
     },
     title+'.png'
   );
 }
 const catcher=catching?catchingGame({T,surface,pieces,status,grandma,say,kickDust:pos=>burst(pos,6),track:stage.querySelector(".catch-track"),onFinish:(count,missed)=>{
   phase='result';controls.enabled=true;launch.hidden=false;launch.textContent='もう一度遊ぶ';
   offerResultShare('お粗末にしない',[
     condition.name+'の一投！　'+rows.length+'段重・最長 '+maxThrow.toFixed(1)+' m',
     '食べた '+count+'品・落とした '+missed+'品'
   ]);
   status.textContent=(missed?'食べた '+count+'品・落とした '+missed+'品':'ごちそうさま！　全'+count+'品を完食')+'　最長 '+maxThrow.toFixed(1)+' m';
 }}):null;
 function frameCatch(dt){
   const pos=grandma.body.position;
   const lead=pieces.reduce((a,b)=>b.state==='loose'&&!b.landed&&(!a||b.mesh.position.y>a.y)?b.mesh.position:a,null);
   const x=lead?(lead.x+pos.x)/2:pos.x;
   const y=lead?Math.max(1.5,lead.y*.5):1.5;
   const spread=lead?Math.abs(pos.x-lead.x)*.5:0;
   const tan=Math.tan(camera.fov*Math.PI/360);
   const dist=Math.max(10,(spread+3.5)/(tan*camera.aspect),(y+2)/tan);
   const blend=1-Math.exp(-dt*8);
   target.set(x,y,0);controls.target.lerp(target,blend);
   camera.position.lerp(shift.set(x,y+dist*.23,dist),blend);
   camera.lookAt(controls.target);
 }
 const ink=document.createElement('div');
 ink.className='flip-ink';ink.hidden=true;ink.setAttribute('aria-hidden','true');
 const rays=Array.from({length:54},(_,i)=>{
   const length=17+(i*11)%17;
   return '<path transform="rotate('+i*360/54+' 50 50)" d="M49 -22L'+(49.5+(i%3)*.6)+' '+(length-14)+'L52 -22Z"/>';
 }).join('');
 ink.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="none"><g>'+rays+'</g></svg><i></i><strong></strong>';
 stage.append(ink);
 const shout=ink.querySelector('strong'),ring=ink.querySelector('i'),lines=ink.querySelector('svg');
 const projected=new T.Vector3(),reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let inkTime=Infinity;
 function updateInk(dt){
   if(ink.hidden)return;
   inkTime+=dt;
   if(inkTime>=1.1){ink.hidden=true;return}
   if(phase==='flip'){
     projected.set(0,1.8,0);grandpa.body.localToWorld(projected);projected.project(camera);
     shout.style.left=T.MathUtils.clamp((projected.x+1)*50+6,23,77)+'%';
     shout.style.top=T.MathUtils.clamp((1-projected.y)*50-8,16,76)+'%';
     projected.set(0,1.55,0).project(camera);
     ring.style.left=((1+projected.x)*50)+'%';ring.style.top=((1-projected.y)*50)+'%';
   }
   const hit=Math.max(0,inkTime-.32);
   lines.style.opacity=reduceMotion?0:Math.max(0,.76-hit*1.45);
   ring.style.opacity=reduceMotion||hit===0?0:Math.max(0,1-hit*2.5);
   ring.style.transform='translate(-50%,-50%) scale('+(.12+hit*4)+')';
   const pop=reduceMotion?1:1+.18*Math.sin(Math.min(1,inkTime/.26)*Math.PI);
   shout.style.transform='translate(-50%,-65%) rotate(-7deg) scale('+pop+')';
   ink.style.opacity=Math.min(1,(1.1-inkTime)*6);
 }
 function beginFlip(isReplay){
   inkTime=0;ink.hidden=false;
   shout.textContent=catching?['ほいさっ！','そいやっ！','どっせーい！','天まで飛べぇ！'][moods.indexOf(condition)]:(power>21?'どっせーい！':'そりゃあっ！');
   grandpa.mouth.scale.y=.10;
   replaying=isReplay;paused=false;flipTime=0;phase='flip';
   meter.hidden=true;launch.hidden=true;replay.hidden=true;pause.hidden=!isReplay;
   if(catching){controls.enabled=false}
   pause.textContent='一時停止';status.textContent=isReplay?'リプレイ':'そりゃっ！';
 }
 replay.onclick=()=>{
   if(!lastShot)return;
   reset();angle=lastShot.angle;power=lastShot.power;beginFlip(true);
 };
 pause.onclick=()=>{
   paused=!paused;pause.textContent=paused?'再生を続ける':'一時停止';
 };
 function reset(){
   share.hidden=true;share.onclick=null;grandmaSpeech.hidden=true;overlay.clear();angle=undefined;ink.hidden=true;grandpa.mouth.scale.y=.03;
   for(const {layer,baseY} of layers){layer.position.set(0,baseY,0);layer.rotation.z=0}
   phase=catching?'ready':'angle';controls.enabled=true;grandpa.body.rotation.z=0;started=performance.now();elapsed=0;sparks.length=0;table.rotation.z=0;
   if(catching){
     stage.querySelector('.catch-track').hidden=true;
     grandma.body.visible=false;grandma.body.rotation.set(0,0,0);
     camera.position.copy(initialView).multiplyScalar(Math.max(1,(tableWidth+1.6)/(6.6*camera.aspect)));
     controls.target.set(0,0,0);
   }
   target.set(0,1,0);
   camera.position.add(shift.copy(target).sub(controls.target));controls.target.copy(target);controls.update();
   pause.hidden=true;replay.hidden=true;replaying=false;paused=false;
   for(const p of pieces){p.layer.add(p.mesh);p.mesh.visible=true;p.mesh.position.copy(p.home);p.mesh.scale.copy(p.scale);p.mesh.rotation.set(-Math.PI/2,0,0);p.line.geometry.setDrawRange(0,0);p.landed=false;p.distance=0}
   meter.hidden=catching;launch.disabled=false;launch.hidden=catching;launch.textContent='角度を決める';
   status.textContent=rows.length+'段・'+pieces.length+'品　'+(catching?condition.name+'のおじいちゃん、構えて！':'飛ばす角度を狙ってタップ');
 }
 launch.onclick=()=>{
   const now=performance.now();
   if(phase==='result'){
     if(catching)chooseGrandpaMood(moods,mood=>{condition=mood;reset()});
     else reset();
     return;
   }
   if(phase==='angle'){angle=18+54*wave(now);started=now;phase='power';launch.textContent='ちゃぶ台を返す！';return}
   if(phase==='power'){power=(8+15*wave(now))*boost;lastShot={angle,power};beginFlip(false)}
 };
 function release(){
   table.updateMatrixWorld(true);
   for(const p of pieces){
     scene.attach(p.mesh);p.origin=p.mesh.position.clone();
   }
   if(catching){
     power=condition.power*boost;
     angle=bestThrowAngle(pieces,power);
   }
   for(const p of pieces){
     Object.assign(p,throwVelocity(p,power,angle*Math.PI/180));
     p.descending=false;
     p.trailPos.fill(0);p.samples=0;
   }
   phase=catching?'catch':'flight';elapsed=0;
   if(catching){
     maxThrow=Math.max(...pieces.map(p=>p.vx*travelTime(p.drag,p.land)));
     // Keep the table in view while she charges in from beyond the left edge.
     controls.target.set(0,1.25,0);target.copy(controls.target);
     const distance=Math.max(8,4.6/(Math.tan(camera.fov*Math.PI/360)*camera.aspect));
     camera.position.set(0,2.9,distance);camera.lookAt(target);camera.updateMatrixWorld();
     const leftEdge=-(distance*Math.tan(camera.fov*Math.PI/360)*camera.aspect+1.8);
     catcher.start(condition,leftEdge);
     status.textContent=condition.name+'の一投！　'+angle.toFixed(1)+'°・最長 '+maxThrow.toFixed(1)+' m';
   }
   burst(new T.Vector3(0,2,0),75);
 }
 function flight(dt){
   elapsed+=dt;
   for(const p of pieces){
     if(p.landed||(catching&&p.state!=='loose'))continue;
     const u=Math.min(elapsed,p.land),travel=travelTime(p.drag,u);
     p.descending=u>=p.peak;p.distance=p.vx*travel;
     p.mesh.position.set(p.origin.x+p.distance,throwHeight(p.origin.y,p.vy,p.drag,u),p.origin.z+p.vz*travel);
     p.mesh.rotation.set(-1.1+u*(2+p.id%5),u*2,u*(1+p.id%3));
     p.trailPos.copyWithin(3,0,141);p.mesh.position.toArray(p.trailPos,0);p.samples=Math.min(48,p.samples+1);
     p.line.geometry.attributes.position.needsUpdate=true;p.line.geometry.setDrawRange(0,p.samples);
     if(u>=p.land){p.landed=true;p.mesh.rotation.x=-Math.PI/2;overlay.land(p);burst(p.mesh.position,16)}
   }
   if(catching)return;
   const lead=pieces.reduce((a,b)=>a.distance>b.distance?a:b);
   target.copy(lead.mesh.position);
   if(pieces.every(p=>p.landed)){
     phase='result';pause.hidden=true;replay.hidden=false;
     if(!replaying){
       best=Math.max(best,lead.distance);
       try{localStorage.setItem('osechi-flip-3d-best',best)}catch{}
     }
     status.textContent='最遠は'+names[lead.id]+'！ '+lead.distance.toFixed(1)+' m（自己ベスト '+best.toFixed(1)+' m）';
     offerResultShare('お粗末にする',[
       '最遠は'+names[lead.id]+'！　'+lead.distance.toFixed(1)+' m',
       rows.length+'段重・投射角 '+angle.toFixed(1)+'°・自己ベスト '+best.toFixed(1)+' m'
     ]);
     launch.hidden=false;launch.textContent='もう一度返す';burst(target,60);
   }else status.textContent=names[lead.id]+'　'+lead.distance.toFixed(1)+' m';
 }
 function draw(now){
   if(!game.open)return;
   const dt=Math.min(.05,(now-last)/1000||0);last=now;
   if(phase==='ready'||phase==='angle'||phase==='power')grandpa.body.rotation.z=Math.sin(now*.003*condition.pace)*condition.sway*.25;
   if(phase==='ready'&&now-started>=950){
     beginFlip(false);status.textContent=condition.name+'のおじいちゃん、振りかぶった！';
   }
   if(phase==='angle'||phase==='power'){
     const value=wave(now);meter.value=value*100;
     if(phase==='power')table.rotation.z=Math.sin(now*.032)*value*.035;
     status.textContent=rows.length+'段・'+pieces.length+'品　'+(phase==='angle'?'角度 '+Math.round(18+54*value)+'°':'角度 '+Math.round(angle)+'°　力 '+Math.round(value*100)+'％');
     target.set(0,1,0);
   }else if(phase==='flip'){
     flipTime+=paused?0:dt;const f=Math.min(1,flipTime/.38);table.rotation.z=-.68*f*f;grandpa.body.rotation.z=-.42*Math.sin(f*Math.PI/2);if(!catching)target.set(0,1.4,0);
     for(const {level,baseY,layer} of layers){
       layer.position.x=level*.32*f*f;
       layer.position.y=baseY+level*.16*f*f;
       layer.rotation.z=level*.10*f;
     }
     if(f===1)release();
   }else if(phase==='catch'){
     table.rotation.z=Math.max(-2.85,table.rotation.z-dt*3);flight(dt*1.45);catcher.tick(dt);if(!catcher.entering)frameCatch(dt);
   }else if(phase==='flight'&&!paused){table.rotation.z=Math.max(-2.85,table.rotation.z-dt*3);flight(dt*1.45)}
   for(let i=sparks.length-1;i>=0;i--){if(paused)break;const s=sparks[i];s.life-=dt;s.v.y-=dt*6;s.p.addScaledVector(s.v,dt);if(s.life<=0)sparks.splice(i,1)}
   sparks.forEach((s,i)=>{s.p.toArray(coords,i*3);s.color.toArray(colors,i*3)});
   particles.attributes.position.needsUpdate=true;particles.attributes.color.needsUpdate=true;particles.setDrawRange(0,sparks.length);
   if(phase!=='catch'){
     shift.copy(target).sub(controls.target).multiplyScalar(1-Math.exp(-dt*9));
     controls.target.add(shift);camera.position.add(shift);controls.update();
   }
   if(!paused)updateInk(dt);
   if(ink.hidden)grandpa.mouth.scale.y=.03;
   renderer.render(scene,camera);
   if(catching)positionSpeech(dt);
   const shownAngle=phase==='angle'?18+54*wave(now):angle;
   overlay.draw(paused?0:dt,shownAngle,phase==='angle'||phase==='power',1.45+(rows.length-1)*.39,phase==='power'?wave(now):null);
   frame=requestAnimationFrame(draw);
 }
 camera.position.copy(initialView).multiplyScalar(Math.max(1,(tableWidth+1.6)/(6.6*camera.aspect)));reset();last=performance.now();frame=requestAnimationFrame(draw);
 }catch(error){status.textContent='3D画面を開けませんでした。WebGL 2対応のブラウザでお試しください。';launch.hidden=true;console.error(error)}
}

