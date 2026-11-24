const names='紅白かまぼこ 黒豆 べろべろ（えびす） ローストビーフ チーズ 昆布巻き 海老の旨煮 伊達巻 栗きんとん 数の子 田作り 紅白なます たたきごぼう いかにんじん からし蓮根 金時豆のでんぶ ぶりの照り焼き 焼き鮭 スモークサーモン 合鴨スモーク 生ハム かにのテリーヌ 黒オリーブ 焼き野菜のマリネ ちょろぎ 栗の渋皮煮 花にんじん くわいの含め煮 えびいもと棒だら 赤貝のがらん蒸し 白花豆の甘煮 わかさぎの甘露煮 干し柿 青梅の甘煮 鶏の三色巻き ミヌダル フルーツチーズ ドライフルーツのマリネ 穴子の八幡巻き 鶏松風 鮭の焼漬け 鶏つくね 錦玉子 酢れんこん いくら ほうれん草のごま和え しいたけの旨煮 鯛の昆布じめ'.split(' ');
const groups=['すべて','魚介','肉','野菜・豆','卵・乳製品','果物・木の実'];
const categories=[1,3,4,2,4,1,1,4,5,1,1,3,3,1,3,3,1,1,1,2,2,1,3,3,3,5,3,3,1,1,3,1,5,5,2,2,4,5,1,2,1,2,4,3,1,3,3,1];
names.push(...regionalDishes.map(d=>d.name));categories.push(...regionalDishes.map(d=>d.category));groups.push('ご当地');
const people=['ひとりで','夫婦・パートナーと','親と','子どもと','親も子どもも一緒に','親戚一同で','友人と'];
const sides=['おせちがメイン','お雑煮','お寿司・お刺身','お鍋・すき焼き','まだ決めていない'];
const wishes=['元気に暮らしたい','長生きしてほしい','子宝に恵まれたい','学びの多い年に','金運に恵まれたい','おまかせ'];
const tastes=['甘いもの','さっぱりしたもの','甘辛いもの','少しずつ全部'];
const tasteFoods=[[8,25,7,30,32,33,36],[11,43,23,44,47,18],[16,10,38,34,46,41],[]];
const questions=[
 ['かまぼこ、紅白交互に並べてた？',[0,0,0,0],['紅白交互','色ごとに','紅だけ','白だけ']],
 ['お正月の卵料理、見覚えがあるのは？',[2,7,42]],
 ['栗はどんな色だった？',[8,25]],
 ['黒豆の横に赤いくるくる、のってた？',[24,1],['ちょろぎも入れる','黒豆だけ']],
 ['細切りのにんじん、何と食べてた？',[11,13]],
 ['れんこん、どんな味が好き？',[14,43]],
 ['今年、お肉を一品足すなら？',[3,19,20,35]],
 ['チーズと一緒につまみたいのは？',[22,23,37]],
 ['お正月の焼き魚、どれに箸が伸びる？',[16,17,40]],
 ['お豆はどれが入ってた？',[1,15,30]],
 ['煮物の中で好きなのは？',[26,27,28,46]],
 ['甘辛い小魚、どんな食感だった？',[10,31],['カリッとした田作り','やわらかい甘露煮']],
 ['お正月に貝料理、食べてた？',[29]],
 ['甘い一品、どれを入れたい？',[32,33,25]],
 ['切り口がきれいな一品、選ぶなら？',[34,38,39]],
 ['今年はどのチーズをつまみたい？',[4,36]],
 ['海の幸をもう少し足すなら？',[44,47,21,18]],
 ['お肉の食感、好きなのは？',[41,3,39]],
 ['緑の野菜、何を添えたい？',[45,23,22]],
 ['今年のごちそう、どれにする？',[6,9,5]],
 ['彩りに添えるなら？',[26,44,33]]
];
// Attach regional preparations to compatible questions without changing saved choice indices.
const regionalTopics=[11,16,4,16,16,16,9,10,10,10,5,16,20,0,10,4,16,4,16,4,16,4,11,16,9,4,9,8,16,16,16,8,16,10,5,4,9,16,10,16,16,1,11,1,16,16,18,16,16,1,1,16,10,4,4,10,10];
regionalTopics.forEach((topic,i)=>{if(topic!==0)questions[topic][1].push(48+i)});
questions[4][0]='さっぱりした野菜料理、どれを食べたい？';
questions[16][0]='魚介のごちそう、どれをお重に入れたい？';
questions[11][0]='甘辛く煮た魚、どれが好き？';
questions[10][0]='野菜や豆腐を使った一品、好きなのは？';
questions[0][1].push(61);questions[0][2].push('小田原かまぼこ');
const referenceEntry=new URLSearchParams(location.search).get('style')==='mihon';
const key=referenceEntry?'wagaya-osechi-mihon-v1':'wagaya-osechi-v1',tierNames=['一の重','二の重','三の重'];
function fresh(mode){return {mode,step:0,person:0,side:[],wish:5,taste:3,phase:'setup',tiers:[],tier:0,seen:[],locks:[],kam:0}}
let state={mode:'auto',drafts:{}};
try{const old=JSON.parse(localStorage.getItem(key));if(old?.drafts&&['auto','hand'].includes(old.mode))state=old}catch{}
const content=document.querySelector('#content'),dialog=document.querySelector('#dialog'),inside=document.querySelector('#inside');
const composition=[3,0,43,26,1,4,2];
if(referenceEntry&&!state.drafts.hand){
 const d=fresh('hand');
 Object.assign(d,{phase:'edit',tier:1,tiers:[[7,0,9,6,1,8,5],composition.map(id=>id===2?null:id)],locks:[Array(7).fill(false),Array(7).fill(false)],seen:[[],[]]});
 state={mode:'hand',drafts:{hand:d}};
}
let filter=0,selected=null,pending=null,toastTimer;
function draft(){return state.drafts[state.mode]??=fresh(state.mode)}
function save(){archiveMeal(draft());try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function notice(s){const n=document.querySelector('#notice');n.textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.textContent='',2400)}
function foodPath(i){if(i>=48)return './assets/regional/'+i+'.webp';return './assets/'+([2,3,4,5].includes(i)?'art/':'servings/')+i+'.png'}
function regionalLabel(button,id){
 const regions={2:'北陸',13:'東北',14:'九州',15:'四国',28:'近畿',29:'中国',35:'沖縄',40:'甲信越'};
 const dish=regionalDishes[id-48],region=dish?.region||regions[id];if(!region)return;
 const tag=document.createElement('small');tag.className='region-tag';tag.textContent=region+(region==='北海道'?'':'地方')+'の方はコレ！';button.title=dish?dish.pref+'・'+dish.area:id===2?'石川県のべろべろ／富山県東部のべっこう（えべす）':region;
 button.classList.add('regional');button.append(tag)
}
function picture(i,k=draft().kam){if(i===0){let seq=[['pink','white','pink','white'],['pink','pink','white','white'],Array(4).fill('pink'),Array(4).fill('white')][k];return '<span class="kam">'+seq.map(x=>'<img src="./assets/art/'+x+'-slice.png" alt="">').join('')+'</span>'}return '<img class="food" src="'+foodPath(i)+'" alt="">'}
function button(label,fn,cls=''){const b=document.createElement('button');b.textContent=label;b.className=cls;b.onclick=fn;return b}
function ask(title,choices){inside.replaceChildren();const h=document.createElement('h2');h.textContent=title;inside.append(h);choices.forEach(x=>{const b=button(x[0],()=>{dialog.close();x[1]()},x[2]||'');if(x[3]!=null)b.insertAdjacentHTML('afterbegin',picture(x[3],x[4]??draft().kam));inside.append(b)});if(!dialog.open)dialog.showModal()}
function beginQuiz(){
 const previous=state.drafts.auto;
 if(previous?.tiers.length)state.previousAuto=previous;
 state.drafts.auto=fresh('auto');
}
if(!state.flowVersion){
 if(state.drafts.auto?.phase==='edit')beginQuiz();
 state.flowVersion=2;
}
function switchMode(m){
 if(m==='auto' && state.drafts.auto?.phase!=='setup')beginQuiz();
 state.mode=m;selected=pending=null;filter=0;render()}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
