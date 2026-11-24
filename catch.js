export const moods=[
 {name:'ほろよい',pace:1,interval:1.1,air:2.4,reach:.85,sway:.12},
 {name:'酔っ払い',pace:1.25,interval:.85,air:2.1,reach:.76,sway:.32},
 {name:'泥酔',pace:1.55,interval:.67,air:1.85,reach:.69,sway:.55},
 {name:'やけくそ',pace:1.9,interval:.47,air:1.65,reach:.62,sway:.8}
];

export function elder(T,scene,grandma){
 const body=new T.Group();scene.add(body);
 function part(parent,rgb,x,y,z,w,h,d){
   const m=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshStandardMaterial({color:rgb}));
   m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
 }
 const skin=0xffc597,hair=0xe3ded3,coat=grandma?0xad4964:0x465679;
 part(body,coat,0,.52,0,.39,.48,.27);
 for(const x of [-.2,.2])part(body,0x3b302d,x,.1,.06,.16,.11,.23);
 part(body,skin,0,1.15,0,.36,.38,.31);
 part(body,hair,0,1.39,-.045,.365,.17,.29);
 if(grandma)part(body,hair,0,1.57,-.14,.15,.15,.14);
 else for(const sign of [-1,1])part(body,hair,sign*.077,1.08,.3,.096,.042,.037);
 for(const sign of [-1,1]){
   part(body,0x372a24,sign*.13,1.22,.29,.031,.04,.024);
   part(body,0xf18f80,sign*.23,1.12,.22,.066,.037,.03);
 }
 const mouth=part(body,0x6e2a22,0,1.01,.3,.066,.03,.02);
 for(const sign of [-1,1]){
   part(body,coat,sign*.34,.71,.1,.14,.24,.14);
   part(body,skin,sign*.34,.78,.27,.105,.12,.1);
 }
 if(grandma){
   part(body,0xae3825,0,.74,.39,.37,.16,.25);
   part(body,0xf0cc87,0,.835,.39,.35,.045,.24);
 }
 return {body,mouth};
}

export function catchingGame({T,scene,camera,surface,pieces,status,grandma,onFinish}){
 let active=false,cleanup=false,t=0,desired=0,eaten=0,chew=0,settings;
 let drag=null;
 const keys=new Set(), ray=new T.Raycaster(), point=new T.Vector3();
 const lane=new T.Plane(new T.Vector3(0,0,1),-1.8);
 function steer(e){
   const r=surface.getBoundingClientRect();
   ray.setFromCamera({x:2*(e.clientX-r.left)/r.width-1,y:0},camera);
   if(ray.ray.intersectPlane(lane,point))desired=T.MathUtils.clamp(point.x,-3.8,3.8);
 }
 surface.addEventListener('pointerdown',e=>{
   if(!active||drag!==null)return;
   drag=e.pointerId;surface.setPointerCapture(drag);steer(e);
 });
 surface.addEventListener('pointermove',e=>{if(active&&e.pointerId===drag)steer(e)});
 function end(e){if(e.pointerId===drag)drag=null}
 surface.addEventListener('pointerup',end);surface.addEventListener('pointercancel',end);
 const dialog=surface.closest('dialog');
 function key(e,down){
   if(!active||!['ArrowLeft','ArrowRight'].includes(e.key))return;
   e.preventDefault();if(down)keys.add(e.key);else keys.delete(e.key);
 }
 dialog.addEventListener('keydown',e=>key(e,true));dialog.addEventListener('keyup',e=>key(e,false));
 function eat(p){
   p.state='eating';p.bite=t;p.from.copy(p.mesh.position);eaten++;chew=.42;
   status.textContent=names[p.id]+'をぱくり！　'+eaten+'／'+pieces.length+'品';
 }
 return {
   start(mood){
     active=true;cleanup=false;settings=mood;t=0;eaten=0;chew=0;drag=null;keys.clear();desired=0;
     grandma.body.position.set(0,0,1.8);
     // Mix tiers so every layer takes part from the first volley.
     [...pieces].sort((a,b)=>a.slot-b.slot||a.tier-b.tier).forEach((p,i)=>{
       p.state='waiting';p.delay=i*mood.interval;p.air=mood.air*(.94+Math.random()*.12);
       p.dest=(Math.random()*2-1)*3.45;p.from=new T.Vector3();p.arc=(Math.random()*2-1)*mood.sway;
     });
     status.textContent='おばあちゃんを左右に動かそう　0／'+pieces.length+'品';
   },
   tick(dt){
     if(!active)return;
     t+=dt;chew=Math.max(0,chew-dt);
     desired=T.MathUtils.clamp(desired+dt*6*(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'))),-3.8,3.8);
     const body=grandma.body;
     body.position.x=T.MathUtils.damp(body.position.x,desired,12,dt);
     body.position.y=chew*.35;grandma.mouth.scale.y=.035+chew*.15;
     for(const p of pieces){
       if(p.state==='waiting'&&t>=p.delay){
         scene.attach(p.mesh);p.origin=p.mesh.position.clone();p.state='air';
       }
       if(p.state==='air'){
         const u=Math.min(1,(t-p.delay)/p.air);
         p.mesh.position.set(T.MathUtils.lerp(p.origin.x,p.dest,u)+Math.sin(Math.PI*u)*p.arc,
           T.MathUtils.lerp(p.origin.y,.16,u)+Math.sin(Math.PI*u)*(2.8+settings.sway),
           T.MathUtils.lerp(p.origin.z,1.8,u));
         p.mesh.rotation.set(-.55,u*4,u*5);
         if(u>.78&&Math.abs(body.position.x-p.mesh.position.x)<settings.reach&&p.mesh.position.y<1.55)eat(p);
         else if(u===1){p.state='ground';p.mesh.rotation.set(-1.25,0,0)}
       }
       if(cleanup&&p.state==='ground'&&Math.abs(body.position.x-p.dest)<settings.reach)eat(p);
       if(p.state==='eating'){
         const u=Math.min(1,(t-p.bite)/.35);
         p.mesh.position.lerpVectors(p.from,point.set(body.position.x,body.position.y+1.04,2.1),u);
         p.mesh.scale.copy(p.scale).multiplyScalar(1-u);
         if(u===1){p.mesh.visible=false;p.state='done'}
       }
     }
     if(!cleanup&&pieces.every(p=>p.state!=='air'&&p.state!=='waiting')){
       cleanup=true;
       if(eaten<pieces.length)status.textContent='あと'+(pieces.length-eaten)+'品！　落ちた料理の前に移動して拾おう';
     }
     if(pieces.every(p=>p.state==='done')){
       active=false;grandma.mouth.scale.y=.035;onFinish(eaten);
     }
   }
 };
}
