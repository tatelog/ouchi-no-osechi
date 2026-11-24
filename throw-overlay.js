export function throwOverlay(T,stage,camera){
 const canvas=document.createElement('canvas');
 canvas.className='throw-overlay';
 canvas.setAttribute('aria-hidden','true');
 stage.append(canvas);
 const g=canvas.getContext('2d'),projected=new T.Vector3(),hits=[];
 let width=1,height=1;
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function resize(){
   width=Math.max(1,stage.clientWidth);height=Math.max(1,stage.clientHeight);
   const ratio=Math.min(devicePixelRatio,2);
   canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
   g.setTransform(ratio,0,0,ratio,0,0);
 }
 const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 function screen(x,y,z){
   projected.set(x,y,z).project(camera);
   return [(projected.x+1)*width/2,(1-projected.y)*height/2,projected.z];
 }
 function line(points,color,weight){
   g.beginPath();g.moveTo(...points[0].slice(0,2));
   for(const p of points.slice(1))g.lineTo(p[0],p[1]);
   g.strokeStyle=color;g.lineWidth=weight;g.stroke();
 }
 function aim(degrees,baseY){
   const rad=degrees*Math.PI/180;
   const origin=screen(0,baseY,0),tip=screen(2.15*Math.cos(rad),baseY+2.15*Math.sin(rad),0);
   if(origin[2]<-1||origin[2]>1)return;
   const base=screen(2.1,baseY,0),arc=[];
   for(let i=0;i<=14;i++){
     const a=rad*i/14;arc.push(screen(.85*Math.cos(a),baseY+.85*Math.sin(a),0));
   }
   g.setLineDash([4,4]);line([origin,base],'#463126',2);g.setLineDash([]);
   line(arc,'#fff5c8',5);line(arc,'#a63720',2);
   line([origin,tip],'#fff4d1',7);line([origin,tip],'#b43720',4);
   const dir=Math.atan2(tip[1]-origin[1],tip[0]-origin[0]);
   g.save();g.translate(tip[0],tip[1]);g.rotate(dir);g.fillStyle='#b43720';
   g.beginPath();g.moveTo(4,0);g.lineTo(-8,-5);g.lineTo(-8,5);g.closePath();g.fill();g.restore();
 }
 function bubble(hit,x,y){
   const rise=reduceMotion?0:9*hit.age;
   g.save();g.translate(x,y-rise);g.rotate(hit.tilt);
   g.globalAlpha=Math.min(1,(1.15-hit.age)*5);g.lineJoin='round';
   g.beginPath();g.moveTo(-9,-9);g.lineTo(0,0);g.lineTo(3,-9);
   g.bezierCurveTo(39,-8,42,-35,7,-37);g.bezierCurveTo(-34,-42,-46,-15,-9,-9);
   g.closePath();g.fillStyle='#fff7dd';g.strokeStyle='#45241c';g.lineWidth=2.5;g.fill();g.stroke();
   g.font='bold 17px klee,serif';g.fillStyle='#822a1d';g.textAlign='center';g.fillText(hit.word,-1,-17);
   g.restore();
 }
 return {
   land(p){
     hits.push({point:p.mesh.position.clone(),word:['ぽてっ','どすっ','ぺたっ','ぽんっ'][p.id%4],tilt:(p.id%5-2)*.04,age:0});
   },
   clear(){hits.length=0},
   dispose(){observer.disconnect()},
   draw(dt,deg,showAim,baseY,force){
     g.clearRect(0,0,width,height);
     if(showAim&&Number.isFinite(deg))aim(deg,baseY);
     const placed=[];
     for(let i=hits.length-1;i>=0;i--){
       const h=hits[i];h.age+=dt;
       if(h.age>=1.15){hits.splice(i,1);continue}
       const pos=screen(h.point.x,h.point.y+.12,h.point.z);
       if(Math.abs(pos[2])>1||pos[0]<0||pos[0]>width||pos[1]<0||pos[1]>height)continue;
       const x=Math.max(42,Math.min(width-42,pos[0])),y=Math.max(46,pos[1]);
       if(placed.some(([px,py])=>Math.abs(px-x)<74&&Math.abs(py-y)<38))continue;
       bubble(h,x,y);placed.push([x,y]);
     }
     if(!Number.isFinite(deg))return;
     g.font='bold 18px klee,serif';g.textAlign='left';
     const label='角度 '+Math.round(deg)+'°'+(force==null?'':'　力 '+Math.round(force*100)+'％');
     const w=g.measureText(label).width+22;
     g.fillStyle='#fff2d7';g.strokeStyle='#6f3424';g.lineWidth=2;
     g.beginPath();g.roundRect(9,9,w,33,10);g.fill();g.stroke();
     g.fillStyle='#702c1f';g.fillText(label,20,32);
   }
 };
}
