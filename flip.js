async function openTableFlip() {
 const meal = draft();
 const game = document.createElement('dialog');
 game.className = 'flip-game';
 game.setAttribute('aria-label','ちゃぶ台返し');
 game.innerHTML = '<h2>ちゃぶ台返し</h2><div class="flip-stage"></div><small>ドラッグで回転・ピンチで拡大</small><div class="flip-views" role="group" aria-label="カメラの視点"><button>斜め</button><button>横</button><button>上</button></div><p role="status">お重をちゃぶ台に載せています…</p><meter min="0" max="100" hidden aria-label="タイミング"></meter><div><button class="primary flip-launch" disabled>角度を決める</button><button class="flip-replay" hidden>リプレイ</button><button class="flip-pause" hidden>一時停止</button><button class="flip-exit">お重に戻る</button></div>';
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
 const [T,{OrbitControls}]=await Promise.all([import('./assets/vendor/three.module.js'),import('./assets/vendor/orbit-controls.js')]);
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
 const viewOffsets=[new T.Vector3(4.5,6,7.4),new T.Vector3(0,2,10),new T.Vector3(0,10,.05)];
 game.querySelectorAll('.flip-views button').forEach((button,i)=>{
   button.onclick=()=>{camera.position.copy(controls.target).add(viewOffsets[i]);controls.update()};
 });
 const light=new T.DirectionalLight(0xffefcc,2.8);light.position.set(-5,10,6);scene.add(light,new T.HemisphereLight(0xfff6e0,0xe2ae87,2));
 const group=parent=>{const g=new T.Group();parent.add(g);return g};
 function box(parent,x,y,z,w,h,l,color){
   const mesh=new T.Mesh(new T.BoxGeometry(w,h,l),new T.MeshStandardMaterial({color,roughness:.4}));
   mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 box(scene,90,-.15,0,450,.3,130,0xb7af78);
 for(let m=0;m<=220;m+=5)box(scene,m,.012,0,.055,.02,m%10===0?9:5,0xf6e3af);
 const table=group(scene);
 box(table,0,1.02,0,3.8,.18,3.2,0x84412b);
 for(const x of [-1.5,1.5])for(const z of [-1.2,1.2])box(table,x,.48,z,.19,.96,.19,0x653321);
 const pieces=[],loader=new T.TextureLoader();
 const rows=meal.tiers.filter(row=>row.some(id=>id!=null));
 rows.forEach((row,tier)=>{
   const y=1.17+tier*.42;
   box(table,0,y,0,2.85,.15,2.65,0x651b0f);
   for(const sign of [-1,1]){
     box(table,sign*1.39,y+.14,0,.09,.34,2.65,0x9b3022);
     box(table,0,y+.14,sign*1.28,2.85,.34,.09,0x9b3022);
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
     mesh.rotation.x=-Math.PI/2;mesh.scale.set(r.w*.026,r.h*.024,1);table.add(mesh);
     const trailPos=new Float32Array(48*3),geo=new T.BufferGeometry();
     geo.setAttribute('position',new T.BufferAttribute(trailPos,3));geo.setDrawRange(0,0);
     const line=new T.Line(geo,new T.LineBasicMaterial({color:new T.Color().setHSL((id*.123)%1,.84,.53),transparent:true,opacity:.8}));
     line.frustumCulled=false;scene.add(line);
     pieces.push({id,mesh,home:mesh.position.clone(),scale:mesh.scale.clone(),line,trailPos});
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
 const wave=time=>(1-Math.cos((time-started)/380))/2;
 const target=new T.Vector3(), shift=new T.Vector3();
 let lastShot, replaying=false, paused=false, flipTime=0;
 function beginFlip(isReplay){
   replaying=isReplay;paused=false;flipTime=0;phase='flip';
   meter.hidden=true;launch.hidden=true;replay.hidden=true;pause.hidden=!isReplay;
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
   phase='angle';started=performance.now();elapsed=0;sparks.length=0;table.rotation.z=0;
   target.set(0,1,0);
   camera.position.add(shift.copy(target).sub(controls.target));controls.target.copy(target);controls.update();
   pause.hidden=true;replay.hidden=true;replaying=false;paused=false;
   for(const p of pieces){table.add(p.mesh);p.mesh.position.copy(p.home);p.mesh.scale.copy(p.scale);p.mesh.rotation.set(-Math.PI/2,0,0);p.line.geometry.setDrawRange(0,0);p.landed=false;p.distance=0}
   meter.hidden=false;launch.disabled=false;launch.hidden=false;launch.textContent='角度を決める';
   status.textContent=rows.length+'段・'+pieces.length+'品　飛ばす角度を狙ってタップ';
 }
 launch.onclick=()=>{
   const now=performance.now();
   if(phase==='result'){reset();return}
   if(phase==='angle'){angle=18+54*wave(now);started=now;phase='power';launch.textContent='ちゃぶ台を返す！';return}
   if(phase==='power'){power=(8+15*wave(now))*boost;lastShot={angle,power};beginFlip(false)}
 };
 function release(){
   table.updateMatrixWorld(true);
   for(const p of pieces){
     scene.attach(p.mesh);p.origin=p.mesh.position.clone();
     // Each dish has a repeatable launch response and air resistance.
     const response=.86+((p.id*37+11)%47)/100, drag=.035+((p.id*19+5)%29)/110;
     const radians=angle*Math.PI/180;
     p.drag=drag;p.vx=power*response*Math.cos(radians);p.vy=power*response*Math.sin(radians);
     p.vz=Math.sin(p.id*2.3)*1.7;p.land=(p.vy+Math.sqrt(p.vy*p.vy+19.62*Math.max(.01,p.origin.y-.09)))/9.81;
     p.trailPos.fill(0);p.samples=0;
   }
   phase='flight';elapsed=0;burst(new T.Vector3(0,2,0),75);
 }
 function flight(dt){
   elapsed+=dt;
   for(const p of pieces){
     if(p.landed)continue;
     const u=Math.min(elapsed,p.land),travel=-Math.expm1(-p.drag*u)/p.drag;
     p.distance=p.vx*travel;
     p.mesh.position.set(p.origin.x+p.distance,p.origin.y+p.vy*u-4.905*u*u,p.origin.z+p.vz*travel);
     p.mesh.rotation.set(-1.1+u*(2+p.id%5),u*2,u*(1+p.id%3));
     p.trailPos.copyWithin(3,0,141);p.mesh.position.toArray(p.trailPos,0);p.samples=Math.min(48,p.samples+1);
     p.line.geometry.attributes.position.needsUpdate=true;p.line.geometry.setDrawRange(0,p.samples);
     if(u>=p.land){p.landed=true;p.mesh.rotation.x=-Math.PI/2;burst(p.mesh.position,16)}
   }
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
   if(phase==='angle'||phase==='power'){
     const value=wave(now);meter.value=value*100;
     if(phase==='power')table.rotation.z=Math.sin(now*.032)*value*.035;
     status.textContent=rows.length+'段・'+pieces.length+'品　'+(phase==='angle'?'角度 '+Math.round(18+54*value)+'°':'角度 '+Math.round(angle)+'°　力 '+Math.round(value*100)+'％');
     target.set(0,1,0);
   }else if(phase==='flip'){
     flipTime+=paused?0:dt;const f=Math.min(1,flipTime/.38);table.rotation.z=-.68*f*f;target.set(0,1.4,0);
     if(f===1)release();
   }else if(phase==='flight'&&!paused){table.rotation.z=Math.max(-2.85,table.rotation.z-dt*3);flight(dt*1.45)}
   for(let i=sparks.length-1;i>=0;i--){if(paused)break;const s=sparks[i];s.life-=dt;s.v.y-=dt*6;s.p.addScaledVector(s.v,dt);if(s.life<=0)sparks.splice(i,1)}
   sparks.forEach((s,i)=>{s.p.toArray(coords,i*3);s.color.toArray(colors,i*3)});
   particles.attributes.position.needsUpdate=true;particles.attributes.color.needsUpdate=true;particles.setDrawRange(0,sparks.length);
   shift.copy(target).sub(controls.target).multiplyScalar(1-Math.exp(-dt*9));
   controls.target.add(shift);camera.position.add(shift);controls.update();
   renderer.render(scene,camera);frame=requestAnimationFrame(draw);
 }
 camera.position.copy(viewOffsets[0]);reset();last=performance.now();frame=requestAnimationFrame(draw);
 }catch(error){status.textContent='3D画面を開けませんでした。WebGL 2対応のブラウザでお試しください。';launch.hidden=true;console.error(error)}
}