function render(){document.body.classList.remove('at-home');document.querySelectorAll('nav .control-art').forEach(el=>el.remove());const d=draft();document.body.classList.toggle('choosing',d.phase==='edit'||(d.mode==='hand'&&d.phase==='setup'));
 if(d.mode==='hand' && d.phase==='setup'){
 d.tiers=[Array(7).fill(null)];d.seen=[[]];d.locks=[Array(7).fill(false)];d.tier=0;d.phase='edit';
 }
 save();document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));content.replaceChildren();if(d.phase==='setup')setup();else if(d.phase==='done')result();else editor()}
const openingTopics=[0,1,4,8,6,15,19,2,5,9,10,11,12,14,3,7,13,16,17,18,20];
function tierCount(d){return Math.max(1,[1,1,2,2,3,3,2][d.person]-(d.side.some(x=>x===2||x===3)?1:0))}
function dishCount(d){return 7*tierCount(d)}
function completeOpening(){
 const d=draft();build();
 const priorities=d.tiers.flat();
 const chosen=openingTopics.slice(0,dishCount(d)).map((topic,n)=>{
   const k=d.answers?.[n];if(k==null)return null;
   if(topic===0 && k<4)d.kam=k;
   return questions[topic][1][k];
 });
 const used=new Set(chosen.filter(id=>id!=null));
 chosen.forEach((id,n)=>{
   const t=Math.floor(n/7),slot=n%7;
   if(id==null){id=priorities.find(v=>!used.has(v))??[...names.keys()].find(v=>!used.has(v));used.add(id)}
   d.tiers[t][slot]=id;d.locks[t][slot]=chosen[n]!=null;d.seen[t].push(openingTopics[n])
 });finish()
}
function openingPhoto(d){
 const n=d.step-4,[title,ids,labels]=questions[openingTopics[n]];
 content.innerHTML='<section class="setup"><div class="mini">'+(d.step+1)+' ／ '+(4+dishCount(d))+' ・ '+tierNames[Math.floor(n/7)]+' '+(n%7+1)+'品目</div><h2>'+title+'</h2><div class="options photos"></div><div class="actions"></div></section>';
 function answer(k){d.answers??=[];d.answers[n]=k;d.answers.length=n+1;if(n===dishCount(d)-1)completeOpening();else{d.step++;render()}}
 const opts=content.querySelector('.options'),actions=content.querySelector('.actions');
 const preferred=[[1,6,9,7,8,0][d.wish],...tasteFoods[d.taste]];const rank=id=>preferred.includes(id)?preferred.indexOf(id):100; ids.map((id,k)=>({id,k})).sort((a,b)=>rank(a.id)-rank(b.id)).forEach(({id,k})=>{const b=button(labels?.[k]||names[id],()=>answer(k));b.insertAdjacentHTML('afterbegin',picture(id,n===0&&k<4?k:d.kam));regionalLabel(b,id);opts.append(b)});
 actions.append(button('今回は選ばない',()=>answer(null)),button('ひとつ戻る',()=>{d.step--;render()}));
}
function setup(){const d=draft(),step=d.step;if(step>=4){openingPhoto(d);return}
const prompts=['今年のおせち、誰と食べる？','おせちのほかに、何を食べる？',d.person===0?'今年はどんな一年にしたい？':people[d.person].replace(/と$|で$/,'')+'と迎えるお正月。どんな願いを込めたい？','おせちで先に箸が伸びるのは？'];
const lists=[people,sides,wishes,tastes],fields=['person','side','wish','taste'];
content.innerHTML='<div class="setup"><div class="mini">'+(step+1)+' ／ '+(step<2?'基本の4問':4+dishCount(d))+'</div><h2>'+prompts[step]+'</h2><div class="options"></div><div class="actions"></div></div>';
const opts=content.querySelector('.options'),actions=content.querySelector('.actions');
if(step===0 && state.previousAuto)actions.append(button('前のお重を見る',()=>{state.drafts.auto=state.previousAuto;deselectPrevious();render()}));
function deselectPrevious(){delete state.previousAuto}
function next(){d.step++;render()}
lists[step].forEach((label,i)=>opts.append(button(label,()=>{d[fields[step]]=step===1?[i]:i;next()})));
if(step)actions.append(button('ひとつ戻る',()=>{d.step--;render()}))}
function build(){const d=draft(),n=tierCount(d);
const ids=[...new Set([[1,6,9,7,8,0][d.wish],...tasteFoods[d.taste],0,1,7,6,8,9,5,11,16,3,2,4,26,27,12,34,10,43,14,15,13,19,25,36,38,42,31,...names.keys()])];d.tiers=Array.from({length:n},(_,t)=>Array.from({length:7},(_,i)=>d.mode==='auto'?ids[t*7+i]:null));d.locks=d.tiers.map(row=>row.map(()=>false));d.seen=d.tiers.map(()=>[]);d.phase='edit'}
// Source-photo proportions let the serving adapt when a dish moves to another pocket.
const photoRatios=[2.563,1.092,1.847,2.071,2.067,2.116,1.096,1.073,1.057,1.374,1.383,1.176,1.136,1.144,1.036,1.241,1.19,1.511,1.188,1.138,1.116,1.204,1.144,1.189,1.196,1.228,1.154,1.017,1.352,1.299,1.282,1.624,1.006,1.213,1.301,1.257,0.918,0.922,0.964,0.954,0.918,0.935,0.939,0.913,0.973,1.087,0.936,1.017];
function arrangeTray(row){
 const rects=row.length===7
   ? [[2.8,2.8,61,36],[3.2,25.4,30,46],[30.2,35.4,33.7,44.6],[58.5,29.6,38.3,38.3],[3.7,61.4,51.5,30],[52.7,56.2,43.2,35.4],[63,4,33,29]]
   : [[3,3,39,33],[39,3,29,35],[65,3,32,34],[3,31,32,36],[31,31,39,39],[66,32,31,39],[3,62,36,29],[36,64,31,27],[64,65,33,26]];
 return rects.map(([x,y,w,h])=>({x,y,w,h}));
}
function board(t,interactive){
 const d=draft(),row=d.tiers[t],layout=arrangeTray(row),el=document.createElement('div');
 el.className='board packed';const interior=document.createElement('div');interior.className='tray-interior';el.append(interior);
 row.forEach((id,i)=>{
   const pocket=layout[i],b=document.createElement(interactive?'button':'div');
   b.className='slot'+(id==null?' empty':'')+(interactive&&selected===i?' mark':'');
   b.dataset.dish=id;b.setAttribute('aria-label',(i+1)+'区画 '+(names[id]||'空き'));
   Object.assign(b.style,{left:pocket.x+'%',top:pocket.y+'%',width:pocket.w+'%',height:pocket.h+'%'});
   const matchesPhoto=row.length===7 && row.slice(0,6).every((dish,n)=>dish===composition[n]) && d.kam===0;
   if(id==null)b.textContent=interactive?'＋':'';
   else if(matchesPhoto && i<6)b.innerHTML='<img class="whole-portion" alt="" src="./assets/art/plated-'+id+'.png" style="inset:0;width:100%;height:100%">';
   else b.innerHTML=packServing(id,d.kam,pocket);
   if(interactive)b.onclick=()=>slot(i);interior.append(b)
 });
 // A second layer fills the back of each occupied pocket, like pieces tucked beneath the front row.
 const underlay=document.createElement('div');underlay.className='tray-depth';underlay.setAttribute('aria-hidden','true');
 row.forEach((id,i)=>{
   if(id==null)return;
   const p=layout[i],pad=4;
   const group=document.createElement('div');group.className='under-serving';
   Object.assign(group.style,{left:(p.x-pad)+'%',top:(p.y-pad)+'%',width:(p.w+pad*2)+'%',height:(p.h+pad*2)+'%'});
   group.innerHTML=packServing(id,d.kam,p);underlay.append(group);
 });
 interior.append(underlay);return el
}
function packServing(id,k,pocket){
 const aspect=pocket.w*600/(pocket.h*520);
 if(id===0){
   const colors=[['pink','white','pink','white','pink','white'],['pink','pink','pink','white','white','white'],Array(6).fill('pink'),Array(6).fill('white')][k];
   const side=aspect>1.25;
   return colors.map((color,i)=>portionImage('./assets/art/'+color+'-slice.png',side?51:90,side?89:61,side?i*9:4,side?5:i*8)).join('');
 }
 const ratio=regionalDishes[id-48]?.ratio||photoRatios[id],wide=aspect>ratio;
 const count=Math.min(3,Math.max(1,Math.round(Math.max(aspect/ratio,ratio/aspect)*1.2)));
 const width=wide?Math.min(100,100*ratio/aspect):100;
 const height=wide?100:Math.min(100,100*aspect/ratio);
 return Array.from({length:count},(_,i)=>{
   const fraction=count===1?.5:i/(count-1);
   return portionImage(foodPath(id),width,height,(100-width)*fraction,(100-height)*fraction)
 }).join('')
}
function portionImage(src,w,h,x,y){
 return '<img class="whole-portion" draggable="false" alt="" src="'+src+'" style="width:'+w+'%;height:'+h+'%;left:'+x+'%;top:'+y+'%">'
}
function editor(){const d=draft();let tabs=document.createElement('div');tabs.className='tabs';d.tiers.forEach((_,t)=>tabs.append(button(tierNames[t],()=>{d.tier=t;selected=pending=null;render()},t===d.tier?'active':'')));if(d.tiers.length<3)tabs.append(button('＋ 段',()=>{d.tiers.push(Array(7).fill(null));d.locks.push(Array(7).fill(false));d.seen.push([]);d.tier=d.tiers.length-1;selected=pending=null;render()}));
tabs.append(button('やり直し',()=>ask(tierNames[d.tier]+'を空にして詰め直しますか？',[
 ['戻る',()=>{}],['この段を空にする',()=>{
  d.tiers[d.tier].fill(null);d.locks[d.tier].fill(false);d.seen[d.tier]=[];
  selected=pending=null;render()
 }]
]),'restart'),button('完成',finish,'finish'));content.append(tabs,board(d.tier,true));
if(pending!=null){const h=document.createElement('p');h.className='hint';h.textContent='入れ替えたい区画をタップ';content.append(h)}
if(selected!=null&&d.tiers[d.tier][selected]!=null){const a=document.createElement('div');a.className='actions';a.append(button('この品を外す',()=>{put(selected,null);selected=null;render()}));content.append(a)}
const sheet=document.createElement('section');sheet.className='sheet';sheet.innerHTML='<h2>料理を選ぶ</h2><div class="filters"></div><div class="grid"></div>';content.append(sheet);groups.forEach((g,i)=>sheet.querySelector('.filters').append(button(g,()=>{filter=i;render()},filter===i?'active':'')));sheet.querySelector('.filters .active')?.scrollIntoView({block:'nearest',inline:'nearest'});const grid=sheet.querySelector('.grid');[2,3,4,5,...Array.from(names.keys()).filter(i=>![2,3,4,5].includes(i))].forEach(i=>{const name=names[i];if(filter===6 ? !(i>=48||[2,13,14,15,28,29,35,40].includes(i)) : filter&&categories[i]!==filter)return;const b=button('',()=>choose(i,b),'card');b.dataset.included=d.tiers[d.tier].includes(i);b.innerHTML=picture(i)+'<span>'+name+'</span>'+(d.tiers[d.tier].includes(i)?'<span class="check">✓</span>':'');regionalLabel(b,i);grid.append(b)});drawPickerButtons();attachPickerHandle(sheet)}
function drawPickerButtons(){
 const ns='http://www.w3.org/2000/svg';
 function element(tag,attrs){
  const node=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
  return node;
 }
 for(const b of document.querySelectorAll('nav button,#content button')){
  const svg=element('svg',{class:'control-art','aria-hidden':'true',focusable:'false',width:'100%',height:'100%'});
  const slot=b.classList.contains('slot'),card=b.classList.contains('card'),active=b.classList.contains('active');
  const checked=b.dataset.included==='true';
  if(!slot || b.classList.contains('mark')){
   svg.append(element('rect',{x:'1%',y:'2%',width:'98%',height:'96%',rx:card?8:12,fill:slot?'none':active?'#aa3822':'#f8e8c9','fill-opacity':active?1:.74,stroke:checked||slot?'#ac3d24':'#ba946e','stroke-dasharray':checked||slot?'5 2':'2 1'}));
   if(!slot)svg.append(element('rect',{x:'1%',y:'2%',width:'98%',height:'96%',rx:card?8:12,fill:'url(#crayon-grain)'}));
  }
  if(!slot){
   const title=card?b.querySelector('span:not(.kam,.check)').textContent:b.textContent;
   const label=element('text',{x:'50%',y:card?'100%':'50%',dy:card?'-.45em':'.35em','text-anchor':'middle',fill:active?'#fff7e9':'#39271b'});
   label.textContent=title;svg.append(label);
   if(checked){svg.append(element('circle',{cx:'92%',cy:15,r:10,fill:'#a63822'}));const tick=element('text',{x:'92%',y:19,'text-anchor':'middle',fill:'white','font-size':13});tick.textContent='✓';svg.append(tick)}
   b.setAttribute('aria-label',title+(b.querySelector('.region-tag')?'　'+b.querySelector('.region-tag').textContent:''));
  }
  b.append(svg);
 }
}
function put(index,id){const d=draft();d.tiers[d.tier][index]=id;d.locks[d.tier][index]=id!=null}
function slot(i){const d=draft(),row=d.tiers[d.tier];if(pending!=null){const id=pending;selected=i;const card=[...content.querySelectorAll('.card')].find(b=>b.querySelector('span:not(.kam,.check)')?.textContent===names[id]);if(card)choose(id,card);else{put(i,id);pending=selected=null;render()}return}
if(selected!=null){const s=selected,locks=d.locks[d.tier];[row[s],row[i]]=[row[i],row[s]];[locks[s],locks[i]]=[locks[i],locks[s]];selected=null}else selected=i;render()}
function choose(id,card){if(pending===id&&selected==null){pending=null;render();return}const d=draft(),i=selected??d.tiers[d.tier].indexOf(null);if(i<0){pending=id;render();notice('入れ替える料理を選んでください');return}const start=card.getBoundingClientRect(),end=content.querySelectorAll('.board .slot')[i].getBoundingClientRect(),grid=card.parentElement,offset=grid.scrollTop;put(i,id);selected=pending=null;render();content.querySelector('.grid').scrollTop=offset;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const target=content.querySelectorAll('.board .slot')[i],ghost=document.createElement('div');ghost.className='flight';ghost.innerHTML=picture(id);Object.assign(ghost.style,{left:end.x+'px',top:end.y+'px',width:end.width+'px',height:end.height+'px'});document.body.append(ghost);const dx=start.x+start.width/2-end.x-end.width/2,dy=start.y+start.height/2-end.y-end.height/2;target.style.opacity='0';ghost.animate([{transform:'translate('+dx+'px,'+dy+'px) scale(.85)'},{transform:'translate('+dx*.55+'px,'+(dy*.35-30)+'px) rotate(-8deg)'},{transform:'none'}],{duration:480,easing:'ease-out'}).finished.finally(()=>{ghost.remove();target.style.opacity=''})}
function more(){const d=draft(),t=d.tier,seen=d.seen[t],index=Array.from({length:questions.length},(_,i)=>(i+t*6)%questions.length).find(i=>!seen.includes(i));if(index==null){pauseMenu();return}
const [title,ids,labels]=questions[index];function answer(id,k){seen.push(index);if(id!=null){const row=d.tiers[t],locks=d.locks[t];let dest=row.indexOf(id);if(dest<0)dest=row.findIndex(v=>v==null);if(dest<0)dest=locks.lastIndexOf(false);if(dest<0){pending=id;render();notice('入れ替えたい区画を選んでください');return}put(dest,id);if(index===0)d.kam=k}render();pauseMenu()}
ask(title,[...ids.map((id,k)=>[labels?.[k]||names[id],()=>answer(id,k),'choice',id,index===0?k:undefined]),['覚えていない・今回は見送る',()=>answer(null)],['残りはおまかせで完成',finish]])}
function pauseMenu(){const d=draft(),t=d.tier,opts=[];if(d.seen[t].length<questions.length)opts.push(['もう少し選ぶ',more,'primary']);if(t<d.tiers.length-1)opts.push([tierNames[t+1]+'へ',()=>{d.tier++;render();more()}]);opts.push(['お重を見る',render],['残りはおまかせで完成',finish]);ask(tierNames[t]+'、どうする？',opts)}
function finish(){const d=draft();if(!d.tiers.some(r=>r.some(i=>i!=null))){notice('まず一品、選んでください');return}d.phase='done';selected=pending=null;render();shareMenu()}
function result(){
 const d=draft(),el=document.createElement('section');el.className='result overview';
 el.innerHTML='<div class="result-heading"><h2>おうちのおせち、完成</h2></div><div class="all-tiers"></div><div class="actions"></div>';
 el.querySelector('.result-heading').append(button('Xで投稿',shareMenu,'primary'));
 const gallery=el.querySelector('.all-tiers');gallery.dataset.count=d.tiers.length;
 d.tiers.forEach((row,t)=>{const figure=document.createElement('figure'),label=document.createElement('figcaption');label.textContent=tierNames[t];figure.append(label,board(t,false));gallery.append(figure)});
 el.querySelector('.actions').append(button('詰め方を変える',()=>{d.recordId=crypto.randomUUID();d.phase='edit';render()}),button('新しく作る',()=>ask('このモードのお重を作り直す？',[['戻る',()=>{}],['新しく作る',()=>{state.drafts[state.mode]=fresh(state.mode);filter=0;render()}]])));
 el.querySelector('.actions').append(button('お粗末にする',()=>openTableFlip(false)),button('お粗末にしない',()=>openTableFlip(true)));
 content.append(el)
}
function shareMenu(){
 const text='おうちのおせちが完成！ '+draft().tiers.length+'段重にしました。 #おうちのおせち';
 showXShare(text,createTrayImage,'おうちのおせち.png');
}
function showXShare(text,createImage,filename){
 const openX=()=>window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
 let file;
 function manual(){
  ask('画像を添えてXで投稿',[
   ['画像を保存',()=>{const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);manual()}],
   ['Xの投稿画面へ',openX],['戻る',()=>showXShare(text,createImage,filename)]]);
  const p=document.createElement('p');p.textContent='画像を保存して、Xの投稿画面で添付してください。';inside.querySelector('h2').after(p)
 }
 async function withImage(){
  const payload={files:[file],text};
  try{
   if(navigator.canShare?.(payload)){await navigator.share(payload);return}
  }catch(err){if(err.name==='AbortError')return}
  manual()
 }
 ask('Xで投稿',[['画像付き',withImage],['テキストのみ',openX],['閉じる',()=>{}]]);
 const summary=document.createElement('p');summary.textContent=text.replace(/\s*#おうちのおせち$/,'');summary.style.whiteSpace='pre-line';inside.querySelector('h2').after(summary);
 const imageButton=inside.querySelector('button');imageButton.disabled=true;
 createImage().then(blob=>{file=new File([blob],filename,{type:'image/png'});imageButton.disabled=false}).catch(()=>{imageButton.textContent='画像を準備できませんでした'})
}
async function createTrayImage(){
 const boards=[...document.querySelectorAll('.result .board')],tray=new Image();tray.src='./assets/art/tray.webp';await tray.decode();
 const canvas=document.createElement('canvas');canvas.width=840;canvas.height=80+boards.length*715;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#f8ebd5';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#39291d';ctx.textAlign='center';ctx.font='38px klee,serif';ctx.fillText('おうちのおせち',420,56);
 for(const [t,el] of boards.entries()){
  const y=80+t*715;ctx.fillText(tierNames[t],420,y+38);ctx.save();ctx.translate(40,y+48);ctx.drawImage(tray,0,0,760,659);
  ctx.beginPath();ctx.roundRect(26,21,708,540,18);ctx.clip();
  const box=el.getBoundingClientRect(),sx=760/box.width,sy=659/box.height;
  for(const img of [...el.querySelectorAll('.tray-depth img'),...el.querySelectorAll('.slot img')]){
   await img.decode();const r=img.getBoundingClientRect(),fit=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight),w=fit*img.naturalWidth,h=fit*img.naturalHeight;
   ctx.drawImage(img,(r.x-box.x+(r.width-w)/2)*sx,(r.y-box.y+(r.height-h)/2)*sy,w*sx,h*sy)
  }ctx.restore()
 }
 const blob=await new Promise(resolve=>canvas.toBlob(resolve));if(!blob)throw Error();return blob
}
document.querySelector('.title-home').onclick=event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();showHome();
};
migrateMeals();
if(referenceEntry)render();else showHome();
function serving(id,k){
 if(id===0){
 const seq=[['pink','white','pink','white','pink','white'],['pink','pink','pink','white','white','white'],Array(6).fill('pink'),Array(6).fill('white')][k];
 return '<span class="fan">'+seq.map((s,i)=>'<img alt="" style="--slice:'+i+'" src="./assets/art/'+s+'-slice.png">').join('')+'</span>'
 }
 const image='<img alt="" draggable="false" src="'+foodPath(id)+'">';
 return '<span class="portion" aria-hidden="true">'+image+'</span>'
}







