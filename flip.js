function chooseGrandpaMood(moods,onSelect){
 const choices=moods.map(mood=>[mood.name,()=>onSelect(mood)]);
 ask('おじいちゃんのコンディションは？',[...choices,['戻る',()=>{}]]);
}

async function openTableFlip(catching=false,chosenMood=null) {
 if(catching&&!chosenMood){
   try{
     const {moods}=await import('./catch.js?v=2');
     chooseGrandpaMood(moods,mood=>openTableFlip(true,mood));
   }catch{notice('コンディションを読み込めませんでした。もう一度お試しください')}
   return;
 }
 const meal = draft();
 const game = document.createElement('dialog');
 game.className = 'flip-game';
 game.setAttribute('aria-label','ちゃぶ台返し');
 game.innerHTML = '<h2>ちゃぶ台返し</h2><div class="flip-stage"></div><small>上下左右をタップ・クリックで視点変更。ドラッグで回転、ピンチで拡大</small><p role="status">お重をちゃぶ台に載せています…</p><meter min="0" max="100" hidden aria-label="タイミング"></meter><div><button class="primary flip-launch" disabled>角度を決める</button><button class="flip-replay" hidden>リプレイ</button><button class="flip-pause" hidden>一時停止</button><button class="flip-exit">お重に戻る</button></div>';
 if(catching){
   game.querySelector('h2').textContent='おばあちゃん、いただきます！';
   game.setAttribute('aria-label','お粗末にしない');
   game.querySelector('small').textContent='着地点の印をタップしてダッシュ。ドラッグ・左右キーでも移動できます';
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
 let renderer, frame, scene, controls, resize;
 const textures=new Map();
 game.addEventListener('close',()=>{
   cancelAnimationFrame(frame);controls?.dispose();resize?.disconnect();
   if(fullscreenRequest)fullscreenRequest.then(()=>{
     if(document.fullscreenElement===page && !document.querySelector('.flip-game[open]'))document.exitFullscreen().catch(()=>{});
   });
   scene?.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
   textures.forEach(tex=>tex.dispose());
   renderer?.dispose();renderer?.forceContextLoss();game.remove();
 },{once:true});
 try {
 const [T,{OrbitControls},{elder,moods,catchingGame,throwVelocity,travelTime,autoPower}]=await Promise.all([import('./assets/vendor/three.module.js'),import('./assets/vendor/orbit-controls.js'),import('./catch.js?v=2')]);
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
 box(scene,90,-.15,0,450,.3,130,0xb7af78);
 for(let m=0;m<=220;m+=5)box(scene,m,.012,0,.055,.02,m%10===0?9:5,0xf6e3af);
 const table=group(scene);
 const rows=meal.tiers;
 const columns=Math.min(2,rows.length),depth=Math.ceil(rows.length/columns);
 const trayScale=rows.length===1?1:.78;
 const tableWidth=columns*3*trayScale+.65,tableDepth=depth*2.9*trayScale+.48;
 box(table,0,1.02,0,tableWidth,.18,tableDepth,0x84412b);
 for(const x of [-1,1])for(const z of [-1,1])box(table,x*(tableWidth/2-.25),.48,z*(tableDepth/2-.25),.19,.96,.19,0x653321);
 const grandpa=elder(T,scene,false);grandpa.body.position.set(-tableWidth/2-.3,0,0);
 grandpa.body.scale.setScalar(1.3);
 const grandma=catching?elder(T,scene,true):null;
 if(grandma)grandma.body.position.set(0,0,1.8);
 const pieces=[],loader=new T.TextureLoader();
 rows.forEach((row,tier)=>{
   const layer=group(table);
   const rowIndex=Math.floor(tier/columns);
   const rowSize=Math.min(columns,rows.length-rowIndex*columns);
   layer.position.set((tier%columns-(rowSize-1)/2)*3*trayScale,1.2,(rowIndex-(depth-1)/2)*2.9*trayScale);
   layer.scale.setScalar(trayScale);
   const y=0;
   box(layer,0,y,0,2.85,.15,2.65,0x651b0f);
   for(const sign of [-1,1]){
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
 const catcher=catching?catchingGame({T,surface,pieces,status,grandma,track:stage.querySelector(".catch-track"),onFinish:count=>{
   phase='result';controls.enabled=true;launch.hidden=false;launch.textContent='もう一度遊ぶ';
   status.textContent='ごちそうさま！　'+rows.length+'段のおせち、'+count+'品を全部食べました。最長 '+maxThrow.toFixed(1)+' m';
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
 function beginFlip(isReplay){
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
   phase=catching?'ready':'angle';controls.enabled=true;grandpa.body.rotation.z=0;started=performance.now();elapsed=0;sparks.length=0;table.rotation.z=0;
   if(catching){
     stage.querySelector('.catch-track').hidden=true;
     grandma.body.position.set(0,0,1.8);grandma.body.rotation.z=0;
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
     // A full three-tier meal reaches the mood's ceiling. Smaller servings retain most of its power.
     const load=.92+.08*Math.min(1,(boost-1)/.64);
     power=autoPower(pieces,angle*Math.PI/180,condition.range*load);
   }
   for(const p of pieces){
     Object.assign(p,throwVelocity(p,power,angle*Math.PI/180));
     p.descending=false;
     p.trailPos.fill(0);p.samples=0;
   }
   phase=catching?'catch':'flight';elapsed=0;
   if(catching){
     maxThrow=Math.max(...pieces.map(p=>p.vx*travelTime(p.drag,p.land)));
     catcher.start(condition);
     status.textContent=condition.name+'の一投！　最長 '+maxThrow.toFixed(1)+' m';
   }
   burst(new T.Vector3(0,2,0),75);
 }
 function flight(dt){
   elapsed+=dt;
   for(const p of pieces){
     if(p.landed||(catching&&p.state!=='loose'))continue;
     const u=Math.min(elapsed,p.land),travel=travelTime(p.drag,u);
     p.descending=u>=p.vy/9.81;p.distance=p.vx*travel;
     p.mesh.position.set(p.origin.x+p.distance,p.origin.y+p.vy*u-4.905*u*u,p.origin.z+p.vz*travel);
     p.mesh.rotation.set(-1.1+u*(2+p.id%5),u*2,u*(1+p.id%3));
     p.trailPos.copyWithin(3,0,141);p.mesh.position.toArray(p.trailPos,0);p.samples=Math.min(48,p.samples+1);
     p.line.geometry.attributes.position.needsUpdate=true;p.line.geometry.setDrawRange(0,p.samples);
     if(u>=p.land){p.landed=true;p.mesh.rotation.x=-Math.PI/2;burst(p.mesh.position,16)}
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
     launch.hidden=false;launch.textContent='もう一度返す';burst(target,60);
   }else status.textContent=names[lead.id]+'　'+lead.distance.toFixed(1)+' m';
 }
 function draw(now){
   if(!game.open)return;
   const dt=Math.min(.05,(now-last)/1000||0);last=now;
   if(phase==='ready'||phase==='angle'||phase==='power')grandpa.body.rotation.z=Math.sin(now*.003*condition.pace)*condition.sway*.25;
   if(phase==='ready'&&now-started>=950){
     angle=37+Math.random()*14;beginFlip(false);status.textContent=condition.name+'のおじいちゃん、振りかぶった！';
   }
   if(phase==='angle'||phase==='power'){
     const value=wave(now);meter.value=value*100;
     if(phase==='power')table.rotation.z=Math.sin(now*.032)*value*.035;
     status.textContent=rows.length+'段・'+pieces.length+'品　'+(phase==='angle'?'角度 '+Math.round(18+54*value)+'°':'角度 '+Math.round(angle)+'°　力 '+Math.round(value*100)+'％');
     target.set(0,1,0);
   }else if(phase==='flip'){
     flipTime+=paused?0:dt;const f=Math.min(1,flipTime/.38);table.rotation.z=-.68*f*f;grandpa.body.rotation.z=-.42*Math.sin(f*Math.PI/2);if(!catching)target.set(0,1.4,0);
     if(f===1)release();
   }else if(phase==='catch'){
     table.rotation.z=Math.max(-2.85,table.rotation.z-dt*3);flight(dt*1.45);catcher.tick(dt);frameCatch(dt);
   }else if(phase==='flight'&&!paused){table.rotation.z=Math.max(-2.85,table.rotation.z-dt*3);flight(dt*1.45)}
   for(let i=sparks.length-1;i>=0;i--){if(paused)break;const s=sparks[i];s.life-=dt;s.v.y-=dt*6;s.p.addScaledVector(s.v,dt);if(s.life<=0)sparks.splice(i,1)}
   sparks.forEach((s,i)=>{s.p.toArray(coords,i*3);s.color.toArray(colors,i*3)});
   particles.attributes.position.needsUpdate=true;particles.attributes.color.needsUpdate=true;particles.setDrawRange(0,sparks.length);
   if(phase!=='catch'){
     shift.copy(target).sub(controls.target).multiplyScalar(1-Math.exp(-dt*9));
     controls.target.add(shift);camera.position.add(shift);controls.update();
   }
   renderer.render(scene,camera);frame=requestAnimationFrame(draw);
 }
 camera.position.copy(initialView).multiplyScalar(Math.max(1,(tableWidth+1.6)/(6.6*camera.aspect)));reset();last=performance.now();frame=requestAnimationFrame(draw);
 }catch(error){status.textContent='3D画面を開けませんでした。WebGL 2対応のブラウザでお試しください。';launch.hidden=true;console.error(error)}
}

