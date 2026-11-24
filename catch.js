export const moods=[
 {name:'ほろよい',pace:1,power:14,sprint:22,reach:.85,sway:.12},
 {name:'酔っ払い',pace:1.25,power:20,sprint:34,reach:.76,sway:.32},
 {name:'泥酔',pace:1.55,power:27,sprint:49,reach:.69,sway:.55},
 {name:'やけくそ',pace:1.9,power:35,sprint:70,reach:.62,sway:.8}
];

export function elder(T,scene,grandma){
 const body=new T.Group();scene.add(body);
 function part(parent,rgb,x,y,z,w,h,d){
   const m=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshStandardMaterial({color:rgb}));
   m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
 }
 const skin=0xffc597,hair=0xe3ded3,coat=grandma?0xad4964:0x465679;
 part(body,coat,0,.52,0,.39,.48,.27);
 const feet=[-.2,.2].map(x=>part(body,0x3b302d,x,.1,.06,.16,.11,.23));
 part(body,skin,0,1.15,0,.36,.38,.31);
 part(body,hair,0,1.39,-.045,.365,.17,.29);
 if(grandma)part(body,hair,0,1.57,-.14,.15,.15,.14);
 else for(const sign of [-1,1])part(body,hair,sign*.077,1.08,.3,.096,.042,.037);
 for(const sign of [-1,1]){
   part(body,0x372a24,sign*.13,1.22,.29,.031,.04,.024);
   if(grandma)part(body,0x533c38,sign*.135,1.29,.292,.097,.025,.024).rotation.z=sign*.42;
   part(body,0xf18f80,sign*.23,1.12,.22,.066,.037,.03);
 }
 const mouth=part(body,0x6e2a22,0,1.01,.3,.066,.03,.02);
 const arms=[-1,1].map(sign=>{
   const arm=new T.Group();arm.position.set(sign*.34,.84,.1);body.add(arm);
   part(arm,coat,0,-.13,0,.14,.24,.14);
   part(arm,skin,0,-.06,.17,.105,.12,.1);
   return arm;
 });
 if(grandma){
   part(body,0xae3825,0,.74,.39,.37,.16,.25);
   part(body,0xf0cc87,0,.835,.39,.35,.045,.24);
 }
 return {body,mouth,arms,feet};
}

// Linear air drag acts on every axis. These equations are also used by the angle search.
const gravity=9.81;
export function travelTime(drag,t){return -Math.expm1(-drag*t)/drag}
export function throwHeight(originY,vy,drag,t){
 const travel=travelTime(drag,t);
 return originY+vy*travel-gravity*(t-travel)/drag;
}
export function throwVelocity(p,power,radians){
 const response=.86+((p.id*37+11)%47)/100;
 const drag=.035+((p.id*19+5)%29)/110;
 const speed=power*response,sideAngle=Math.sin(p.id*2.3)*.055;
 const horizontal=speed*Math.cos(radians),vy=speed*Math.sin(radians);
 const peak=Math.log1p(drag*vy/gravity)/drag;
 let low=peak,high=peak+1;
 while(throwHeight(p.origin.y,vy,drag,high)>.09)high=peak+2*(high-peak);
 for(let i=0;i<28;i++){
   const mid=(low+high)/2;
   if(throwHeight(p.origin.y,vy,drag,mid)>.09)low=mid;else high=mid;
 }
 return {vx:horizontal*Math.cos(sideAngle),vy,vz:horizontal*Math.sin(sideAngle),drag,peak,land:(low+high)/2};
}
export function bestThrowAngle(pieces,power){
 let bestDistance=-1,bestAngle=0;
 // Maximize each dish's downrange distance; the strongest candidate wins the shared throw.
 for(const p of pieces){
   function distance(angle){
     const v=throwVelocity(p,power,angle);
     return v.vx*travelTime(v.drag,v.land);
   }
   let low=0,high=Math.PI/2;
   for(let step=0;step<24;step++){
     const third=(high-low)/3;
     if(distance(low+third)<distance(high-third))low+=third;else high-=third;
   }
   const angle=(low+high)/2,range=distance(angle);
   if(range>bestDistance){bestDistance=range;bestAngle=angle}
 }
 return bestAngle*180/Math.PI;
}

