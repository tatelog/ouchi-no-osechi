let pickerExpansion=0;
function attachPickerHandle(sheet){
 const tray=content.querySelector('.board');
 const handle=document.createElement('button');
 handle.type='button';handle.className='picker-handle';
 handle.setAttribute('aria-label','料理一覧の高さ');handle.setAttribute('role','slider');
 handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin','0');handle.setAttribute('aria-valuemax','100');
 sheet.prepend(handle);
 function resize(value){
  pickerExpansion=Math.min(1,Math.max(0,value));
  tray.style.setProperty('--tray-scale',1-.6*pickerExpansion);
  handle.setAttribute('aria-valuenow',Math.round(100*pickerExpansion));
  handle.setAttribute('aria-valuetext','一覧の広さ '+Math.round(100*pickerExpansion)+'％')
 }
 resize(pickerExpansion);
 let gesture=null,ignoreClick=false;
 handle.onpointerdown=e=>{
  if(!e.isPrimary||e.button!==0)return;
  ignoreClick=false;
  gesture={id:e.pointerId,start:e.clientY,value:pickerExpansion,travel:tray.getBoundingClientRect().height*.6/(1-.6*pickerExpansion)};
  handle.setPointerCapture(e.pointerId)
 };
 handle.onpointermove=e=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  const delta=gesture.start-e.clientY;
  if(Math.abs(delta)>3)ignoreClick=true;
  if(ignoreClick)resize(gesture.value+delta/Math.max(1,gesture.travel))
 };
 handle.onlostpointercapture=()=>{gesture=null};
 handle.onpointercancel=()=>{if(gesture)resize(gesture.value);gesture=null;ignoreClick=true};
 handle.onclick=e=>{if(!ignoreClick||e.detail===0)resize(pickerExpansion>.5?0:1);ignoreClick=false};
 handle.onkeydown=e=>{
  const values={ArrowUp:pickerExpansion+.1,ArrowDown:pickerExpansion-.1,Home:0,End:1};
  if(e.key in values){e.preventDefault();resize(values[e.key])}
 }
}
