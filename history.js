const archiveDB = new Promise((resolve,reject)=>{
 const request=indexedDB.open('ouchi-osechi-history',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('meals',{keyPath:'id'});
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error);
});
let archiveQueue=Promise.resolve();
const fingerprints=new Map();
function hasProgress(d){
 return d && (d.step>0 || d.phase==='done' || d.tiers?.some(row=>row.some(id=>id!=null)));
}
function archiveMeal(d){
 if(!hasProgress(d))return;
 d.recordId??=crypto.randomUUID();
 const snapshot=structuredClone(d),fingerprint=JSON.stringify(snapshot);
 if(fingerprints.get(d.recordId)===fingerprint)return;
 fingerprints.set(d.recordId,fingerprint);
 const record={id:d.recordId,updated:Date.now(),meal:snapshot};
 archiveQueue=archiveQueue.then(async()=>{
  const db=await archiveDB;
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('meals','readwrite');
   tx.objectStore('meals').put(record);
   tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error)
  })
 }).catch(()=>{fingerprints.delete(record.id);notice('このブラウザーに記録を保存できませんでした')});
}
async function allMeals(){
 await archiveQueue;
 const db=await archiveDB;
 return new Promise((resolve,reject)=>{
  const read=db.transaction('meals').objectStore('meals').getAll();
  read.onsuccess=()=>resolve(read.result.sort((a,b)=>b.updated-a.updated));
  read.onerror=()=>reject(read.error)
 })
}
function migrateMeals(){
 for(const storageKey of ['wagaya-osechi-v1','wagaya-osechi-mihon-v1']){
  try{
   const saved=storageKey===key?state:JSON.parse(localStorage.getItem(storageKey));
   if(!saved||saved.historyImported)continue;
   for(const [slot,d] of Object.entries({...saved.drafts,previous:saved.previousAuto})){
    if(!hasProgress(d))continue;
    d.recordId??='旧記録-'+storageKey+'-'+slot;
    archiveMeal(d)
   }
   archiveQueue.then(async()=>{
    const records=await allMeals();
    if(Object.values({...saved.drafts,previous:saved.previousAuto}).filter(hasProgress).every(d=>records.some(r=>r.id===d.recordId))){
     saved.historyImported=true;
     if(storageKey===key)localStorage.setItem(key,JSON.stringify(state));
     else localStorage.setItem(storageKey,JSON.stringify(saved))
    }
   }).catch(()=>{});
  }catch{}
 }
}
async function showHome(){
 document.body.classList.add('at-home');document.body.classList.remove('choosing');
 content.innerHTML='<section class="home"><div class="home-choices"></div><h2>これまでのお重</h2><div class="meal-history" aria-live="polite"></div></section>';
 const list=content.querySelector('.meal-history');
 for(const [mode,title,sub,id] of [['auto','おすすめ','質問に答えてお重を作る',6],['hand','自分で詰める','好きな料理を選んで詰める',0]]){
  const b=button('',()=>{state.mode=mode;state.drafts[mode]=fresh(mode);selected=pending=null;filter=0;render()},'home-choice');
  b.innerHTML='<img alt="" src="./assets/servings/'+id+'.png"><span><strong>'+title+'</strong><small>'+sub+'</small></span><b aria-hidden="true">›</b>';content.querySelector('.home-choices').append(b)
 }
 try{
  const records=await allMeals();
  if(!records.length){list.textContent='作ったお重や途中の記録がここに並びます。';return}
  for(const record of records){
   const d=record.meal,status=d.phase==='done'?'完成':d.phase==='setup'?'質問の途中':'盛り付けの途中';
   const title=(d.mode==='auto'?'おすすめ':'自分で詰める')+' ・ '+status;
   const row=button('',()=>{state.mode=d.mode;state.drafts[d.mode]=structuredClone(d);selected=pending=null;filter=0;render()},'history-entry');
   const ids=d.tiers.flat().filter(v=>v!=null),caption=document.createElement('span'),details=document.createElement('small');
   caption.textContent=title;details.textContent=new Date(record.updated).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'　'+(d.phase==='setup'?'質問 '+(d.step+1)+' から':d.tiers.length+'段 ・ '+ids.length+'品');
   if(ids.length){const img=new Image();img.alt='';img.src=foodPath(ids[0]);row.append(img)}
   caption.append(details);row.append(caption);list.append(row)
  }
 }catch{list.textContent='このブラウザーでは保存記録を読み込めませんでした。'}
}