export function catchingGame({T,surface,pieces,status,grandma,track,say,kickDust,onFinish}){
 let active=false,t=0,desired=0,eaten=0,chew=0,settings,extent,missed,nextComplaint;
 const entranceDuration=.62;
 let entryX=0,dustTime=0,drag=null;
 const keys=new Set(),point=new T.Vector3(),body=grandma.body;
 const ctx=track.getContext('2d');
 function steer(e){
   const r=e.currentTarget.getBoundingClientRect();
   desired=T.MathUtils.clamp((e.clientX-r.left)/r.width,0,1)*extent;
 }
 for(const el of [surface,track]){
   el.addEventListener('pointerdown',e=>{
     if(!active||drag!==null)return;
     drag=e.pointerId;el.setPointerCapture(drag);steer(e);
   });
   el.addEventListener('pointermove',e=>{if(active&&e.pointerId===drag)steer(e)});
   for(const type of ['pointerup','pointercancel'])el.addEventListener(type,e=>{if(e.pointerId===drag)drag=null});
 }
 const dialog=surface.closest('dialog');
 function key(e,down){
   if(!active||!['ArrowLeft','ArrowRight'].includes(e.key))return;
   e.preventDefault();if(down)keys.add(e.key);else keys.delete(e.key);
 }
 dialog.addEventListener('keydown',e=>key(e,true));dialog.addEventListener('keyup',e=>key(e,false));
 function drawTrack(){
   const w=track.width,h=track.height;
   ctx.clearRect(0,0,w,h);ctx.fillStyle='#f9e9c8';ctx.fillRect(0,0,w,h);
   ctx.fillStyle='#99734d';ctx.fillRect(0,h*.6,w,2);
   for(const p of pieces){
     if(p.state!=='loose')continue;
     ctx.fillStyle=p.landed?'#a12e21':'#ac7732';
     ctx.beginPath();ctx.arc(p.dest/extent*(w-10)+5,h*.42,4,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle='#563765';ctx.fillRect(body.position.x/extent*(w-10)+2,h*.32,7,h*.54);
   ctx.font='15px sans-serif';ctx.fillText('0 m',5,15);ctx.textAlign='right';
   ctx.fillText(Math.round(extent)+' m',w-5,15);ctx.textAlign='left';
 }
 return {
   get entering(){return active&&t<entranceDuration},
   start(mood,startX){
     active=true;missed=0;nextComplaint=0;settings=mood;t=0;eaten=0;chew=0;drag=null;keys.clear();desired=0;
     entryX=startX;dustTime=0;body.position.set(entryX,0,1.8);body.visible=true;
     for(const p of pieces){
       p.state='loose';p.dest=p.origin.x+p.vx*travelTime(p.drag,p.land);p.from=new T.Vector3();
     }
     extent=Math.ceil((Math.max(...pieces.map(p=>p.dest))+2)/5)*5;
     track.hidden=false;drawTrack();
     say(['こらぁーっ！','またあんたかーっ！','誰が作ったと思ってんだい！','こらジジイ！ 待ちなーっ！'][moods.indexOf(mood)]);
     status.textContent='地面に落ちる前にキャッチ！';
   },
   tick(dt){
     if(!active)return;
     t+=dt;chew=Math.max(0,chew-dt);
     const step=settings.sprint*dt;
     desired=T.MathUtils.clamp(desired+step*(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'))),0,extent);
     const prev=body.position.x;
     const entering=t<entranceDuration;
     if(entering){
       const progress=t/entranceDuration;
       body.position.x=entryX*(1-progress)*(1-progress);
     }else body.position.x+=T.MathUtils.clamp(desired-prev,-step,step);
     // The player picks the distance. Grandma cuts toward the nearest dish in depth.
     let nearest=null,gap=Infinity;
     for(const p of pieces){
       if(p.state!=='loose')continue;
       const dx=Math.abs(p.mesh.position.x-body.position.x);
       if(dx<gap){nearest=p;gap=dx}
     }
     if(nearest&&!entering)body.position.z+=T.MathUtils.clamp(nearest.mesh.position.z-body.position.z,-step,step);
     const running=entering||Math.abs(prev-body.position.x)>.01;
     const stride=running?Math.sin(t*31):0;
     body.position.y=running?Math.abs(stride)*.24:chew*.35;
     body.rotation.z=running?-.34*Math.sign(body.position.x-prev):0;
     body.rotation.y=running?.55*Math.sign(body.position.x-prev):0;
     grandma.arms.forEach((arm,i)=>arm.rotation.x=(i?1:-1)*stride*.98);
     grandma.feet.forEach((foot,i)=>{foot.position.z=.06+(i?1:-1)*stride*.23;foot.position.y=.1+Math.max(0,(i?1:-1)*stride)*.18});
     grandma.mouth.scale.y=entering?.12:.035+chew*.15;
     if(running&&t>=dustTime){kickDust(body.position);dustTime=t+.085}
     for(const p of pieces){
       if(p.state==='loose'){
         if(p.landed){
           p.state='missed';missed++;
           if(t>=nextComplaint){
             say(['ああっ、もったいない！','その手はお箸に使いな！','畳に食べさせてどうすんの！'][(missed-1)%3]);
             nextComplaint=t+1.35;
           }
           status.textContent=names[p.id]+'が落ちた！　食べた '+eaten+'品・落とした '+missed+'品';
           continue;
         }
         const {x,y}=p.mesh.position;
         if(p.descending && y<=1.65 && Math.abs(p.mesh.position.z-body.position.z)<=1 && x>=Math.min(prev,body.position.x)-settings.reach && x<=Math.max(prev,body.position.x)+settings.reach){
           p.state='eating';p.bite=t;p.from.copy(p.mesh.position);eaten++;chew=.42;
           p.line.geometry.setDrawRange(0,0);
           status.textContent=names[p.id]+'をぱくり！　'+eaten+'／'+pieces.length+'品';
         }
       }
       if(p.state==='eating'){
         const u=Math.min(1,(t-p.bite)/.3);
         p.mesh.position.lerpVectors(p.from,point.set(body.position.x,body.position.y+1.04,body.position.z+.3),u);
         p.mesh.scale.copy(p.scale).multiplyScalar(1-u);
         if(u===1){p.mesh.visible=false;p.state='done'}
       }
     }
     drawTrack();
     if(pieces.every(p=>p.state==='done'||p.state==='missed')){
       active=false;grandma.mouth.scale.y=.035;
       say(missed?'来年は座って食べるよ！':'全部食べたよ。次はお皿でおくれ！');
       onFinish(eaten,missed);
     }
   }
 };
}
